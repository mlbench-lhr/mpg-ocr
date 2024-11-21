"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      const { token } = await res.json();
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/images/bg.png')] bg-cover bg-center">
      <div className="w-full max-w-md bg-white rounded-sm shadow-lg p-6 mx-5">
        <div className="flex justify-center items-center my-3">
          <Image src="/images/logo.svg" alt="logo" width={200} height={200} priority style={{ width: "auto", height: "auto" }} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-4 text-black">Sign In</h1>
        <p className="text-center text-gray-500 mb-6">Sign in With your email and password and continue to MPG OCR</p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin}>
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
                {showPassword ? (
                  <FaEye size={20} className="text-[#005B97]" />
                ) : (
                  <FaEyeSlash size={20} className="text-[#005B97]" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#005B97] text-white py-2 px-4 font-bold rounded-md hover:bg-[#005b97f0] transition duration-300"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-black font-medium">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#005B97] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
