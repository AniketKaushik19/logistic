import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  // swcMinify removed (no longer needed)
  turbopack: {}, // ensures Turbopack runs without errors
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);