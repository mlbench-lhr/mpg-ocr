import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
// import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

// const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET as string;

export async function POST(req: Request) {
    const { email, password, role } = await req.json();

    if (!email || !password) {
        return NextResponse.json(
            { message: "Email and password are required" },
            { status: 400 }
        );
    }

    try {
        // await client.connect();
        const client = await clientPromise;
        const db = client.db("my-next-app");

        // Build the query dynamically based on role
        const query = role ? { email, role } : { email };
        const user = await db.collection("users").findOne(query);

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Check the user's status
        if (user.status === 0) {
            return NextResponse.json(
                { message: "Your account is pending approval. Please wait for admin approval." },
                { status: 403 }
            );
        }

        if (user.status === 2) {
            return NextResponse.json(
                { message: "Your account has been rejected. Please resend registration  request." },
                { status: 403 }
            );
        }

        // Check the password using bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Generate JWT
        const token = jwt.sign(
            { email: user.email, id: user._id, role: user.role },
            SECRET_KEY,
            { expiresIn: "24h" }
        );

        return NextResponse.json(
            { message: "Login successful", token },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
