"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export interface Log {
  _id: string; // MongoDB ObjectId as string
  message: string;
  fileName: string;
  status: string;
  timestamp: string;
  connectionResult:string; // ISO string, if using toISOString()
}

export default function Page() {
  const [totalLogs, setTotalLogs] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

useEffect(() => {
  const fullUrl = window.location.href; // includes protocol, hostname, port, and path
  console.log(fullUrl);
}, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/admin-login");
      return;
    }

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

    const decodedToken = decodeJwt(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token");
      router.push("/admin-login");
      return;
    }

    if (decodedToken.role !== "admin") {
      router.push("/extracted-data-monitoring");
      return;
    }

    setIsAuthenticated(true);
    setLoadingTable(false);
  }, [router]);

  const { isExpanded } = useSidebar();

  const handleSidebarStateChange = (newState: boolean) => {
    // setIsSidebarExpanded(newState);
    return newState;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingTable(true);

      const searchParam = searchQuery
        ? `&search=${encodeURIComponent(searchQuery)}`
        : "";
      const response = await fetch(
        `/api/get-logs/?page=${currentPage}${searchParam}`
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setTotalLogs(data.totalLogs);
      } else {
        console.log("Failed to fetch logs");
      }
    } catch (error) {
      console.log("Error fetching logs:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, fetchUsers, searchQuery]);

  if (!isAuthenticated) return <p>Access Denied. Redirecting...</p>;

  return (
    <div className="flex flex-row h-screen bg-white">
      <Sidebar onStateChange={handleSidebarStateChange} />
      <div
        className={`flex-1 flex flex-col transition-all bg-white duration-300 ${
          !isExpanded ? "ml-24" : "ml-64"
        }`}
      >
        <Header
          leftContent="Total Logs"
          totalContent={totalLogs}
          rightContent={
            <input
              type="text"
              placeholder="Search user..."
              className="px-4 py-2 rounded-lg border border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          }
          buttonContent={""}
        />
        <div className="flex-1 p-4 bg-white">
          {loadingTable ? (
            <div className="flex justify-center items-center">
              <Spinner />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center mt-20">
              <Image
                src="/images/no_request.svg"
                alt="No jobs found"
                width={200}
                height={200}
                priority
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          ) : (
            <table className="min-w-full bg-white border-gray-300">
              <thead>
                <tr className="text-xl text-gray-800">
                  <th className="py-2 px-4 border-b text-start font-medium">
                    File Name
                  </th>
                  <th className="py-2 px-4 border-b text-center font-medium">
                    Message
                  </th>
                  <th className="py-2 px-4 border-b text-center font-medium">
                    Submitted At
                  </th>
                <th className="py-2 px-4 border-b text-center font-medium">
                    Oracle Connection
                  </th>

                  <th className="py-2 px-4 border-b text-center font-medium">
                    Status
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((logs: Log) => (
                  <tr key={logs._id} className="text-gray-600">
                    <td className="py-1 px-4 border-b text-start text-lg font-medium">
                      {logs.fileName}
                    </td>

                    <td className="py-1 px-4 border-b text-center">
                      {logs.message}
                    </td>
                    <td className="py-1 px-4 border-b text-center text-gray-500">
                      {new Date(logs.timestamp).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                <td className="py-1 px-4 border-b text-center">
                      {logs.connectionResult}
                    </td>
                    <td className="py-1 px-4 border-b text-center">
                      {logs.status}
                    </td>
                    <td className="py-1 px-4 border-b text-center "><Link href={`/logs/${logs?._id}`} className="text-[#005B97] hover:underline">Details</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {loadingTable || totalPages === 0 || logs.length === 0 ? null : (
            <div className="mt-4 flex justify-end items-center gap-4 text-gray-800">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
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
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
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
