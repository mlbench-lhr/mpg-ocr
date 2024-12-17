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
import { useRouter } from "next/navigation";

interface SidebarProps {
    onStateChange: (newState: boolean) => void; // Callback to notify parent
}


// export default function Sidebar() {
export default function Sidebar({ onStateChange }: SidebarProps) {

    // const [isExpanded, setIsExpanded] = useState(false);
    const [isExpanded, setIsExpanded] = useState<boolean>();


    useEffect(() => {
        const savedState = sessionStorage.getItem("sidebar");
        if (savedState !== null) {
            const parsedState = JSON.parse(savedState);
            setIsExpanded(parsedState);
            onStateChange(parsedState); // Notify parent of the initial state
        }
    }, [onStateChange]);

    // useEffect(() => {
    //     if (typeof window !== "undefined") {
    //         const savedState = sessionStorage.getItem('sidebar');
    //         if (savedState) {
    //             setIsExpanded(JSON.parse(savedState));
    //         }
    //     }
    // }, []);


    // const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    //     const savedState = localStorage.getItem('sidebar');
    //     return savedState ? JSON.parse(savedState) : false;
    // });

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isAutoConfirmationOpen, setAutoConfirmationOpen] = useState(false);
    const [isDropdownOpenZone, setIsDropdownOpenZone] = useState(false);
    const [selectedTimeZone, setSelectedTimeZone] = useState("");
    const [userName, setUserName] = useState("User");
    const [userRole, setUserRole] = useState("");

    const router = useRouter();


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/admin-login");
            return;
        }

        const savedRole = localStorage.getItem("role");
        if (savedRole) {
            setUserRole(savedRole);
        } else {
            // Decode JWT and save role for future use
            const decodedToken = decodeJwt(token);
            const role = decodedToken.role;
            setUserRole(role);
            localStorage.setItem("role", role);
        }

        if (typeof window !== "undefined") {
            const username = localStorage.getItem("username");
            setUserName(username || "User");
        }
    }, [router]);

    // Decode JWT function
    const decodeJwt = (token: string) => {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    };

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

                sessionStorage.setItem('sidebar', JSON.stringify(false));
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


    const timeZones = [
        "UTC-12:00",
        "UTC-11:00",
        "UTC-10:00",
        "UTC-09:00",
        "UTC-08:00",
        "UTC-07:00",
        "UTC-06:00",
        "UTC-05:00",
        "UTC-04:00",
        "UTC-03:00",
        "UTC-02:00",
        "UTC-01:00",
        "UTC+00:00",
        "UTC+01:00",
        "UTC+02:00",
        "UTC+03:00",
        "UTC+04:00",
        "UTC+05:00",
        "UTC+06:00",
        "UTC+07:00",
        "UTC+08:00",
        "UTC+09:00",
        "UTC+10:00",
        "UTC+11:00",
        "UTC+12:00",
    ];

    // const toggleDropdownZone = () => {
    //     setIsDropdownOpenZone(!isDropdownOpen);
    // };

    const handleSelectTimeZone = (zone: string) => {
        setSelectedTimeZone(zone);
        setIsDropdownOpenZone(false);
        // console.log(`Selected Time Zone: ${zone}`);
    };


    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const pathname = usePathname();

    // useEffect(() => {
    //     const handleResize = () => {
    //         if (window.innerWidth >= 768) {
    //             setIsExpanded(false);
    //         } else {
    //             setIsExpanded(false);
    //         }
    //     };
    //     handleResize();
    //     window.addEventListener("resize", handleResize);
    //     return () => window.removeEventListener("resize", handleResize);
    // }, []);

    // Handle resize and set sidebar state accordingly
    // useEffect(() => {
    //     const handleResize = () => {
    //         if (window.innerWidth >= 768) {
    //             const storedSidebarState = sessionStorage.getItem("sidebar");
    //             setIsExpanded(storedSidebarState ? JSON.parse(storedSidebarState) : true);
    //         } else {
    //             setIsExpanded(false); // Collapse sidebar on smaller screens
    //         }
    //     };

    //     handleResize();
    //     window.addEventListener("resize", handleResize);
    //     return () => window.removeEventListener("resize", handleResize);
    // }, []);

    // const toggleExpand = () => {
    //     setDropdownOpen(false);
    //     setIsExpanded(!isExpanded);
    //     onToggleExpand(!isExpanded);
    // };

    // Toggle sidebar state
    const toggleExpand = () => {
        setDropdownOpen(false);
        const newState = !isExpanded;
        setIsExpanded(newState);
        sessionStorage.setItem("sidebar", JSON.stringify(newState));
        onStateChange(newState); // Notify parent of the updated state
    };

    const isActive = (path: string) => pathname === path;

    return (
        <>
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 bg-gray-100 text-gray-800 h-screen z-50 transform transition-all duration-300 ${!isExpanded ? "w-24" : "w-64"
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
                        {userRole === "admin" && (
                            <Link href="/jobs">
                                <li
                                    className={`flex items-center mb-2 ${isExpanded ? "justify-start" : "justify-center"
                                        } space-x-3 px-4 py-2 rounded-lg transition-all ${isActive("/jobs")
                                            ? "bg-blue-200 font-bold"
                                            : "hover:bg-gray-200"
                                        }`}
                                >
                                    <BsClipboard2CheckFill className="text-[#005B97] text-2xl" />
                                    {isExpanded && (
                                        <p className="text-gray-800 text-lg">Jobs</p>
                                    )}
                                </li>
                            </Link>
                        )}
                        <Link href="/extracted-data-monitoring">
                            <li
                                className={`flex items-center mb-2 ${isExpanded ? 'justify-start' : 'justify-center'
                                    } space-x-3 px-4 py-2 rounded-lg transition-all ${isActive("/extracted-data-monitoring")
                                        ? "bg-blue-200 font-bold"
                                        : "hover:bg-gray-200"
                                    }`}
                            >
                                <FaClipboardList className="text-[#005B97] text-2xl" />
                                {isExpanded && (
                                    <p className="text-gray-800 text-lg">
                                        Extracted Data
                                    </p>
                                )}
                            </li>
                        </Link>

                        {userRole === "admin" && (
                            <Link href="/roles-requests">
                                <li
                                    className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'
                                        } space-x-3 px-4 py-2 rounded-lg transition-all ${isActive("/roles-requests")
                                            ? "bg-blue-200 font-bold"
                                            : "hover:bg-gray-200"
                                        }`}
                                >
                                    <FaUserPlus className="text-[#005B97] text-2xl" />
                                    {isExpanded && (
                                        <p className="text-gray-800 text-lg">
                                            Roles Requests
                                        </p>
                                    )}
                                </li>
                            </Link>
                        )}

                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 bg-gray-100 mt-auto">

                    {userRole === 'admin' &&
                        <ul className="mb-5 relative">
                            <li
                                className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'
                                    } justify-between px-4 py-2 rounded-lg transition-all`}
                            >
                                <div className="flex items-center gap-2">
                                    <IoSettingsSharp className="text-[#005B97] text-2xl hover:bg-none cursor-pointer" onClick={toggleDropdown} />
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
                    }

                    {/* Dropdown List */}
                    {isDropdownOpen && (
                        <>
                            {userRole !== 'admin' && (
                                <div className={`absolute ${isExpanded ? 'left-56 bottom-18' : 'left-16 bottom-16'
                                    }  w-32 bg-white rounded-lg shadow-xl`}>
                                    <ul className="text-gray-600">
                                        <li className="p-2 cursor-pointer">
                                            <p onClick={handleLogout} className="flex justify-start gap-3 items-center transform transition-transform hover:translate-x-2">
                                                <IoLogOut className="text-[#005B97] text-2xl" />
                                                <span className="font-medium text-[#005B97]">Logout</span>
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            )}

                            {userRole === 'admin' && (
                                <div className={`absolute  ${isExpanded ? 'left-60 bottom-24' : 'left-16 bottom-24'
                                    }  w-80 bg-white rounded-lg shadow-xl`}>
                                    <h1 className="mt-1 p-2 text-xl font-medium">Settings</h1>
                                    <ul className="text-gray-600 mt-2">
                                        <li className="p-2 hover:bg-gray-200 cursor-pointer">
                                            <p onClick={handleLogout} className="flex justify-between items-center">
                                                <span className="text-gray-800 font-medium">Logout</span>
                                                <IoLogOut className="text-[#005B97] text-2xl" />
                                            </p>
                                        </li>
                                        <li className="p-2 hover:bg-gray-200 cursor-pointer relative">
                                            <div
                                                onClick={() => setIsDropdownOpenZone(!isDropdownOpenZone)} // Toggle dropdown
                                                className="flex justify-between items-center cursor-pointer"
                                            >
                                                <span>Time Zone</span>
                                                <span>
                                                    {selectedTimeZone ? selectedTimeZone :
                                                        <RiTimeZoneFill className="text-[#005B97] text-2xl" />
                                                    }
                                                </span>
                                            </div>

                                            {/* Dropdown Options */}
                                            {isDropdownOpenZone && (
                                                <ul
                                                    className="absolute mt-2 left-0 w-40 bg-white border rounded-lg shadow-lg z-10 overflow-y-auto max-h-48"
                                                >
                                                    {timeZones.map((zone) => (
                                                        <li
                                                            key={zone}
                                                            onClick={() => handleSelectTimeZone(zone)}
                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            {zone}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                        </li>

                                        <li className="p-2 hover:bg-gray-200 cursor-pointer">
                                            <Link href="/db-connection" className="flex justify-between items-center">
                                                <span>DB Connection</span>
                                                <FaHouseSignal className="text-[#005B97] text-2xl" />
                                            </Link>
                                        </li>
                                        <li className="p-2 hover:bg-gray-200 cursor-pointer">
                                            <Link href="/jobs" className="flex justify-between items-center">
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
                        </>
                    )}


                    <div className="flex items-center gap-3 px-1">
                        <Image
                            src="/images/user.svg"
                            alt="User"
                            width={50}
                            height={50}
                            className="rounded-full"
                            onClick={toggleDropdown}
                        />
                        {isExpanded && (
                            <div className="flex justify-between items-center gap-10">
                                <div className="flex flex-col">
                                    <h1 className="text-lg font-semibold text-gray-800">
                                        {userRole === "admin" ? "Admin" : userName}
                                    </h1>
                                    <p className="text-gray-400">
                                        {userRole === "admin"
                                            ? ""
                                            : userRole === "reviewer"
                                                ? "Reviewer"
                                                : "User"}
                                    </p>
                                </div>
                                {userRole !== 'admin' && (
                                    <div>
                                        <IoIosArrowForward
                                            className="text-lg text-gray-600 transition-transform duration-300 cursor-pointer"
                                            onClick={toggleDropdown}
                                        />
                                    </div>
                                )}
                            </div>

                        )}
                    </div>
                </div>

            </div >

            {/* Expand button */}
            <button
                onClick={toggleExpand}
                className={`fixed top-16 ${isExpanded ? "left-60" : "left-20"
                    } z-50 bg-gray-400 text-white px-[8px] rounded-full transition-all duration-300`
                }
            >
                {isExpanded ? "<" : ">"}
            </button >
        </>
    );
}
