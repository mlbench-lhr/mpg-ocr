"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import AddJobModal from "../components/AddJobModal";
import EditJobModal from "../components/EditJobModal";
import Swal from "sweetalert2";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { RiArrowDropDownLine } from "react-icons/ri";
import Image from "next/image";


interface Job {
  _id: string;
  selectedDays: string[];
  fromTime: string;
  toTime: string;
  everyTime: string;
  active: boolean;
}

const JobPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const toggleStatus = async (_id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/jobs/add-job`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: _id, active }),
      });

      if (res.ok) {
        await fetchJobs();
      } else {
        const errorData = await res.json();
        console.error("Error updating status:", errorData.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEditJob = async (_id: string) => {
    try {
      const response = await fetch(`/api/jobs/edit/${_id}`);
      const jobData = await response.json();
      setEditingJob(jobData);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching job data:", error);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingJob(null);
  };

  const handleJobUpdate = (updatedJob: Job) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => (job._id === updatedJob._id ? updatedJob : job))
    );
  };

  const handleDeleteJob = async (_id: string) => {

    const result = await Swal.fire({
      title: "Delete Job",
      text: "Are you sure you want to delete this Job??",
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
          await fetchJobs();
          console.log("Job deleted successfully");
          if (jobs.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        } else {
          const errorData = await response.json();
          console.error("Failed to delete job:", errorData.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
      }

    }

  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoadingTable(true);

      //  const response = await fetch(`/api/jobs/add-job/?page=${currentPage}`);
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery.trim())}` : '';
      const response = await fetch(`/api/jobs/add-job/?page=${currentPage}${searchParam}`);

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
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
          leftContent="Jobs"
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
          buttonContent={
            <button
              className="bg-[#005B97] rounded-lg py-2 px-6 text-white md:mt-0 w-60 md:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              Add New
            </button>
          }
        />
        <div className="flex-1 p-4 bg-white">

          {loadingTable ? (
            <div className="flex justify-center items-center">
              <Spinner />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center mt-20">
              <Image
                src="/images/no_jobs.svg"
                alt="No jobs found"
                width={200}
                height={200}
                priority
              />
            </div>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr className="text-xl text-gray-800">
                  <th className="py-2 px-4 border-b text-start">Job Name</th>
                  <th className="py-2 px-4 border-b text-center">Mo</th>
                  <th className="py-2 px-4 border-b text-center">Tu</th>
                  <th className="py-2 px-4 border-b text-center">We</th>
                  <th className="py-2 px-4 border-b text-center">Th</th>
                  <th className="py-2 px-4 border-b text-center">Fr</th>
                  <th className="py-2 px-4 border-b text-center">Sa</th>
                  <th className="py-2 px-4 border-b text-center">Su</th>
                  <th className="py-2 px-4 border-b text-center">At/From</th>
                  <th className="py-2 px-4 border-b text-center">To</th>
                  <th className="py-2 px-4 border-b text-center">Every</th>
                  <th className="py-2 px-4 border-b text-center">Status</th>
                  <th className="py-2 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job: Job, index: number) => {
                  const jobNumber = (currentPage - 1) * jobsPerPage + (index + 1);

                  return (
                    <tr key={job._id} className="text-gray-600">
                      <td className="py-2 px-4 border-b text-start text-xl font-medium">
                        {`Job #${jobNumber}`}
                      </td>

                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <td key={day} className="py-2 px-4 border-b text-center">
                          <input
                            type="checkbox"
                            checked={job.selectedDays.includes(day)}
                            className="w-4 h-4"
                            readOnly
                          />
                        </td>
                      ))}
                      <td className="py-2 px-4 border-b text-center">{job.fromTime}</td>
                      <td className="py-2 px-4 border-b text-center">{job.toTime}</td>
                      <td className="py-2 px-4 border-b text-center">{job.everyTime}</td>
                      <td className="py-2 px-4 border-b text-center">
                        <div
                          className={`inline-flex items-center justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${job.active ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
                            } group relative`}
                        >
                          <div>{job.active ? "Active" : "Inactive"}</div>
                          <div>
                            <RiArrowDropDownLine className="text-2xl p-0" />
                          </div>
                          <ul className="absolute mt-2 bg-white border rounded-md shadow-lg w-24 hidden group-hover:block">
                            <li
                              onClick={() => toggleStatus(job._id, true)}
                              className="cursor-pointer px-3 py-1 hover:bg-blue-100 text-blue-600"
                            >
                              Active
                            </li>
                            <li
                              onClick={() => toggleStatus(job._id, false)}
                              className="cursor-pointer px-3 py-1 hover:bg-red-100 text-red-600"
                            >
                              Inactive
                            </li>
                          </ul>
                        </div>
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        <button onClick={() => handleEditJob(job._id)} className="mr-5">
                          <BiSolidEditAlt className="fill-[#005B97] text-2xl" />
                        </button>
                        <button onClick={() => handleDeleteJob(job._id)} className="">
                          <MdDelete className="fill-[red] text-2xl" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {loadingTable || totalPages === 0 ?
            ''
            :
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
          }
        </div>
      </div>
      {isModalOpen && (
        <AddJobModal onClose={() => setIsModalOpen(false)} onSubmit={() => fetchJobs()} />
      )}
      {isEditModalOpen && editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={handleCloseModal}
          onSubmit={handleJobUpdate}
        />
      )}
    </div>
  );
};

export default JobPage;
