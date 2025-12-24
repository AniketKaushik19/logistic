# Logistic Management System - AI Agent Instructions

## Architecture Overview

This is a **Next.js 16 logistics management app** using:
- **Frontend**: React 19 with TailwindCSS v4 + shadcn UI components
- **Backend**: Next.js API routes with MongoDB + Mongoose
- **Auth**: JWT tokens stored in `httpOnly` cookies, verified via middleware
- **Pattern**: SSR/SSG with client-side React components for interactive UI

### Key Data Flow
1. **Auth**: Login → JWT token set in `auth_token` cookie → Middleware validates on protected routes
2. **Protected Routes**: `/consignment`, `/dashboard`, `/vehicle`, `/track`, `/profit` require valid JWT
3. **API Pattern**: All API routes in `app/api/**/*.js` call `requireAuth()` to verify JWT before accessing data
4. **Database**: MongoDB with collections: `consignments`, `counters`, `expenses`, `vehicles`, `users`

---

## Critical Authentication & Protected Routes Pattern

### Auth Context Setup (app/context/AuthContext.jsx)
```javascript
// Client-side auth state management
const { user, loading, refreshAuth } = useAuth();
// After successful login: await refreshAuth() before route.push()
```

### Protected Route Fix (IMPORTANT)
After login API succeeds, **must call `refreshAuth()` and wait** before navigating:
```javascript
const response = await fetch("/api/auth/login", { credentials: "include" });
if (response.ok) {
  await refreshAuth(); // ← Update context with new JWT
  await new Promise(resolve => setTimeout(resolve, 300)); // Brief delay
  router.push("/consignment/list");
}
```

### Middleware Protection (middleware.js)
- **Define protected paths** in `protectedPaths` array
- **Token validation**: `jwt.verify(token, process.env.JWT_SECRET)`
- **Invalid token**: Delete cookie & redirect to `/login`
- **Matcher config**: Must list all protected routes in `config.matcher`

### API Route Auth (lib/auth.js)
Every API endpoint calls `requireAuth()` at start:
```javascript
import { requireAuth } from "@/lib/auth";
export async function GET() {
  requireAuth(); // Throws if no valid token
  // proceed with data fetch
}
```

---

## Database & API Patterns

### MongoDB Collections Structure
- **consignments**: `{ cn, status, origin, destination, weight, createdAt }`
  - Auto-increment: Uses `counters` collection with atomic `$inc` operator
  - ID format: `ALC-{seq}` (e.g., `ALC-1001`)
- **vehicles**: `{ vehicleNumber, type, capacity, driver, expenses }`
- **expenses**: `{ vehicleId, amount, category, date }`
- **counters**: Singleton document `{ _id: "consignment", seq: 1000 }`

### API Route Conventions
1. All routes use `clientPromise` from `lib/mongodb.js` for MongoDB connection
2. **CRUD by HTTP method**: GET (read), POST (create), PUT/PATCH (update), DELETE
3. **Error responses**: `{ error: "message" }` with appropriate status codes
4. **Success responses**: Return data directly or `{ success: true }`

### Atomic Counter Pattern (consignment/route.js)
```javascript
// Ensure counter exists
await counters.updateOne(
  { _id: "consignment" },
  { $setOnInsert: { seq: 1000 } },
  { upsert: true }
);
// Atomic increment and retrieve
const counter = await counters.findOneAndUpdate(
  { _id: "consignment" },
  { $inc: { seq: 1 } },
  { returnDocument: "after" }
);
```

---

## UI/UX Patterns

### Form & Input Components
- Use shadcn UI: `Button`, `Input`, `Card`, `Label`, `Dialog`
- Error display: Red background banner with `AlertCircle` icon
- Loading state: Spinner inside button with disabled state
- Toast notifications: `react-hot-toast` for success/error messages

### Animations & Styling
- **Framer Motion**: Staggered animations with `initial`, `animate`, `transition`
- **TailwindCSS v4**: Gradients, shadows, rounded corners, focus rings
- **Color scheme**: Blue/Indigo for login, Emerald/Teal for signup
- **Responsive**: Mobile-first with `max-w-md` containers, `p-4` padding on small screens

### Common Patterns
```javascript
// Staggered form fields
<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} />

// Button loading state
disabled={loading}
{loading ? <div className="animate-spin" /> : 'Submit'}

// Error handling
{error && <div className="bg-red-50 border border-red-200">{error}</div>}
```

---

## File Structure & Key Patterns

### Route Groups (Group-based organization)
- `app/(auth)/` - Public auth pages (login, signup)
- `app/consignment/` - Consignment management pages
- `app/dashboard/` - Analytics & reports
- `app/vehicle/` - Vehicle management
- `app/track/` - Consignment tracking

### API Routes Organization
```
app/api/
├── auth/ → login, signup, me, logout
├── consignment/ → [id] for single item operations
├── vehicle/ → vehicle CRUD
├── dashboard/ → analytics/reporting
├── expense/ → expense tracking
├── profit/ → profit calculations
└── track/ → tracking by consignment number
```

### Components
- **UI components** (`components/ui/`): Shadcn components (reusable, styled)
- **Page components** (`_components/`): Navbar, Footer (layout-level)
- **Feature components** (`app/components/`): Dashboard, EditVehicle (page-specific)

---

## Environment & Deployment

### Required Environment Variables
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password123
NODE_ENV=development|production
```

### Build & Run Commands
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Run ESLint
```

### Middleware Runtime Note
Auth routes need `"use client"` in page components but middleware in `middleware.js` is server-side. The `/api/auth/me` route includes `export const runtime = "nodejs"` for proper cookie handling.

---

## Common Development Tasks

### Adding a New Protected Route
1. Create route folder (e.g., `app/newfeature/page.js`)
2. Add to `middleware.js` `protectedPaths` array
3. Add to middleware `config.matcher`
4. Create corresponding API endpoint with `requireAuth()` check
5. Use `useAuth()` hook in client component to check `user` state

### Creating an API Endpoint
```javascript
// app/api/resource/route.js
import { requireAuth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  requireAuth(); // ← Always first
  const client = await clientPromise;
  const db = client.db("logisticdb");
  // Your logic here
  return Response.json(data);
}
```

### Updating Auth State After Data Changes
Use `refreshAuth()` after operations that should update user state:
```javascript
const { refreshAuth } = useAuth();
// after successful mutation
await refreshAuth();
```

---

## Common Pitfalls to Avoid

1. **Forget `credentials: "include"`** in fetch → Cookie won't be sent → Auth fails
2. **Missing `refreshAuth()` after login** → User state stays null → Protected routes still blocked
3. **Forget to call `requireAuth()`** in API routes → Bypass authentication
4. **Invalid middleware matcher** → Routes not checked by middleware
5. **Wrong redirect path after signup** → Use `/login` not `/auth/login`
6. **Not awaiting `cookies()`** in `/api/auth/me` → Cookie parsing fails (Next.js 15+)

---

## Testing & Validation

- **Login test**: Email/password from env vars (ADMIN_EMAIL, ADMIN_PASSWORD)
- **Protected routes**: Try accessing `/consignment` without token → should redirect to `/login`
- **Token expiry**: JWT expires in `1d` (24 hours) - extend if needed
- **Cookie storage**: Use browser DevTools → Application → Cookies to verify `auth_token` is `httpOnly`
