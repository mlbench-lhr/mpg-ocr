import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// In-memory store for OTPs (replace with a database for production)
const otpStore: Record<string, string> = {};

// POST route to verify OTP
export async function POST(req: NextRequest) {
    const { email, otp }: { email: string; otp: string } = await req.json();

    // Check if the OTP matches
    if (otpStore[email] === otp) {
        // OTP is correct, generate a JWT token
        const token = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        return NextResponse.json({ message: 'OTP verified successfully.', token }, { status: 200 });
    } else {
        return NextResponse.json({ message: 'OTP verification failed.' }, { status: 400 });
    }
}
