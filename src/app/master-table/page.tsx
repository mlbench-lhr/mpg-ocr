"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Swal from "sweetalert2";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";

interface Job {
  _id: string;
  blNumber: string;
  carrier: string;
  podDate: string;
  podSignature: string;
  totalQty: number;
  delivered: number;
  damaged: number;
  short: number;
  over: number;
  refused: number;
  sealIntact: string;
  finalStatus: string;
  reviewStatus: string;
  recognitionStatus: string;
  reviewedBy: string;
}

const MasterPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [master, setMaster] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);


  const router = useRouter();


  const handleSidebarToggle = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
};


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
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
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoadingTable(true);

      // Build query string based on currentPage and searchQuery
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const response = await fetch(`/api/process-data/get-data/?page=${currentPage}${searchParam}`);

      if (response.ok) {
        const data = await response.json();
        setMaster(data.jobs);
        setTotalPages(data.totalPages);
        setTotalJobs(data.totalJobs);
      } else {
        console.error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, fetchJobs, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDeleteJob = async (_id: string) => {
    const result = await Swal.fire({
      title: "Delete Job",
      text: "Are you sure you want to delete this Job?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#005B97",
      cancelButtonColor: "#F0F1F3",
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/jobs/delete-job/${_id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchJobs();
          console.log("Job deleted successfully");
        } else {
          const errorData = await response.json();
          console.error("Failed to delete job:", errorData.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <p>Access Denied. Redirecting...</p>;

  return (
    <div className="flex flex-row h-screen bg-white">
      <Sidebar onToggleExpand={handleSidebarToggle} />
      <div
        className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isSidebarExpanded ? "ml-64" : "ml-24"
          }`}
      >
        <Header
          leftContent="Master Tables"
          totalContent={totalJobs}
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
        <div className="flex-1 p-4">
          {loadingTable ? (
            <Spinner />
          ) : (
            <table>
              <thead>
                <tr className="text-gray-800">
                  <th className="py-2 px-4 border-b text-start min-w-32">BL Number</th>
                  <th className="py-2 px-4 border-b text-center min-w-32">Carrier</th>
                  <th className="py-2 px-4 border-b text-center min-w-32">POD Date</th>
                  <th className="py-2 px-4 border-b text-center min-w-32">POD Signature</th>
                  <th className="py-2 px-4 border-b text-center min-w-28">Total Qty</th>
                  <th className="py-2 px-4 border-b text-center min-w-28">Delivered</th>
                  <th className="py-2 px-4 border-b text-center min-w-28">Damaged</th>
                  <th className="py-2 px-4 border-b text-center min-w-28">Short</th>
                  <th className="py-2 px-4 border-b text-center min-w-28">Over</th>
                  <th className="py-2 px-4 border-b text-center min-w-28">Refused</th>
                  <th className="py-2 px-4 border-b text-center min-w-32">Seal Intact</th>
                  <th className="py-2 px-4 border-b text-center min-w-32">Final Status</th>
                  <th className="py-2 px-4 border-b text-center min-w-36">Review Status</th>
                  <th className="py-2 px-4 border-b text-center min-w-48">Recognition Status</th>
                  <th className="py-2 px-4 border-b text-center min-w-36">Reviewed By</th>
                  <th className="py-2 px-4 border-b text-center min-w-28">Action</th>
                </tr>
              </thead>
              <tbody>
                {master.map((job) => (
                  <tr key={job._id} className="text-gray-500">
                    <td className="py-2 px-4 border-b text-start">{job.blNumber}</td>
                    <td className="py-2 px-4 border-b text-center">{job.carrier}</td>
                    <td className="py-2 px-4 border-b text-center">{job.podDate}</td>
                    <td className="py-2 px-4 border-b text-center">{job.podSignature}</td>
                    <td className="py-2 px-4 border-b text-center">{job.totalQty}</td>
                    <td className="py-2 px-4 border-b text-center">{job.delivered}</td>
                    <td className="py-2 px-4 border-b text-center">{job.damaged}</td>
                    <td className="py-2 px-4 border-b text-center">{job.short}</td>
                    <td className="py-2 px-4 border-b text-center">{job.over}</td>
                    <td className="py-2 px-4 border-b text-center">{job.refused}</td>
                    <td className="py-2 px-4 border-b text-center">{job.sealIntact}</td>
                    <td className="py-2 px-4 border-b text-center">{job.finalStatus}</td>
                    <td className="py-2 px-4 border-b text-center">{job.reviewStatus}</td>
                    <td className="py-2 px-4 border-b text-center">{job.recognitionStatus}</td>
                    <td className="py-2 px-4 border-b text-center">{job.reviewedBy}</td>
                    <td className="flex items-center justify-center">
                      <BiSolidEditAlt className="cursor-pointer text-xl" />
                      <MdDelete
                        className="cursor-pointer text-xl ml-2"
                        onClick={() => handleDeleteJob(job._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
           <div className="mt-4 flex justify-end gap-5 items-center text-gray-800">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
              >
                Next
              </button>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default MasterPage;
