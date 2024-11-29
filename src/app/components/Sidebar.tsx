"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import sideBarLogo from "../../../public/images/sidbar.svg";
import { usePathname } from "next/navigation";
import { FaClipboardList, FaUserPlus } from "react-icons/fa";
import { BsClipboard2CheckFill } from "react-icons/bs";
import { IoSettingsSharp, IoLogOut } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { RiTimeZoneFill } from "react-icons/ri";
import { FaHouseSignal } from "react-icons/fa6";
import { TbCloudDataConnection } from "react-icons/tb";
import { useAuth } from "../hooks/useAuth";


// export default function Sidebar() {
export default function Sidebar({ onToggleExpand }: { onToggleExpand: (expanded: boolean) => void }) {

    const [isExpanded, setIsExpanded] = useState(true);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isAutoConfirmationOpen, setAutoConfirmationOpen] = useState(false);
    const { userRole } = useAuth("/admin-login");

    // Toggle function
    const toggleAutoConfirmation = () => {
        setAutoConfirmationOpen((prevState) => !prevState);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                localStorage.removeItem("token");
                if (userRole === "admin") {
                    window.location.href = "/admin-login";
                } else {
                    window.location.href = "/login";
                }
            } else {
                const errorData = await response.json();
                console.error('Logout failed:', errorData.message);
            }
            
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };





    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const pathname = usePathname();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsExpanded(true);
            } else {
                setIsExpanded(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleExpand = () => {
        setDropdownOpen(false);
        setIsExpanded(!isExpanded);
        onToggleExpand(!isExpanded);
    };
    const isActive = (path: string) => pathname === path;

    return (
        <>
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 bg-gray-100 text-gray-800 h-screen z-50 transform transition-all duration-300 ${isExpanded ? "w-64" : "w-24"
                    } flex flex-col justify-between`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gray-100">
                    {isExpanded ? (
                        <Image
                            src={sideBarLogo}
                            alt="logo"
                            width={200}
                            height={200}
                            priority
                        />
                    ) : (
                        <p className="text-2xl font-bold text-[#005B97]">MPG</p>
                    )}
                </div>

                {/* Navigation */}
                <nav className="mt-8 flex-grow p-4 bg-gray-100">
                    <ul className="space-y-4">
                        <Link href="/jobs">
                            <li
                                className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'
                                    } space-x-3 px-4 py-2 rounded-lg transition-all ${isActive("/jobs") ? "bg-blue-200 font-bold" : "hover:bg-gray-200"
                                    }`}
                            >
                                <BsClipboard2CheckFill className="text-[#005B97] text-2xl" />
                                {isExpanded && (
                                    <p className="text-gray-800 text-lg">
                                        Jobs
                                    </p>
                                )}

                            </li>
                        </Link>

                        <li
                            className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'
                                } space-x-3 px-4 py-2 rounded-lg transition-all ${isActive("/master-table")
                                    ? "bg-blue-200 font-bold"
                                    : "hover:bg-gray-200"
                                }`}
                        >
                            <FaClipboardList className="text-[#005B97] text-2xl" />
                            {isExpanded && (
                                <Link
                                    href="/master-table"
                                    className="text-gray-800 text-lg"
                                >
                                    Master Table
                                </Link>
                            )}
                        </li>
                        <li
                            className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'
                                } space-x-3 px-4 py-2 rounded-lg transition-all ${isActive("/roles-requests")
                                    ? "bg-blue-200 font-bold"
                                    : "hover:bg-gray-200"
                                }`}
                        >
                            <FaUserPlus className="text-[#005B97] text-2xl" />
                            {isExpanded && (
                                <Link
                                    href="/roles-requests"
                                    className="text-gray-800 text-lg"
                                >
                                    Roles Requests
                                </Link>
                            )}
                        </li>
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 bg-gray-100 mt-auto">
                    <ul className="mb-5 relative">
                        <li
                            className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'
                                } justify-between px-4 py-2 rounded-lg transition-all`}
                        >
                            <div className="flex items-center gap-2">
                                <IoSettingsSharp className="text-[#005B97] text-2xl hover:bg-none" />
                                {isExpanded && (
                                    <p className="text-gray-800 text-lg cursor-pointer" onClick={toggleDropdown}>
                                        Settings
                                    </p>
                                )}
                            </div>

                            {isExpanded && (
                                <IoIosArrowForward
                                    className="text-lg text-gray-600 transition-transform duration-300 cursor-pointer"
                                    onClick={toggleDropdown}
                                />
                            )}
                        </li>
                    </ul>

                    {/* Dropdown List */}
                    {isDropdownOpen && (
                        <div className="absolute left-60 bottom-24 w-80 bg-white rounded-lg shadow-xl">
                            <h1 className="mt-1 p-2 text-xl font-medium">Settings</h1>
                            <ul className="text-gray-600 mt-2">
                                <li className="p-2 hover:bg-gray-200 cursor-pointer">
                                    <p onClick={handleLogout} className="flex justify-between items-center">
                                        <span className="text-gray-800 font-medium">Logout</span>
                                        <IoLogOut className="text-[#005B97] text-2xl" />
                                    </p>
                                </li>
                                <li className="p-2 hover:bg-gray-200 cursor-pointer">
                                    <Link href="" className="flex justify-between items-center">
                                        <span>Time Zone</span>
                                        <RiTimeZoneFill className="text-[#005B97] text-2xl" />
                                    </Link>
                                </li>
                                <li className="p-2 hover:bg-gray-200 cursor-pointer">
                                    <Link href="" className="flex justify-between items-center">
                                        <span>DB Connection</span>
                                        <FaHouseSignal className="text-[#005B97] text-2xl" />
                                    </Link>
                                </li>
                                <li className="p-2 hover:bg-gray-200 cursor-pointer">
                                    <Link href="" className="flex justify-between items-center">
                                        <span>Batch Frequency</span>
                                        <TbCloudDataConnection className="text-[#005B97] text-2xl" />
                                    </Link>
                                </li>
                                <li className="p-2">
                                    <div className="flex justify-between items-center">
                                        <span>Auto Confirmation</span>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                id="auto-confirmation-toggle"
                                                checked={isAutoConfirmationOpen}
                                                onChange={toggleAutoConfirmation}
                                            />
                                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#005B97]"></div>
                                        </label>
                                    </div>
                                </li>


                            </ul>
                        </div>
                    )}
                    <div className="flex items-center gap-3 px-1">
                        <Image
                            src="/images/user.svg"
                            alt="User"
                            width={50}
                            height={50}
                            className="rounded-full"
                        />
                        {isExpanded && (
                            <div className="flex flex-col">
                                <h1 className="text-lg font-semibold text-gray-800">
                                    Paul Melone
                                </h1>
                                <p className="text-gray-400">Admin</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Expand button */}
            <button
                onClick={toggleExpand}
                className={`absolute top-16 ${isExpanded ? "left-60" : "left-20"
                    } z-50 bg-gray-400 text-white px-[8px] rounded-full transition-all duration-300`}
            >
                {isExpanded ? "<" : ">"}
            </button>
        </>
    );
}
