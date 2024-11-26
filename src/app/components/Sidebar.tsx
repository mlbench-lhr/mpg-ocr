"use client";
// components/Sidebar.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import sideBarLogo from "../../../public/images/sidbar.svg";
import { usePathname } from "next/navigation"; // Import useRouter


export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname(); // Initialize the router
    const toggleSidebar = () => setIsOpen(!isOpen);
    const isActive = (path: string) => pathname === path;


    return (
        <>
            <div
                className={`fixed inset-0 bg-opacity-50 bg-gray-100 z-50 md:hidden ${isOpen ? "block" : "hidden"}`}
                onClick={toggleSidebar}
            ></div>

            <div
                className={`fixed rounded-lg top-0 left-0 bg-gray-100 text-gray-800 max-h-full min-h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:relative flex flex-col justify-between`}
            >
                <div className="flex gap-5 rounded-lg justify-between items-center p-4 bg-gray-100">
                    <div className="text-2xl font-bold">
                        <Image
                            src={sideBarLogo}
                            alt="logo"
                            width={200}
                            height={200}
                            priority
                            style={{ width: "auto", height: "auto" }}
                        />
                    </div>
                    <button className="text-gray-800 md:hidden" onClick={toggleSidebar}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                <nav className="mt-8 flex-grow">
                    <ul className="space-y-22">
                        <li>
                            <Link
                                href="/jobs"
                                className={`block px-4 py-2 text-lg text-gray-800 transition-all ease-in-out ${isActive('/jobs') ? 'bg-blue-200 font-bold' : ''}`}
                            >
                                Jobs
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/master-table"
                                className={`block px-4 py-2 text-lg text-gray-800 transition-all ease-in-out ${isActive('/master-table') ? 'bg-blue-200' : ''}`}
                            >
                                Master Table
                            </Link>
                        </li>

                    </ul>
                </nav>

                {/* User Profile section at the bottom */}
                <div className="p-4 bg-gray-100 mt-auto rounded-lg">
                    <h1 className="text-lg font-semibold text-gray-800">Paul Melone</h1>
                    <p className="text-gray-400">Admin</p>
                </div>
            </div>

            {/* Sidebar toggle button */}
            {isOpen || (
                <div className="md:hidden relative top-0 left-0 z-50">
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-200 bg-gray-800 p-2 rounded-lg focus:outline-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </>
    );
}
