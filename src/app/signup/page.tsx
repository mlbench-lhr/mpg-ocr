"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";



export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);


        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message);
            }
            setSuccessMessage("Signup successful! You can now log in.");
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setShowPassword(false);
            setShowConfirmPassword(false);
            setTimeout(() => {
                setSuccessMessage(null);
            }, 20000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[url('/images/bg.png')] bg-cover bg-center">
            <div className="w-full max-w-md bg-white rounded-sm shadow-lg p-6 mx-5">
                <h1 className="text-2xl font-bold text-center mb-4 text-black">Register</h1>
                <p className="text-center text-gray-500 mb-6">
                    Add your account basic details to create an Account on MPG OCR
                </p>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {successMessage && (
                    <div className="p-4 mb-4 text-sm text-tail-800 rounded-lg bg-green-50 dark:bg-green-100 dark:text-green-600" role="alert">
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}
                <form onSubmit={handleSignup}>
                    <div className="mb-4">
                        <label className="block text-black font-semibold">Name</label>
                        <input
                            type="text"
                            placeholder="Enter your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black font-semibold">Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                            required
                        />
                    </div>
                    <div className="mb-4 relative">
                        <label className="block text-black font-semibold">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <FaEye size={20} className="text-[#005B97]" /> : <FaEyeSlash size={20} className="text-[#005B97]" />}
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-black font-semibold">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                                {showConfirmPassword ? <FaEye size={20} className="text-[#005B97]" /> : <FaEyeSlash size={20} className="text-[#005B97]" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#005B97] text-white py-2 px-4 font-bold rounded-md hover:bg-[#005b97f0] transition duration-300"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-black font-medium">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#005B97] hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
