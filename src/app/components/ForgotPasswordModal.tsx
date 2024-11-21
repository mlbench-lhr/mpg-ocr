"use client";

import { useState } from "react";

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [otpError, setOtpError] = useState<string | null>(null);

    // Handle OTP field input change
    const handleChangeOtp = (index: number, value: string) => {
        // Allow only digits (0-9)
        if (/[^0-9]/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move focus to the next field if value is entered
        if (value && index < otp.length - 1) {
            const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
            nextInput?.focus();
        }
    };

    // Handle backspace to move focus to previous field
    const handleBackspace = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace" && !otp[index]) {
            const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
            prevInput?.focus();
        }
    };

    // Validate email format
    const validateEmail = (email: string) => {
        const regex = /\S+@\S+\.\S+/;
        if (!email) return "Email is required.";
        if (!regex.test(email)) return "Please enter a valid email address.";
        return null;
    };

    // Handle sending OTP
    const handleSendOtp = async () => {
        const emailError = validateEmail(email);
        if (emailError) {
            setEmailError(emailError);
            return;
        }

        setEmailError(null); // Clear email error if valid

        const res = await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) {
            alert("Failed to send OTP.");
        } else {
            alert("OTP sent to your email.");
        }
    };

    // Validate OTP
    const validateOtp = (otp: string[]) => {
        if (otp.join("").length !== 4) return "OTP must be 4 digits.";
        return null;
    };

    // Handle verifying OTP
    const handleVerifyOtp = async () => {
        const otpError = validateOtp(otp);
        if (otpError) {
            setOtpError(otpError);
            return;
        }

        setOtpError(null); // Clear OTP error if valid

        const res = await fetch("/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp: otp.join("") }),
        });
        if (!res.ok) {
            alert("OTP verification failed.");
        } else {
            alert("OTP verified successfully.");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="w-full max-w-sm bg-white rounded-sm p-6 mx-5 relative">
                <button
                    onClick={onClose}
                    className="absolute top-7 right-2 font-bold text-white bg-[#005B97] rounded-full px-[7px] py-0"
                >
                    &times;
                </button>
                <h1 className="text-2xl font-bold text-center mb-3 text-black">Forgot Password</h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Please enter your email address to verify your account
                </p>
                <form>
                    <label className="block text-black font-semibold">Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 mt-1 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                        required
                    />
                    {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    <div className="flex justify-end items-center mb-16 mt-2">
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-[#005B97] underline"
                        >
                            Send OTP
                        </button>
                    </div>
                    <div className="flex justify-evenly mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength={1}
                                className="text-xl font-semibold w-12 h-12 text-center border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                                value={digit}
                                onChange={(e) => handleChangeOtp(index, e.target.value)}
                                onKeyDown={(e) => handleBackspace(index, e)}
                            />
                        ))}
                    </div>
                    {otpError && <p className="text-red-500 text-sm mt-1">{otpError}</p>}
                    <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="w-full bg-[#005B97] text-white py-2 rounded-md"
                    >
                        Verify
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPasswordModal;
