"use client";

import { useAuth } from "../hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "../components/LoadingSpinner"; // Import the spinner component

export default function DBConnectionPage() {
    const isAuthenticated = useAuth();

    const [systemID, setSystemID] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [portNumber, setPortNumber] = useState("");
    const [serviceName, setServiceName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [percentage, setPercentage] = useState(0);

    const [loadingComplete, setLoadingComplete] = useState(false);

    useEffect(() => {
        if (isLoading) {
            let progress = 0;
            const interval = setInterval(() => {
                if (progress < 100) {
                    progress += 10;
                    setPercentage(progress);
                } else {
                    clearInterval(interval);
                    setLoadingComplete(true); 
                }
            }, 800); 

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const handleDBConnection = useCallback(async () => {
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("You are not authenticated. Please log in again.");
            return;
        }

        try {
            const res = await fetch("/api/auth/db", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    systemID,
                    userName,
                    password,
                    ipAddress,
                    portNumber,
                    serviceName,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to connect to the database");
            }

            // Connection successful
            // You can trigger further actions here, such as redirecting or showing success
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false); 
        }
    }, [systemID, userName, password, ipAddress, portNumber, serviceName]);

    useEffect(() => {
        if (loadingComplete) {
            handleDBConnection();
        }
    }, [loadingComplete, handleDBConnection]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-[url('/images/bg.png')] bg-cover bg-center">
            <div className="w-full max-w-md bg-white rounded-sm shadow-lg p-6 mx-5">
                <h1 className="text-2xl font-bold text-center mb-4 text-black">DB Connection</h1>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                {/* Show loading spinner and percentage if loading */}
                {isLoading ? (
                    <LoadingSpinner percentage={percentage} />
                ) : (
                    //   <form onSubmit={handleDBConnection}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsLoading(true);
                            setPercentage(0);
                            setLoadingComplete(false); // Reset loading state
                        }}
                    >
                        <div className="mb-4">
                            <label className="block text-black font-semibold">System ID</label>
                            <input
                                type="text"
                                placeholder="Enter System ID"
                                value={systemID}
                                onChange={(e) => setSystemID(e.target.value)}
                                className="w-full px-4 py-2 mt-1 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                                required
                            />
                        </div>

                        {/* Repeat for other fields */}
                        <div className="mb-4">
                            <label className="block text-black font-semibold">User Name</label>
                            <input
                                type="text"
                                placeholder="Enter User Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full px-4 py-2 mt-1 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-black font-semibold">Password</label>
                            <input
                                type="password"
                                placeholder="Enter DB Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-1 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-black font-semibold">IP Address</label>
                            <input
                                type="text"
                                placeholder="Enter DB IP Address"
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                                className="w-full px-4 py-2 mt-1 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-black font-semibold">Port Number</label>
                            <input
                                type="number"
                                placeholder="Enter DB Port Number"
                                value={portNumber}
                                onChange={(e) => setPortNumber(e.target.value)}
                                className="w-full px-4 py-2 mt-1 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-black font-semibold">Service Name</label>
                            <input
                                type="text"
                                placeholder="Enter Service Name"
                                value={serviceName}
                                onChange={(e) => setServiceName(e.target.value)}
                                className="w-full px-4 py-2 mt-1 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#005B97] text-white py-2 px-4 font-bold rounded-md hover:bg-[#005b97f0] transition duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? "Connecting..." : "Save & Continue"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
