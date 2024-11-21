import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MongoClient } from 'mongodb';

// MongoDB client setup
const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017'); // Replace with your MongoDB URI
const dbName = 'my-next-app';  // Database name
const collectionName = 'otps';  // Collection name

// POST route to send OTP
export async function POST(req: NextRequest) {
    const { email }: { email: string } = await req.json();

    // Validate email format
    const emailError = validateEmail(email);
    if (emailError) {
        return NextResponse.json({ message: emailError }, { status: 400 });
    }

    // Check if OTP already exists in the database for this email
    const otpData = await checkOtpExists(email);
    if (otpData) {
        const currentTime = Date.now();
        const timeDifference = (currentTime - otpData.timestamp) / 1000; // time in seconds

        // If OTP exists and is within 60 seconds, deny sending another OTP
        if (timeDifference < 60) {
            return NextResponse.json({ message: 'OTP already sent. Please wait for 1 minute.' }, { status: 400 });
        }
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store or update OTP and timestamp in the database
    await saveOrUpdateOtp(email, otp);

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
            from: process.env.EMAIL_USER,  
            to: email, 
            subject: 'Your OTP Code',
            text: `Your OTP is: ${otp}`,
        });

        return NextResponse.json({ message: 'OTP sent to your email!' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to send OTP!' }, { status: 500 });
    }
}

// Email validation function
function validateEmail(email: string) {
    const regex = /\S+@\S+\.\S+/;
    if (!email) return "Email is required.";
    if (!regex.test(email)) return "Please enter a valid email address.";
    return null;
}

// Check if OTP exists for the email in the database
async function checkOtpExists(email: string) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const otpData = await collection.findOne({ email });
        return otpData;
    } finally {
        await client.close();
    }
}

// Save or update OTP and timestamp in the database
async function saveOrUpdateOtp(email: string, otp: string) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const timestamp = Date.now();
        const otpData = { email, otp, timestamp };

        // Update if exists, otherwise insert new OTP
        await collection.updateOne(
            { email },
            { $set: otpData },
            { upsert: true } // Insert if no document exists for the email
        );
    } finally {
        await client.close();
    }
}
