import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET as string;

export async function POST(req: Request) {
    const { email, password, role } = await req.json();
    // console.log(role);

    if (!email || !password) {
        return NextResponse.json(
            { message: "Email and password are required" },
            { status: 400 }
        );
    }

    try {
        const client = await clientPromise;
        const db = client.db("my-next-app");

        const normalizedEmail = email.toLowerCase();

        const query = role ? { email: normalizedEmail, role } : { email: normalizedEmail };
        const user = await db.collection("users").findOne(query);

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

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
        if (!role && user.role === "admin") {
            return NextResponse.json(
                { message: "Admins are not permitted to log in as users." },
                { status: 403 }
            );
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { email: user.email, id: user._id, role: user.role, },
            SECRET_KEY,
            { expiresIn: "24h" }
        );

        const name = user.name;

        return NextResponse.json(
            { message: "Login successful", token, name },
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
