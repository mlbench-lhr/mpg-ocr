"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import Image from "next/image";
// import { RiArrowDropDownLine } from "react-icons/ri";


interface User {
    _id: string;
    name: string;
    email: string;
    status: number;
    role: string;
    createdAt: string; // Keeping it string as we handle formatting in the render
}

export default function Page() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    // const [totalUsers, setTotalUsers] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingTable, setLoadingTable] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Handle sidebar toggle
    const handleSidebarToggle = (expanded: boolean) => {
        setIsSidebarExpanded(expanded);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoadingTable(true);

            // Build query string based on currentPage and searchQuery
            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
            const response = await fetch(`/api/role-requests/get-requests/?page=${currentPage}${searchParam}`);

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                setTotalPages(data.totalPages);
                // setTotalUsers(data.totalUsers);
            } else {
                console.error("Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoadingTable(false);
        }
    }, [currentPage, searchQuery]);

    // Trigger data fetch on mount and on dependency changes
    useEffect(() => {
        fetchUsers();
    }, [currentPage, fetchUsers, searchQuery]);

    return (
        <div className="flex flex-row h-screen bg-white">
            <Sidebar onToggleExpand={handleSidebarToggle} />
            <div
                className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isSidebarExpanded ? "ml-64" : "ml-24"
                    }`}
            >
                <Header
                    leftContent="History"
                    totalContent={10}
                    rightContent={
                        <input
                            type="text"
                            placeholder="Search..."
                            className="px-4 py-2 rounded-lg border border-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    }
                    buttonContent={''}

                />
                <div className="flex-1 p-4 bg-white">

                    {loadingTable ? (
                        <div className="flex justify-center items-center">
                            <Spinner />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center mt-20">
                            <Image
                                src="/images/no_history.svg"
                                alt="No jobs found"
                                width={200}
                                height={200}
                                priority
                            />
                        </div>
                    ) : (
                        <table className="min-w-full bg-white border-gray-300">
                            <thead>
                                <tr className="text-lg text-gray-800">
                                    <th className="py-2 px-4 border-b text-start font-medium">BL Number</th>
                                    <th className="py-2 px-4 border-b text-center font-medium">Recognition status</th>
                                    <th className="py-2 px-4 border-b text-center font-medium">Changed On</th>
                                    <th className="py-2 px-4 border-b text-center font-medium">Field</th>
                                    <th className="py-2 px-4 border-b text-center font-medium">Old Value</th>
                                    <th className="py-2 px-4 border-b text-center font-medium">New Value</th>
                                    <th className="py-2 px-4 border-b text-center font-medium">Changed By</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="text-gray-500">
                                    <td className="py-2 px-4 border-b text-start">232058679452165</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <div
                                            className={`inline-flex items-center justify-center gap-0 px-3 py-2 rounded-full text-sm font-medium  bg-blue-100 text-[#005B97]`}
                                        >
                                            <div className="flex items-center">
                                                <span>
                                                    New
                                                </span>
                                                {/* <span>
                                                    <RiArrowDropDownLine
                                                        className={`text-2xl p-0`}
                                                    />
                                                </span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">02/28/2024 00:00:00</td>
                                    <td className="py-2 px-4 border-b text-center">Carrier</td>
                                    <td className="py-2 px-4 border-b text-center">xxxxxx</td>
                                    <td className="py-2 px-4 border-b text-center">UPS</td>
                                    <td className="py-2 px-4 border-b text-center">OCR Engine</td>

                                </tr>
                                <tr className="text-gray-500">
                                    <td className="py-2 px-4 border-b text-start">232058679452165</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <div
                                            className={`inline-flex items-center justify-center gap-0 px-3 py-2 rounded-full text-sm font-medium  bg-yellow-100 text-[#AF9918]`}
                                        >
                                            <div className="flex items-center">
                                                <span>
                                                    Partially Valid
                                                </span>
                                                {/* <span>
                                                    <RiArrowDropDownLine
                                                        className={`text-2xl p-0`}
                                                    />
                                                </span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">02/28/2024 00:00:00</td>
                                    <td className="py-2 px-4 border-b text-center">Carrier</td>
                                    <td className="py-2 px-4 border-b text-center">xxxxxx</td>
                                    <td className="py-2 px-4 border-b text-center">PPS</td>
                                    <td className="py-2 px-4 border-b text-center">David</td>

                                </tr>
                                <tr className="text-gray-500">
                                    <td className="py-2 px-4 border-b text-start">232058679452165</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <div
                                            className={`inline-flex items-center justify-center gap-0 px-3 py-2 rounded-full text-sm font-medium  bg-green-100 text-green-800`}
                                        >
                                            <div className="flex items-center">
                                                <span>
                                                    Valid
                                                </span>
                                                {/* <span>
                                                    <RiArrowDropDownLine
                                                        className={`text-2xl p-0`}
                                                    />
                                                </span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">02/28/2024 00:00:00</td>
                                    <td className="py-2 px-4 border-b text-center">Carrier</td>
                                    <td className="py-2 px-4 border-b text-center">xxxxxx</td>
                                    <td className="py-2 px-4 border-b text-center">UPS</td>
                                    <td className="py-2 px-4 border-b text-center">OCR Engine</td>

                                </tr>
                                <tr className="text-gray-500">
                                    <td className="py-2 px-4 border-b text-start">232058679452165</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <div
                                            className={`inline-flex items-center justify-center gap-0 px-3 py-2 rounded-full text-sm font-medium  bg-blue-100 text-[#005B97]`}
                                        >
                                            <div className="flex items-center">
                                                <span>
                                                    New
                                                </span>
                                                {/* <span>
                                                    <RiArrowDropDownLine
                                                        className={`text-2xl p-0`}
                                                    />
                                                </span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">02/28/2024 00:00:00</td>
                                    <td className="py-2 px-4 border-b text-center">Carrier</td>
                                    <td className="py-2 px-4 border-b text-center">xxxxxx</td>
                                    <td className="py-2 px-4 border-b text-center">UPS</td>
                                    <td className="py-2 px-4 border-b text-center">OCR Engine</td>

                                </tr>
                                <tr className="text-gray-500">
                                    <td className="py-2 px-4 border-b text-start">232058679452165</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <div
                                            className={`inline-flex items-center justify-center gap-0 px-3 py-2 rounded-full text-sm font-medium  bg-yellow-100 text-[#AF9918]`}
                                        >
                                            <div className="flex items-center">
                                                <span>
                                                    Partially Valid
                                                </span>
                                                {/* <span>
                                                    <RiArrowDropDownLine
                                                        className={`text-2xl p-0`}
                                                    />
                                                </span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">02/28/2024 00:00:00</td>
                                    <td className="py-2 px-4 border-b text-center">Carrier</td>
                                    <td className="py-2 px-4 border-b text-center">xxxxxx</td>
                                    <td className="py-2 px-4 border-b text-center">PPS</td>
                                    <td className="py-2 px-4 border-b text-center">David</td>

                                </tr>
                                <tr className="text-gray-500">
                                    <td className="py-2 px-4 border-b text-start">232058679452165</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <div
                                            className={`inline-flex items-center justify-center gap-0 px-3 py-2 rounded-full text-sm font-medium  bg-blue-100 text-[#005B97]`}
                                        >
                                            <div className="flex items-center">
                                                <span>
                                                    New
                                                </span>
                                                {/* <span>
                                                    <RiArrowDropDownLine
                                                        className={`text-2xl p-0`}
                                                    />
                                                </span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">02/28/2024 00:00:00</td>
                                    <td className="py-2 px-4 border-b text-center">Carrier</td>
                                    <td className="py-2 px-4 border-b text-center">xxxxxx</td>
                                    <td className="py-2 px-4 border-b text-center">UPS</td>
                                    <td className="py-2 px-4 border-b text-center">OCR Engine</td>

                                </tr>
                                <tr className="text-gray-500">
                                    <td className="py-2 px-4 border-b text-start">232058679452165</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <div
                                            className={`inline-flex items-center justify-center gap-0 px-3 py-2 rounded-full text-sm font-medium  bg-blue-100 text-[#005B97]`}
                                        >
                                            <div className="flex items-center">
                                                <span>
                                                    New
                                                </span>
                                                {/* <span>
                                                    <RiArrowDropDownLine
                                                        className={`text-2xl p-0`}
                                                    />
                                                </span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">02/28/2024 00:00:00</td>
                                    <td className="py-2 px-4 border-b text-center">Carrier</td>
                                    <td className="py-2 px-4 border-b text-center">xxxxxx</td>
                                    <td className="py-2 px-4 border-b text-center">UPS</td>
                                    <td className="py-2 px-4 border-b text-center">OCR Engine</td>

                                </tr>
                                <tr className="text-gray-500">
                                    <td className="py-2 px-4 border-b text-start">232058679452165</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <div
                                            className={`inline-flex items-center justify-center gap-0 px-3 py-2 rounded-full text-sm font-medium  bg-yellow-100 text-[#AF9918]`}
                                        >
                                            <div className="flex items-center">
                                                <span>
                                                    Partially Valid
                                                </span>
                                                {/* <span>
                                                    <RiArrowDropDownLine
                                                        className={`text-2xl p-0`}
                                                    />
                                                </span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">02/28/2024 00:00:00</td>
                                    <td className="py-2 px-4 border-b text-center">Carrier</td>
                                    <td className="py-2 px-4 border-b text-center">xxxxxx</td>
                                    <td className="py-2 px-4 border-b text-center">PPS</td>
                                    <td className="py-2 px-4 border-b text-center">David</td>

                                </tr>
                                <tr className="text-gray-500">
                                    <td className="py-2 px-4 border-b text-start">232058679452165</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <div
                                            className={`inline-flex items-center justify-center gap-0 px-3 py-2 rounded-full text-sm font-medium  bg-blue-100 text-[#005B97]`}
                                        >
                                            <div className="flex items-center">
                                                <span>
                                                    New
                                                </span>
                                                {/* <span>
                                                    <RiArrowDropDownLine
                                                        className={`text-2xl p-0`}
                                                    />
                                                </span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">02/28/2024 00:00:00</td>
                                    <td className="py-2 px-4 border-b text-center">Carrier</td>
                                    <td className="py-2 px-4 border-b text-center">xxxxxx</td>
                                    <td className="py-2 px-4 border-b text-center">UPS</td>
                                    <td className="py-2 px-4 border-b text-center">OCR Engine</td>

                                </tr>
                                <tr className="text-gray-500">
                                    <td className="py-2 px-4 border-b text-start">232058679452165</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <div
                                            className={`inline-flex items-center justify-center gap-0 px-3 py-2 rounded-full text-sm font-medium  bg-yellow-100 text-[#AF9918]`}
                                        >
                                            <div className="flex items-center">
                                                <span>
                                                    Partially Valid
                                                </span>
                                                {/* <span>
                                                    <RiArrowDropDownLine
                                                        className={`text-2xl p-0`}
                                                    />
                                                </span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">02/28/2024 00:00:00</td>
                                    <td className="py-2 px-4 border-b text-center">Carrier</td>
                                    <td className="py-2 px-4 border-b text-center">xxxxxx</td>
                                    <td className="py-2 px-4 border-b text-center">PPS</td>
                                    <td className="py-2 px-4 border-b text-center">David</td>

                                </tr>
                            </tbody>
                        </table>
                    )}

                    {loadingTable || totalPages === 0 || users.length === 0 ? null : (
                        <div className="mt-4 flex justify-end items-center gap-4 text-gray-800">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-md ${currentPage === 1
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                            >
                                Previous
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-md ${currentPage === totalPages
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
