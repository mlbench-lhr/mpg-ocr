"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import AddJobModal from "../components/AddJobModal";


interface Job {
  _id: string;   // Assuming the job has an _id of type string
  fromTime: string;
  toTime: string;
  everyTime: string;
}

const MasterPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const handleSidebarToggle = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  };


  const router = useRouter();

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
      const response = await fetch(`/api/jobs/add-job/?page=${currentPage}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
        setTotalPages(data.totalPages);
      } else {
        console.error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, fetchJobs]);

  const handleEditJob = (jobId: string) => {
    console.log("Edit Job:", jobId);
    // Implement edit logic
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        const response = await fetch(`/api/jobs/add-job/${jobId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchJobs();
          console.log("Job deleted successfully");
        } else {
          console.error("Failed to delete job");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <p>Access Denied. Redirecting...</p>;

  return (
    <div className="flex flex-row h-screen bg-white">
      <Sidebar onToggleExpand={handleSidebarToggle} />
      <div
        className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isSidebarExpanded ? "ml-64" : "ml-20"
          }`}
      >
        <Header
          leftContent="MasterTable"
          totalContent={0}
          rightContent={
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-lg border border-gray-300"
            />
          }
          buttonContent={
            <button
              className="bg-[#005B97] rounded-lg py-2 px-6 text-white md:mt-0 w-60 md:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              Add New
            </button>
          }
        />
        <div className="flex-1 p-4">
          <table className="min-w-full text-gray-800 bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Job Name</th>
                <th className="py-2 px-4 border-b">At/From</th>
                <th className="py-2 px-4 border-b">To</th>
                <th className="py-2 px-4 border-b">Every</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job: Job) => (
                <tr key={job._id}>
                  <td className="py-2 px-4 border-b">{job._id}</td>
                  <td className="py-2 px-4 border-b">{job.fromTime}</td>
                  <td className="py-2 px-4 border-b">{job.toTime}</td>
                  <td className="py-2 px-4 border-b">{job.everyTime}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEditJob(job._id)}
                      className="text-blue-500 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end gap-5 items-center text-gray-800">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <AddJobModal onClose={() => setIsModalOpen(false)} onSubmit={() => fetchJobs()} />
      )}
    </div>
  );
};

export default MasterPage;
