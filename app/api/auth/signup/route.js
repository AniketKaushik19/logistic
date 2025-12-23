import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'logisticSecretKey';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('logisticdb');

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      name,
      email,
      role:"viewer",
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword._id = result.insertedId;

    // Generate JWT token
    const token = jwt.sign({ id: userWithoutPassword._id, email: userWithoutPassword.email }, JWT_SECRET, {
      expiresIn: '1d'
    });

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword, token },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong', details: error.message },
      { status: 500 }
    );
  }
}