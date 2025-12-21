import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('logisticdb');

    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    const token = jwt.sign({ id: user._id, username: user.name }, JWT_SECRET, {
    expiresIn: "1d" // token expiry
  });
    return NextResponse.json(
      { message: 'Login successful', token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong', details: error.message },
      { status: 500 }
    );
  }
}