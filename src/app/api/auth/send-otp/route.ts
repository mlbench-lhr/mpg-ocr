import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// In-memory store for OTPs (replace with a database in production)
const otpStore: Record<string, string> = {};

// POST route to send OTP
export async function POST(req: NextRequest) {
    const { email }: { email: string } = await req.json();

    // Validate email format
    const emailError = validateEmail(email);
    if (emailError) {
        return NextResponse.json({ message: emailError }, { status: 400 });
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP temporarily in memory (use a database in production)
    otpStore[email] = otp;

    // Set up the transporter using Gmail (you can use a different email service)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Replace with your Gmail address
            pass: process.env.EMAIL_PASS,  // Replace with your Gmail password or app-specific password
        },
    });

    try {
        // Send OTP email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,  // Sender address
            to: email,  // Receiver address
            subject: 'Your OTP Code',
            text: `Your OTP is: ${otp}`,
        });

        return NextResponse.json({ message: 'OTP sent to your email.' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to send OTP.' }, { status: 500 });
    }
}

// Email validation function
function validateEmail(email: string) {
    const regex = /\S+@\S+\.\S+/;
    if (!email) return "Email is required.";
    if (!regex.test(email)) return "Please enter a valid email address.";
    return null;
}
