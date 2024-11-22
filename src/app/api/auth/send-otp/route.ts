import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
const dbName = 'my-next-app';
const usersCollection = 'users';
const otpCollection = 'otps';

export async function POST(req: NextRequest) {
    const { email }: { email: string } = await req.json();

    const emailError = validateEmail(email);
    if (emailError) {
        return NextResponse.json({ message: emailError }, { status: 400 });
    }

    const userExists = await checkUserExists(email);
    if (!userExists) {
        return NextResponse.json({ message: 'Email does not exist in our system.' }, { status: 404 });
    }

    const otpData = await checkOtpExists(email);
    if (otpData) {
        const currentTime = Date.now();
        const timeDifference = (currentTime - otpData.timestamp) / 1000;

        if (timeDifference < 60) {
            return NextResponse.json({ message: 'OTP already sent. Please wait for 1 minute.' }, { status: 400 });
        }
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await saveOrUpdateOtp(email, otp);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP is: ${otp}`,
        });

        return NextResponse.json({ message: 'OTP sent to your email!' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to send OTP!' }, { status: 500 });
    }
}

function validateEmail(email: string) {
    const regex = /\S+@\S+\.\S+/;
    if (!email) return "Email is required.";
    if (!regex.test(email)) return "Please enter a valid email address.";
    return null;
}

async function checkUserExists(email: string) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(usersCollection);

        const user = await collection.findOne({ email });
        return !!user;
    } finally {
        await client.close();
    }
}

async function checkOtpExists(email: string) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(otpCollection);

        const otpData = await collection.findOne({ email });
        return otpData;
    } finally {
        await client.close();
    }
}

async function saveOrUpdateOtp(email: string, otp: string) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(otpCollection);

        const timestamp = Date.now();
        const otpData = { email, otp, timestamp };

        await collection.updateOne(
            { email },
            { $set: otpData },
            { upsert: true }
        );
    } finally {
        await client.close();
    }
}
