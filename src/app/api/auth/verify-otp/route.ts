import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

// MongoDB client setup
const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017'); // Replace with your MongoDB URI
const dbName = 'my-next-app';  // Database name
const collectionName = 'otps';  // Collection name

// POST route to verify OTP
export async function POST(req: NextRequest) {
    const { email, otp }: { email: string; otp: string } = await req.json();

    // Retrieve OTP from the database for the given email
    const otpData = await getOtpFromDb(email);
    if (!otpData) {
        return NextResponse.json({ message: 'OTP not found or expired.' }, { status: 400 });
    }

    // Check if the OTP matches
    if (otpData.otp === otp) {
        // OTP is correct, generate a JWT token
        const token = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        return NextResponse.json({ message: 'OTP verified successfully.', token }, { status: 200 });
    } else {
        return NextResponse.json({ message: 'OTP verification failed.' }, { status: 400 });
    }
}

// Function to retrieve OTP from MongoDB based on email
async function getOtpFromDb(email: string) {
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
