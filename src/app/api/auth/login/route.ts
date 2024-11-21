import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "@lib/mongodb";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("my-next-app");

        const user = await db.collection("users").findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JWT_SECRET || "defaultsecret",
            { expiresIn: "24h" }
        );

        return NextResponse.json({ message: "Login successful", token }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
