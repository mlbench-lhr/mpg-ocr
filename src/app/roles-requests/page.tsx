"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import Image from "next/image";
import Swal from 'sweetalert2';


interface User {
    _id: string;
    name: string;
    email: string;
    status: number; // Replaced IntegerType with number
    role: string;
    createdAt: string; // Keeping it string as we handle formatting in the render
}

export default function Page() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);
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
                setTotalUsers(data.totalUsers);
            } else {
                console.error("Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoadingTable(false);
        }
    }, [currentPage, searchQuery]);

    // Handle accept/reject action
    // const updateStatus = async (userId: string, newStatus: number) => {
    //     try {
    //         const response = await fetch(`/api/role-requests/update-status`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({ userId, status: newStatus }),
    //         });

    //         if (response.ok) {
    //             // Update the UI to reflect the status change
    //             setUsers((prevUsers) =>
    //                 prevUsers.map((user) =>
    //                     user._id === userId ? { ...user, status: newStatus } : user
    //                 )
    //             );
    //         } else {
    //             console.error("Failed to update status");
    //         }
    //     } catch (error) {
    //         console.error("Error updating status:", error);
    //     }
    // };


const updateStatus = async (userId: string, newStatus: number) => {
    try {
        // Show confirmation modal using SweetAlert2
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to change the status to ${newStatus === 1 ? 'Accepted' : 'Rejected'}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, proceed!',
            cancelButtonText: 'No, cancel',
        });

        if (result.isConfirmed) {
            // If user confirms, proceed with status update
            const response = await fetch(`/api/role-requests/update-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, status: newStatus }),
            });

            if (response.ok) {
                // Update the UI to reflect the status change
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === userId ? { ...user, status: newStatus } : user
                    )
                );
                Swal.fire(
                    'Updated!',
                    `The status has been updated to ${newStatus === 1 ? 'Accepted' : 'Rejected'}.`,
                    'success'
                );
            } else {
                Swal.fire('Error!', 'Failed to update status', 'error');
            }
        }
    } catch (error) {
        console.error('Error updating status:', error);
        Swal.fire('Error!', 'Something went wrong. Please try again later.', 'error');
    }
};


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
                    leftContent="Role Requests"
                    totalContent={totalUsers}
                    rightContent={
                        <input
                            type="text"
                            placeholder="Search user..."
                            className="px-4 py-2 rounded-lg border border-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    }
                    buttonContent={''}

                />
                <div className="flex-1 p-4 bg-white">

                    {users.length === 0 ? (
                        <div className="flex flex-col items-center mt-40">
                            <Image
                                src="/images/no_request.svg"
                                alt="logo"
                                width={200}
                                height={200}
                                priority
                            />
                        </div>
                    ) : (
                        <table className="min-w-full bg-white border-gray-300">
                            <thead>
                                <tr className="text-xl text-gray-800">
                                    <th className="py-2 px-4 border-b text-start font-medium">User Name</th>
                                    <th className="py-2 px-4 border-b text-center font-medium">Request For</th>
                                    <th className="py-2 px-4 border-b text-center font-medium">Requested On</th>
                                    <th className="py-2 px-4 border-b text-center font-medium">Actions</th>
                                </tr>
                            </thead>
                            {loadingTable ? (
                                <tbody>
                                    <tr>
                                        <td colSpan={4} className="text-center py-8">
                                            <Spinner />
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center text-lg font-medium text-gray-700">
                                                No requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user: User) => (
                                            <tr key={user._id} className="text-gray-600">
                                                <td className="py-1 px-4 border-b text-start text-lg font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-800">
                                                            {user.name}
                                                        </span>
                                                        <span className=" text-gray-500">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-1 px-4 border-b text-center text-gray-500">
                                                    {user.role === "standarduser"
                                                        ? "Standard User"
                                                        : user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                                                </td>

                                                <td className="py-1 px-4 border-b text-center text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="py-1 px-4 border-b text-center">
                                                    {user.status === 1 ? (
                                                        <span className="text-green-500 font-medium  bg-green-200 px-4 py-2 rounded-lg">Accepted</span>
                                                    ) : user.status === 2 ? (
                                                        <span className="text-red-500 font-medium bg-red-200 px-4 py-2 rounded-lg">Rejected</span>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(user._id, 1)}
                                                                className="mr-3 px-3 py-1 text-white bg-green-500 hover:bg-green-600 rounded-md"
                                                                aria-label={`Accept request from ${user.name}`}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(user._id, 2)}
                                                                className="px-3 py-1 text-white bg-red-500 hover:bg-red-600 rounded-md"
                                                                aria-label={`Reject request from ${user.name}`}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            )}
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
