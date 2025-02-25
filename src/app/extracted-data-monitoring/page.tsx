"use client";

import { useState, useEffect, useCallback, useRef } from "react";
// import { motion } from "framer-motion";
import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosInformationCircle } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { GiShare } from "react-icons/gi";
import { FiSearch } from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";
import { IoCalendar } from "react-icons/io5";
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import { Instance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import TableSpinner from "../components/TableSpinner";
import UploadModal from "../components/UploadModal";


type FinalStatus = "new" | "inProgress" | "valid" | "partiallyValid" | "failure" | "sent";
type ReviewStatus = "unConfirmed" | "confirmed" | "denied" | "deleted";
type RecognitionStatus = "new" | "inProgress" | "valid" | "partiallyValid" | "failure" | "sent";
type BreakdownReason = "none" | "damaged" | "shortage" | "overage" | "refused";


interface Job {
  _id: string;
  blNumber: string;
  pdfUrl?: string;
  jobName: string;
  podDate: string;
  deliveryDate: Date;
  podSignature: string;
  totalQty: number;
  received: number;
  damaged: number;
  short: number;
  over: number;
  refused: number;
  noOfPages: number;
  stampExists: string;
  finalStatus: FinalStatus;
  reviewStatus: ReviewStatus;
  recognitionStatus: RecognitionStatus;
  breakdownReason: BreakdownReason;
  reviewedBy: string;
  cargoDescription: string;
  createdAt: string;
  updatedAt?: string;
  customerOrderNum?: string | string[] | null;
}


const MasterPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [isFilterDropDownOpen, setIsFilterDropDownOpen] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [master, setMaster] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showButton, setShowButton] = useState(false);
  const [name, setName] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [finalStatusFilter, setFinalStatusFilter] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("");
  const [reasonStatusFilter, setReasonStatusFilter] = useState("");
  const [reviewByStatusFilter, setReviewByStatusFilter] = useState("");
  const [podDateFilter, setPodDateFilter] = useState("");
  const [podDateSignatureFilter, setPodDateSignatureFilter] = useState("");
  const [jobNameFilter, setJobNameFilter] = useState("");
  const [bolNumberFilter, setBolNumberFilter] = useState("");
  const [dropdownStates, setDropdownStates] = useState<string | null>(null);
  const [dropdownStatesFirst, setDropdownStatesFirst] = useState<string | null>(null);
  const [dropdownStatesSecond, setDropdownStatesSecond] = useState<string | null>(null);
  const [dropdownStatesThird, setDropdownStatesThird] = useState<string | null>(null);
  const parentRefFinal = useRef<Instance | null>(null);
  const parentRefReview = useRef<Instance | null>(null);
  const parentRefRecognition = useRef<Instance | null>(null);
  const parentRefBreakdown = useRef<Instance | null>(null);
  const [firstTime, setFirstTime] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [progress, setProgress] = useState(0);


  // const [carrierFilter, setCarrierFilter] = useState("");
  const router = useRouter();

  const finalOptions = [
    { status: "new", color: "text-blue-600", bgColor: "bg-blue-100" },
    { status: "inProgress", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { status: "valid", color: "text-green-600", bgColor: "bg-green-100" },
    { status: "partiallyValid", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
    { status: "failure", color: "text-red-600", bgColor: "bg-red-100" },
    { status: "sent", color: "text-green-600", bgColor: "bg-green-100" },
  ];
  const reviewOptions = [
    { status: "unConfirmed", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { status: "confirmed", color: "text-green-600", bgColor: "bg-green-100" },
    { status: "deleted", color: "text-red-600", bgColor: "bg-red-100" },
    { status: "denied", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
  ];
  const recognitionOptions = [
    { status: "new", color: "text-blue-600", bgColor: "bg-blue-100" },
    { status: "inProgress", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { status: "valid", color: "text-green-600", bgColor: "bg-green-100" },
    { status: "partiallyValid", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
    { status: "failure", color: "text-red-600", bgColor: "bg-red-100" },
    { status: "sent", color: "text-green-600", bgColor: "bg-green-100" },
  ];
  const breakdownOptions = [
    { status: "none", color: "text-blue-600", bgColor: "bg-blue-100" },
    { status: "damaged", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { status: "shortage", color: "text-green-600", bgColor: "bg-green-100" },
    { status: "overage", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
    { status: "refused", color: "text-red-600", bgColor: "bg-red-100" },
  ];
  const isAnyFilterApplied = () => {
    return (
      sessionStorage.getItem("finalStatusFilter") ||
      sessionStorage.getItem("reviewStatusFilter") ||
      sessionStorage.getItem("reasonStatusFilter") ||
      sessionStorage.getItem("reviewByStatusFilter") ||
      sessionStorage.getItem("podDateFilter") ||
      sessionStorage.getItem("podDateSignatureFilter") ||
      sessionStorage.getItem("jobNameFilter") ||
      sessionStorage.getItem("bolNumberFilter")
      // sessionStorage.getItem("sortColumn")
    );
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("prev") === "") {
        setFirstTime(true);
        setFinalStatusFilter(sessionStorage.getItem("finalStatusFilter") || "");
        setReviewStatusFilter(sessionStorage.getItem("reviewStatusFilter") || "");
        setReasonStatusFilter(sessionStorage.getItem("reasonStatusFilter") || "");
        setReviewByStatusFilter(sessionStorage.getItem("reviewByStatusFilter") || "");
        setPodDateFilter(sessionStorage.getItem("podDateFilter") || "");
        setPodDateSignatureFilter(sessionStorage.getItem("podDateSignatureFilter") || "");
        setJobNameFilter(sessionStorage.getItem("jobNameFilter") || "");
        setBolNumberFilter(sessionStorage.getItem("bolNumberFilter") || "");
        setBolNumberFilter(sessionStorage.getItem("sortColumn") || "");
      }
      else {
        sessionStorage.setItem("finalStatusFilter", "");
        sessionStorage.setItem("reviewStatusFilter", "");
        sessionStorage.setItem("reasonStatusFilter", "");
        sessionStorage.setItem("reviewByStatusFilter", "");
        sessionStorage.setItem("podDateFilter", "");
        sessionStorage.setItem("podDateSignatureFilter", "");
        sessionStorage.setItem("jobNameFilter", "");
        sessionStorage.setItem("sortColumn", "");
        sessionStorage.setItem("bolNumberFilter", "");
        setFinalStatusFilter("");
        setReviewStatusFilter("");
        setReasonStatusFilter("");
        setReviewByStatusFilter("");
        setPodDateFilter("");
        setPodDateSignatureFilter("");
        setJobNameFilter("");
        setSortColumn("");
        setBolNumberFilter("");
        setFirstTime(false);
      }
    }
  }, []);

  // const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>();
  // const handleSidebarStateChange = (newState: boolean) => {
  //   setIsSidebarExpanded(newState);
  // };

  const { isExpanded } = useSidebar();

  const handleSidebarStateChange = (newState: boolean) => {
    return newState;
    // console.log("Sidebar state changed:", newState);
    // setIsSidebarExpanded(newState);
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

    setUserRole(decodedToken.role);

    if (userRole === "admin") {
      setName("Admin");
    } else {
      setName(decodedToken.username);
    }

    if (userRole === "admin") {
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        router.push("/admin-login");
        return;
      }
    } else {
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [router, userRole]);

  const handleRowSelection = (id: string) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  // Fetch OCR status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/jobs/ocr");
        const data = await response.json();
        setIsOcrRunning(data.status === "start");
      } catch (error) {
        console.error("Error fetching OCR status:", error);
      }
    };

    fetchStatus();
  }, []);

  // const handleOcrToggle = async () => {
  //   const newStatus = isOcrRunning ? "stop" : "start";

  //   try {
  //     const response = await fetch("/api/jobs/ocr", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ status: newStatus }),
  //     });

  //     const data = await response.json();
  //     if (response.ok) {
  //       setIsOcrRunning(!isOcrRunning);
  //     } else {
  //       console.error("Error:", data.message);
  //     }
  //   } catch (error) {
  //     console.error("Request failed:", error);
  //   }
  // };

  // const handleOcrToggle = async () => {
  //   if (selectedRows.length === 0) return;

  //   setIsOcrRunning(true);
  //   setProgress(0);


  //   const pdfFiles = selectedRows.map((rowId) => {
  //     const job = master.find((job) => job._id === rowId);
  //     return job ? { file_url: job.pdfUrl } : null;
  //   }).filter(Boolean);


  //   try {

  //     const response = await fetch("https://hanneskonzept.ml-bench.com/api/process-pdf", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ pdfFiles }),
  //     });

  //     if (!response.ok) throw new Error("Failed to start OCR");

  //     // Polling to track progress
  //     const interval = setInterval(async () => {
  //       console.log("good");
  //       const progressResponse = await fetch("https://hanneskonzept.ml-bench.com/api/ocr-progress");
  //       const progressData = await progressResponse.json();
  //       setProgress(progressData.progress);

  //       if (progressData.progress >= 100) {
  //         clearInterval(interval);
  //         setIsOcrRunning(false);
  //       }
  //     }, 500);

  //   } catch (error) {
  //     console.error("Error processing OCR:", error);
  //     setIsOcrRunning(false);
  //   }
  // };

  const handleOcrToggle = async () => {
    if (selectedRows.length === 0) return;

    setIsOcrRunning(true);
    setProgress(0);

    const pdfFiles = selectedRows
      .map((rowId) => {
        const job = master.find((job) => job._id === rowId);
        return job ? { file_url: job.pdfUrl } : null;
      })
      .filter(Boolean);

    let interval: NodeJS.Timeout | null = null;

    try {
      interval = setInterval(async () => {
        try {
          const progressResponse = await fetch("https://hanneskonzept.ml-bench.com/api/ocr-progress");
          if (!progressResponse.ok) throw new Error("Failed to fetch progress");

          const progressData = await progressResponse.json();
          console.log(progressData);
          setProgress(progressData.progress);

          if (progressData.progress >= 100) {
            clearInterval(interval!);
            setIsOcrRunning(false);
            setSelectedRows([]);
            setProgress(0);
            fetchJobs();
          }
        } catch (error) {
          console.error("Error fetching progress:", error);
        }
      }, 30000);

      const response = await fetch("https://hanneskonzept.ml-bench.com/api/process-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfFiles }),
      });

      if (!response.ok) throw new Error("Failed to start OCR");

    } catch (error) {
      console.error("Error processing OCR:", error);
      setIsOcrRunning(false);
      if (interval) clearInterval(interval);
    }
  };




  const handleSelectAll = () => {
    if (selectedRows.length === master.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(master.map((job) => job._id));
    }
  };

  const isAllSelected = selectedRows.length === master.length && master.length > 0;

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const updateStatus = async (id: string, field: string, value: string, reviewedBy: string): Promise<void> => {

    const formattedReviewedBy = capitalizeFirstLetter(reviewedBy);

    try {
      const res = await fetch(`/api/process-data/update-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field, value, reviewedBy: formattedReviewedBy }),
      });

      if (res.ok) {
        setMaster((prevJobs) =>
          prevJobs.map((job) =>
            job._id === id ? { ...job, [field]: value, reviewedBy: formattedReviewedBy } : job
          )
        );

        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `The status has been updated to ${value}.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const errorData = await res.json();
        console.log(
          `Failed to update status: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.log("Error updating status:", error);
    }
  };

  const handleDelete = async () => {
    Swal.fire({
      title: 'Delete Files',
      text: 'Are you sure you want to delete these files?',
      icon: 'warning',
      iconColor: '#005B97',
      showCancelButton: true,
      confirmButtonColor: '#005B97',
      cancelButtonColor: '#E0E0E0',
      confirmButtonText: 'Delete',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch('/api/process-data/delete-rows', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: selectedRows }),
          });

          const result = await response.json();

          if (response.ok) {
            const isLastPage = master.length === selectedRows.length && currentPage > 1;
            if (isLastPage) {
              setCurrentPage((prevPage) => prevPage - 1);
            }

            await fetchJobs();
            setTotalJobs(totalJobs - selectedRows.length);
            setSelectedRows([]);
            Swal.fire({
              title: 'Deleted!',
              text: 'Your files have been deleted.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: result.error || 'Failed to delete files.',
              icon: 'error',
            });
          }
        } catch (error) {
          console.log('Error deleting files:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete files due to a network or server error.',
            icon: 'error',
          });
        }
      }
    });
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoadingTable(true);
      const filters = {
        bolNumber: sessionStorage.getItem("bolNumberFilter") || "",
        finalStatus: sessionStorage.getItem("finalStatusFilter") || "",
        reviewStatus: sessionStorage.getItem("reviewStatusFilter") || "",
        reasonStatus: sessionStorage.getItem("reasonStatusFilter") || "",
        reviewByStatus: sessionStorage.getItem("reviewByStatusFilter") || "",
        podDate: sessionStorage.getItem("podDateFilter") || "",
        podDateSignature: sessionStorage.getItem("podDateSignatureFilter") || "",
        jobName: sessionStorage.getItem("jobNameFilter") || "",

        sortColumn: sessionStorage.getItem("sortColumn") || "",
        sortOrder: sessionStorage.getItem("sortOrder") || "asc",
      };

      // Check if all filters are empty
      // const hasFilters = Object.values(filters).some((filter) => filter.trim() !== "");
      // if (!hasFilters) {
      //   setLoadingTable(false);
      //   return;
      // }

      const queryParams = new URLSearchParams();
      queryParams.set("page", currentPage.toString());

      if (filters.bolNumber) queryParams.set("bolNumber", filters.bolNumber.trim());
      if (filters.finalStatus) queryParams.set("recognitionStatus", filters.finalStatus);
      if (filters.reviewStatus) queryParams.set("reviewStatus", filters.reviewStatus);
      if (filters.reasonStatus) queryParams.set("breakdownReason", filters.reasonStatus);
      if (filters.reviewByStatus) queryParams.set("reviewByStatus", filters.reviewByStatus);
      if (filters.podDate) queryParams.set("podDate", filters.podDate);
      if (filters.podDateSignature) queryParams.set("podDateSignature", filters.podDateSignature.trim());
      if (filters.jobName) queryParams.set("jobName", filters.jobName.trim());

      if (filters.sortColumn) queryParams.set("sortColumn", filters.sortColumn);
      if (filters.sortOrder) queryParams.set("sortOrder", filters.sortOrder);


      // console.log("Query Params:", queryParams.toString());
      const response = await fetch(`/api/process-data/get-data/?${queryParams.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setMaster(data.jobs);
        setTotalPages(data.totalPages);
        setTotalJobs(data.totalJobs);
      } else {
        console.log("Failed to fetch jobs");
      }
    } catch (error) {
      console.log("Error fetching jobs:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [
    currentPage,
    // bolNumberFilter,
    // finalStatusFilter,
    // reviewStatusFilter,
    // reasonStatusFilter,
    // reviewByStatusFilter,
    // podDateFilter,
    // podDateSignatureFilter,
    // jobNameFilter,
    // carrierFilter,
  ]);


  // const toggleSort = (column: string) => {
  //   if (sortColumn === column) {
  //     setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  //   } else {
  //     setSortColumn(column);
  //     setSortOrder("asc");
  //   }
  //   sessionStorage.setItem("sortColumn", column);
  //   sessionStorage.setItem("sortOrder", sortOrder === "asc" ? "desc" : "asc");
  //   fetchJobs();
  // };


  useEffect(() => {
    if (firstTime) {
      fetchJobs();
      setFirstTime(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, firstTime, sortColumn, sortOrder]);

  const handleFilterApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sessionStorage.setItem("finalStatusFilter", finalStatusFilter);
    sessionStorage.setItem("reviewStatusFilter", reviewStatusFilter);
    sessionStorage.setItem("reasonStatusFilter", reasonStatusFilter);
    sessionStorage.setItem("reviewByStatusFilter", reviewByStatusFilter);
    sessionStorage.setItem("podDateFilter", podDateFilter);
    sessionStorage.setItem("podDateSignatureFilter", podDateSignatureFilter);
    sessionStorage.setItem("jobNameFilter", jobNameFilter);
    sessionStorage.setItem("bolNumberFilter", bolNumberFilter);
    sessionStorage.setItem("sortColumn", sortColumn || "");
    sessionStorage.setItem("sortOrder", sortOrder);
    fetchJobs();
  };

  const resetFiltersAndFetch = async () => {
    sessionStorage.setItem("finalStatusFilter", "");
    sessionStorage.setItem("reviewStatusFilter", "");
    sessionStorage.setItem("reasonStatusFilter", "");
    sessionStorage.setItem("reviewByStatusFilter", "");
    sessionStorage.setItem("podDateFilter", "");
    sessionStorage.setItem("podDateSignatureFilter", "");
    sessionStorage.setItem("jobNameFilter", "");
    sessionStorage.setItem("sortColumn", "");
    sessionStorage.setItem("bolNumberFilter", "");
    setFinalStatusFilter("");
    setReviewStatusFilter("");
    setReasonStatusFilter("");
    setReviewByStatusFilter("");
    setPodDateFilter("");
    setPodDateSignatureFilter("");
    setJobNameFilter("");
    setSortColumn("");
    setBolNumberFilter("");
    setMaster([]);
    await fetchJobs();
  };

  const handleRouteChange = () => {
    if (typeof window !== "undefined") {
      const filters = {
        finalStatusFilter,
        reviewStatusFilter,
        reasonStatusFilter,
        reviewByStatusFilter,
        podDateFilter,
        podDateSignatureFilter,
        jobNameFilter,
        bolNumberFilter,
        sortColumn: sortColumn ?? "",
      };

      Object.entries(filters).forEach(([key, value]) => {
        sessionStorage.setItem(key, value);
      });
    }
  };


  const handlePageChange = (newPage: number) => {
    setFirstTime(true);
    setCurrentPage(newPage);
  }

  const handleSortColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortColumn(value);
    if (value) {
      sessionStorage.setItem("sortColumn", value);
    } else {
      sessionStorage.removeItem("sortColumn");
    }
    setFirstTime(true);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "asc" | "desc";
    setSortOrder(value);
    sessionStorage.setItem("sortOrder", value);
    setFirstTime(true);
  };

  const handleSend = () => {
    Swal.fire({
      title: 'Send Files',
      text: 'Are you sure you want to send these files?',
      icon: 'warning',
      iconColor: '#AF9918',
      showCancelButton: true,
      confirmButtonColor: '#AF9918',
      cancelButtonColor: '#E0E0E0',
      confirmButtonText: 'Yes Sure!',
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedRows([]);
        Swal.fire({
          title: 'Sent!',
          text: 'Your files have been Sent.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  useEffect(() => {
    setShowButton(selectedRows.length > 0);
  }, [selectedRows]);

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <p>Access Denied. Redirecting...</p>;

  return (
    <div className="h-screen bg-white overflow-x-hidden max-w-screen">
      <Sidebar onStateChange={handleSidebarStateChange} />
      <div
        className={`flex-1 flex flex-col transition-all bg-white duration-300 ${!isExpanded ? "ml-24" : "ml-64"
          }`}
      >
        <Header
          leftContent="Extracted Data Monitoring"
          totalContent={totalJobs}
          rightContent={<>
            <div className="flex gap-4 mr-3">
              {showButton && (<>
                <div
                  className="flex gap-2 group cursor-pointer transition-all duration-300"
                  onClick={handleDelete}
                >
                  <span>
                    <MdDelete
                      className="fill-[red] text-2xl transition-transform transform group-hover:scale-110 group-hover:duration-300"
                    />
                  </span>
                  <span
                    className="text-[red] transition-all duration-300 group-hover:text-red-600  group-hover:duration-300"
                  >
                    Delete
                  </span>
                </div>

                <div
                  className="flex gap-2 group cursor-pointer transition-all duration-300"
                  onClick={handleSend}
                >
                  <span>
                    <GiShare
                      className="fill-[#AF9918] text-2xl transition-transform transform group-hover:scale-110 group-hover:duration-300"
                    />
                  </span>
                  <span
                    className="text-[#AF9918] transition-all duration-300 group-hover:text-[#D5A100]"
                  >
                    Send
                  </span>
                </div>
              </>

              )
              }

            </div>
          </>
          }
          buttonContent={
            <button className="hover:bg-[#005B97] hover:text-white border-[#005B97] border text-[#005B97] rounded-lg px-8 py-2 md:mt-0 w-44 md:w-44"  onClick={() => setIsModalOpen(true)}>
              Upload PDF
            </button>
          }
        />

        <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        <div className="flex-1 px-2 bg-white">

          {/* <Link
            href={{
            pathname: '/history',
            query: selectedRows.length > 0
            ? { selectedRows: JSON.stringify(selectedRows) }
            : undefined,
            }}
            >
            <button className="bg-[#005B97] rounded-lg py-2 px-10 text-white md:mt-0 w-60 md:w-auto">
            History
            </button>
            </Link> */}

          <div
            className={`bg-gray-200 p-3 mb-0 transition-all duration-500 ease-in w-full sm:w-auto ${isFilterDropDownOpen ? "rounded-t-lg" : "rounded-lg"}`}
          >
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsFilterDropDownOpen(!isFilterDropDownOpen)}>
              <span className="text-gray-800 text-sm sm:text-base md:text-lg">
                Filters
              </span>
              <span>
                <IoIosArrowForward
                  className={`text-xl p-0 text-[#005B97] transition-all duration-500 ease-in ${isFilterDropDownOpen ? 'rotate-90' : ''}`}
                />
              </span>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in w-auto ${isFilterDropDownOpen ? "max-h-[1000px] p-3" : "max-h-0"
              } flex flex-wrap gap-4 mt-0 bg-gray-200 rounded-b-lg`}
          >

            <form
              onSubmit={handleFilterApply}
              className="w-full grid grid-cols-3 gap-4"
            >

              <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  BL Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Bl Number"
                    value={bolNumberFilter}
                    onChange={(e) => setBolNumberFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-default"
                  >
                    <FiSearch size={20} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="finalStatusFilter" className="text-sm font-semibold text-gray-800">
                  Recognition Status
                </label>
                <div className="relative">
                  <select
                    id="finalStatusFilter"
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none cursor-pointer"
                    value={finalStatusFilter}
                    onChange={(e) => setFinalStatusFilter(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="new">new</option>
                    <option value="inProgress">inProgress</option>
                    <option value="valid">valid</option>
                    <option value="partiallyValid">partiallyValid</option>
                    <option value="failure">failure</option>
                    <option value="sent">sent</option>
                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500 cursor-default"
                  >
                    <FaChevronDown size={16} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="finalStatusFilter" className="text-sm font-semibold text-gray-800">
                  Review Status
                </label>
                <div className="relative">
                  <select
                    id="finalStatusFilter"
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none cursor-pointer"
                    value={reviewStatusFilter}
                    onChange={(e) => setReviewStatusFilter(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="unConfirmed">unConfirmed</option>
                    <option value="confirmed">confirmed</option>
                    <option value="deleted">deleted</option>
                    <option value="denied">denied</option>

                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500 cursor-default"
                  >
                    <FaChevronDown size={16} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              {/* <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  Carrier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Add"
                    value={carrierFilter}
                    onChange={(e) => setCarrierFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    <IoCopyOutline size={20} className="text-[#005B97]" />
                  </button>
                </div>
              </div> */}

              {/* <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  POD Date
                </label>
                <div className="relative">
                  <input
                    id="dateInput"
                    type="date"
                    placeholder="Date"
                    value={podDateFilter}
                    onChange={(e) => setPodDateFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] custom-date-input"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => {
                      const dateInput = document.getElementById('dateInput') as HTMLInputElement;
                      if (dateInput) {
                        dateInput.showPicker();
                      }
                    }}
                  >
                    <IoCalendar size={20} className="text-[#005B97]" />
                  </button>
                </div>
              </div> */}

              <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  POD Date
                </label>
                <div className="relative">
                  <input
                    id="dateInput"
                    type="date"
                    placeholder="YYYY-MM-DD"
                    value={podDateFilter}
                    onChange={(e) => setPodDateFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] custom-date-input"
                    max="9999-12-31"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => {
                      const dateInput = document.getElementById('dateInput') as HTMLInputElement;
                      if (dateInput) {
                        dateInput.showPicker();
                      }
                    }}
                  >
                    <IoCalendar size={20} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  Signature Exists
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Signature"
                    value={podDateSignatureFilter}
                    onChange={(e) => setPodDateSignatureFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="finalStatusFilter" className="text-sm font-semibold text-gray-800">
                  Reviewed By
                </label>
                <div className="relative">
                  <select
                    id="finalStatusFilter"
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none cursor-pointer"
                    value={reviewByStatusFilter}
                    onChange={(e) => setReviewByStatusFilter(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Admin">Admin</option>
                    <option value="OCR Engine">OCR Engine</option>
                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500 cursor-default"
                  >
                    <FaChevronDown size={16} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="finalStatusFilter" className="text-sm font-semibold text-gray-800">
                  Breakdown Reason
                </label>
                <div className="relative">
                  <select
                    id="finalStatusFilter"
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none cursor-pointer"
                    value={reasonStatusFilter}
                    onChange={(e) => setReasonStatusFilter(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="none">none</option>
                    <option value="damaged">damaged</option>
                    <option value="shortage">shortage</option>
                    <option value="overage">overage</option>
                    <option value="refused">refused</option>

                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500 cursor-default"
                  >
                    <FaChevronDown size={16} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  Job Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Job name"
                    value={jobNameFilter}
                    onChange={(e) => setJobNameFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                  </button>
                </div>
              </div>

              {/* <div className="flex flex-col">
                <label htmlFor="sortColumn" className="text-sm font-semibold text-gray-800">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    id="sortColumn"
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none cursor-pointer"
                    value={sortColumn ?? ""}
                    onChange={(e) => setSortColumn(e.target.value)}
                  >
                    <option value="">Select Column</option>
                    <option value="all">All</option>
                    <option value="blNumber">BL Number</option>
                    <option value="jobName">Job Name</option>
                    <option value="podDate">POD Date</option>
                    <option value="podSignature">Signature Exists </option>
                    <option value="totalQty">Issued Qty</option>
                    <option value="received">Received Qty</option>
                    <option value="damaged">Damaged Qty</option>
                    <option value="short">Short Qty</option>
                    <option value="over">Over Qty</option>
                    <option value="refused">Refused Qty</option>
                    <option value="customerOrderNum">Customer Order Num</option>
                    <option value="stampExists">Stamp Exists</option>
                    <option value="finalStatus">Final Status</option>
                    <option value="reviewStatus">Review Status</option>
                    <option value="recognitionStatus">Recognition Status</option>
                    <option value="breakdownReason">Breakdown Reason</option>
                    <option value="reviewedBy">Reviewed By</option>
                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500 cursor-default"
                  >
                    <FaChevronDown size={16} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="sortOrder" className="text-sm font-semibold text-gray-800">
                  Order
                </label>
                <div className="relative">
                  <select
                    id="sortOrder"
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none cursor-pointer"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500 cursor-default"
                  >
                    <FaChevronDown size={16} className="text-[#005B97]" />
                  </button>
                </div>
              </div> */}

              <div className="flex justify-end items-center gap-2 col-span-3">
                <button
                  className={`text-[#005B97] underline ${!isAnyFilterApplied() ? "text-gray-400 underline cursor-not-allowed" : "cursor-pointer"
                    }`}
                  onClick={resetFiltersAndFetch}
                  disabled={!isAnyFilterApplied()}
                >
                  Reset Filters
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#005B97] text-white hover:bg-[#2270a3]"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </div>

          <div className="my-5 flex justify-between items-start">
            <div>

              <form
                onSubmit={handleFilterApply}
                className="w-full grid grid-cols-3 gap-4"
              >

                <div className="flex items-center gap-3">
                  <label htmlFor="sortColumn" className="text-sm font-semibold text-gray-800">
                    Sort By:
                  </label>
                  <div className="relative">
                    <select
                      id="sortColumn"
                      className="w-44 px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none cursor-pointer"
                      value={sortColumn ?? ""}
                      // onChange={(e) => setSortColumn(e.target.value)}
                      onChange={handleSortColumnChange}

                    >
                      <option value="">Select Column</option>
                      <option value="all">All</option>
                      <option value="blNumber">BL Number</option>
                      <option value="jobName">Job Name</option>
                      <option value="podDate">POD Date</option>
                      <option value="podSignature">Signature Exists </option>
                      <option value="totalQty">Issued Qty</option>
                      <option value="received">Received Qty</option>
                      <option value="damaged">Damaged Qty</option>
                      <option value="short">Short Qty</option>
                      <option value="over">Over Qty</option>
                      <option value="refused">Refused Qty</option>
                      <option value="customerOrderNum">Customer Order Num</option>
                      <option value="stampExists">Stamp Exists</option>
                      <option value="finalStatus">Final Status</option>
                      <option value="reviewStatus">Review Status</option>
                      <option value="recognitionStatus">Recognition Status</option>
                      <option value="breakdownReason">Breakdown Reason</option>
                      <option value="reviewedBy">Reviewed By</option>
                    </select>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500 cursor-default"
                    >
                      <FaChevronDown size={16} className="text-[#005B97]" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor="sortOrder" className="text-sm font-semibold text-gray-800">
                    Sorting Order:
                  </label>
                  <div className="relative">
                    <select
                      id="sortOrder"
                      className="w-40 px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none cursor-pointer"
                      value={sortOrder}
                      // onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                      onChange={handleSortOrderChange}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500 cursor-default"
                    >
                      <FaChevronDown size={16} className="text-[#005B97]" />
                    </button>
                  </div>
                </div>

              </form>
            </div>

            <div className="flex gap-3">
              <div>

                <Link
                  href={{
                    pathname: '/history',
                    query: selectedRows.length > 0
                      ? { selectedRows: JSON.stringify(selectedRows) }
                      : undefined,
                  }}
                >
                  <button className="hover:bg-[#005B97] hover:text-white border-[#005B97] border text-[#005B97] rounded-lg px-14 py-2 md:mt-0 w-60 md:w-auto">
                    History
                  </button>
                </Link>
              </div>
              {/* <div>
                <p
                  onClick={handleOcrToggle}
                  className={`cursor-pointer w-fit px-4 py-2 rounded-lg  text-white transition ${isOcrRunning ? "bg-red-600 hover:bg-red-700 border-red border" : "bg-[#005B97] hover:bg-[#2270a3] border-[#005B97] border"
                    }`}
                >
                  {isOcrRunning ? "Stop" : "OCR Processing"}
                </p>
              </div> */}

              <div>
                <p
                  onClick={selectedRows.length > 0 && !isOcrRunning ? handleOcrToggle : undefined}
                  className={`cursor-pointer w-fit px-4 py-2 rounded-lg text-white transition 
                  ${selectedRows.length === 0 || isOcrRunning ? "bg-gray-400 cursor-not-allowed border-gray-400 border" : "bg-[#005B97] hover:bg-[#2270a3] border-[#005B97] border"}
                `}>
                  {isOcrRunning ? "Processing..." : "OCR Processing"}
                </p>
              </div>

            </div>
          </div>
          {isOcrRunning && (
            <div className="flex items-center justify-between gap-5">
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-[#005B97] h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <div>
                <p className="text-2xl text-[#005B97] font-semibold">
                  {progress}/<span className="text-black">100</span>
                </p>
              </div>
            </div>
          )}


          <div className="py-3 mx-auto">

            {/* {loadingTable ? (
              <div className="flex justify-center items-end">
                <Spinner />
              </div>
            ) : master.length === 0 ? (
              <div className="flex flex-col items-center mt-20">
                <span className=" text-gray-800 text-xl shadow-xl p-4 rounded-lg">No data found</span>
              </div>
            ) : (
              <div className={`overflow-x-auto w-full relative  ${isFilterDropDownOpen ? "2xl:min-h-[770px] 2xl:min-h-auto md:h-[170px] h-[200px] sm:h-[150px]" : " h-[600px] sm:h-[450px] 2xl:min-h-[1050px] 2xl:max-h-auto md:h-[460px]"
                }`}>
                <table className="table-auto min-w-full w-full border-collapse">
                  <thead className="sticky top-0 bg-white z-20 shadow-md">
                    <tr className="text-gray-800">
                      <th className="py-2 px-4 border-b text-start min-w-44 sticky left-0 bg-white z-10" onClick={() => toggleSort("blNumber")}><span className="mr-3" >
                        <input type="checkbox" checked={isAllSelected}
                          onChange={handleSelectAll} /></span>
                        BL Number
                        {sortColumn === "blNumber" && (
                          <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                        )}
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Job Name</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">POD Date</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Stamp Exists</th>
                      <th className="py-2 px-4 border-b text-center min-w-40">Signature Exists</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Issued Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Received Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Damaged Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-28">Short Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-28">Over Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Refused Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-52">Customer Order Num</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Final Status</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Review Status</th>
                      <th className="py-2 px-4 border-b text-center min-w-48">Recognition Status</th>
                      <th className="py-2 px-4 border-b text-center min-w-48">Breakdown Reason</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Reviewed By</th>
                      <th className="py-2 px-4 border-b text-center min-w-28">Action</th>
                    </tr>
                  </thead>
                  
                  <tbody className="h-[200px] sm:h-[150px] md:h-[170px] 2xl:min-h-[770px] 2xl:min-h-auto">
                    {master.map((job) => (
                      <tr key={job._id} className="text-gray-500">
                        <td className="py-2 px-4 border-b text-start m-0 sticky left-0 bg-white z-10" ><span className="mr-3"><input type="checkbox" checked={selectedRows.includes(job._id)}
                          onChange={() => handleRowSelection(job._id)} /></span>
                          <Link
                            href={`/extracted-data-monitoring/${job._id}`} onClick={() => { handleRouteChange(); localStorage.setItem("prev", "") }}
                            className="group"
                          >
                            <span className="text-[#005B97] underline group-hover:text-blue-500 transition-all duration-500 transform group-hover:scale-110">
                              {job.blNumber}
                            </span>
                          </Link>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.jobName}
                        </td>
                        <td className="py-2 px-4 border-b text-center">{job.podDate}</td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.stampExists === null || job.stampExists === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.stampExists}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.podSignature === "" || job.podSignature === null || job.podSignature === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.podSignature}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.totalQty === null || job.totalQty === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : (
                            job.totalQty
                          )}

                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.received === null || job.received === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.received}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.damaged === null || job.damaged === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.damaged}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.short === null || job.short === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.short}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.over === null || job.over === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.over}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.refused === null || job.refused === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.refused}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {Array.isArray(job.customerOrderNum)
                            ? job.customerOrderNum.join(", ")
                            : job.customerOrderNum || ""}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <Tippy
                            onMount={(instance) => {
                              parentRefFinal.current = instance;
                            }}
                            onHide={() => {
                              parentRefFinal.current = null;
                              setDropdownStates(null);
                            }}
                            content={
                              <ul className="bg-white border text-center rounded-md shadow-lg w-32">
                                {finalOptions.map(({ status, color, bgColor }) => (
                                  <li
                                    key={status}
                                    className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.finalStatus === status ? `${color} ${bgColor}` : color
                                      }`}
                                    onClick={() => {
                                      updateStatus(job._id, "finalStatus", status, name);
                                      parentRefFinal.current?.hide();
                                    }}
                                  >
                                    {status}
                                  </li>
                                ))}
                              </ul>
                            }
                            interactive={true}
                            trigger="click"
                            placement="bottom"
                            arrow={false}
                            zIndex={50}
                            onShow={() => {
                              if (userRole !== "standarduser") {
                                setDropdownStates(job._id);
                              } else {
                                return false;
                              }
                            }}
                            appendTo={() => document.body}>
                            <div
                              className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${userRole !== "standarduser" ? 'cursor-pointer' : ''} ${job.finalStatus === "new"
                                ? "bg-blue-100 text-blue-600"
                                : job.finalStatus === "inProgress"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : job.finalStatus === "valid"
                                    ? "bg-green-100 text-green-600"
                                    : job.finalStatus === "partiallyValid"
                                      ? "bg-[#faf1be] text-[#AF9918]"
                                      : job.finalStatus === "failure"
                                        ? "bg-red-100 text-red-600"
                                        : job.finalStatus === "sent"
                                          ? "bg-green-100 text-green-600"
                                          : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              <div>{job.finalStatus}</div>
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStates === job._id ? "rotate-180" : ""}`}
                              />
                            </div>
                          </Tippy>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <Tippy
                            onMount={(instance) => {
                              parentRefReview.current = instance;
                            }}
                            onHide={() => {
                              parentRefReview.current = null;
                              setDropdownStatesFirst(null);
                            }}
                            content={
                              <ul className="bg-white border text-center rounded-md shadow-lg w-32">
                                {reviewOptions.map(({ status, color, bgColor }) => (
                                  <li
                                    key={status}
                                    className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.reviewStatus === status ? `${color} ${bgColor}` : color
                                      }`}
                                    onClick={() => {
                                      updateStatus(job._id, "reviewStatus", status, name);
                                      parentRefReview.current?.hide();
                                    }}
                                  >
                                    {status}
                                  </li>
                                ))}
                              </ul>
                            }
                            interactive={true}
                            trigger="click"
                            placement="bottom"
                            arrow={false}
                            zIndex={50}
                            onShow={() => {
                              if (userRole !== "standarduser") {
                                setDropdownStatesFirst(job._id);
                              } else {
                                return false;
                              }
                            }}
                            appendTo={() => document.body}>

                            <div
                              className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${userRole !== "standarduser" ? 'cursor-pointer' : ''} ${job.reviewStatus === "unConfirmed"
                                ? "bg-yellow-100 text-yellow-600"
                                : job.reviewStatus === "confirmed"
                                  ? "bg-green-100 text-green-600"
                                  : job.reviewStatus === "denied"
                                    ? "bg-[#faf1be] text-[#AF9918]"
                                    : job.reviewStatus === "deleted"
                                      ? "bg-red-100 text-red-600"
                                      : ""
                                }`}>
                              <div>{job.reviewStatus}</div>
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesFirst === job._id ? "rotate-180" : ""}`}
                              />
                            </div>
                          </Tippy>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <Tippy
                            onMount={(instance) => {
                              parentRefRecognition.current = instance;
                            }}
                            onHide={() => {
                              parentRefRecognition.current = null;
                              setDropdownStatesSecond(null);
                            }}
                            content={
                              <ul className="bg-white border text-center rounded-md shadow-lg w-32">
                                {recognitionOptions.map(({ status, color, bgColor }) => (
                                  <li
                                    key={status}
                                    className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.recognitionStatus === status ? `${color} ${bgColor}` : color
                                      }`}
                                    onClick={() => {
                                      updateStatus(job._id, "recognitionStatus", status, name);
                                      parentRefRecognition.current?.hide();
                                    }}
                                  >
                                    {status}
                                  </li>
                                ))}
                              </ul>
                            }
                            interactive={true}
                            trigger="click"
                            placement="bottom"
                            arrow={false}
                            zIndex={50}
                            onShow={() => {
                              if (userRole !== "standarduser") {
                                setDropdownStatesSecond(job._id);
                              } else {
                                return false;
                              }
                            }}
                            appendTo={() => document.body}>

                            <div
                              className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${userRole !== "standarduser" ? 'cursor-pointer' : ''} ${job.recognitionStatus === "new"
                                ? "bg-blue-100 text-blue-600"
                                : job.recognitionStatus === "inProgress"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : job.recognitionStatus === "valid"
                                    ? "bg-green-100 text-green-600"
                                    : job.recognitionStatus === "partiallyValid"
                                      ? "bg-[#faf1be] text-[#AF9918]"
                                      : job.recognitionStatus === "failure"
                                        ? "bg-red-100 text-red-600"
                                        : job.recognitionStatus === "sent"
                                          ? "bg-green-100 text-green-600"
                                          : ""
                                }`}>
                              <div>{job.recognitionStatus}</div>
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesSecond === job._id ? "rotate-180" : ""}`}
                              />
                            </div>
                          </Tippy>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <Tippy
                            onMount={(instance) => {
                              parentRefBreakdown.current = instance;
                            }}
                            onHide={() => {
                              parentRefBreakdown.current = null;
                              setDropdownStatesThird(null);
                            }}
                            content={
                              <ul className="bg-white border text-center rounded-md shadow-lg w-32">
                                {breakdownOptions.map(({ status, color, bgColor }) => (
                                  <li
                                    key={status}
                                    className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.breakdownReason === status ? `${color} ${bgColor}` : color
                                      }`}
                                    onClick={() => {
                                      updateStatus(job._id, "breakdownReason", status, name);
                                      parentRefBreakdown.current?.hide();
                                    }}
                                  >
                                    {status}
                                  </li>
                                ))}
                              </ul>
                            }
                            interactive={true}
                            trigger="click"
                            placement="bottom"
                            arrow={false}
                            zIndex={50}
                            onShow={() => {
                              if (userRole !== "standarduser") {
                                setDropdownStatesThird(job._id);
                              } else {
                                return false;
                              }
                            }}
                            appendTo={() => document.body}>

                            <div
                              className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${userRole !== "standarduser" ? 'cursor-pointer' : ''} ${job.breakdownReason === "none"
                                ? "bg-blue-100 text-blue-600"
                                : job.breakdownReason === "damaged"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : job.breakdownReason === "shortage"
                                    ? "bg-green-100 text-green-600"
                                    : job.breakdownReason === "overage"
                                      ? "bg-[#faf1be] text-[#AF9918]"
                                      : job.breakdownReason === "refused"
                                        ? "bg-red-100 text-red-600"
                                        : ""
                                }`}
                            >
                              <div>{job.breakdownReason}</div>
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesThird === job._id ? "rotate-180" : ""}`}
                              />
                            </div>
                          </Tippy>
                        </td>
                        <td className="py-2 px-4 border-b text-center">{job.reviewedBy}</td>
                        <td className="py-2 px-6 border-b text-center">
                          <Link
                            href={`/extracted-data-monitoring/edit-pdf/${job._id}`} onClick={() => { handleRouteChange(); localStorage.setItem("prev", "") }}
                            className="underline text-[#005B97] flex items-center gap-1 transition-all duration-300 hover:text-blue-500 group"
                          >
                            Detail
                            <span
                              className="transform transition-transform duration-300 ease-in-out group-hover:translate-x-1"
                            >
                              <IoIosArrowForward className="text-xl p-0" />
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            )
            } */}


            {master.length === 0 && !loadingTable ? (
              <div className="flex flex-col items-center mt-20">
                <span className="text-gray-800 text-xl shadow-xl p-4 rounded-lg">No data found</span>
              </div>
            ) : (
              <div className={`overflow-x-auto w-full relative ${isFilterDropDownOpen ? "2xl:min-h-[770px] 2xl:min-h-auto md:h-[170px] h-[200px] sm:h-[150px]" : " h-[600px] sm:h-[450px] 2xl:min-h-[1050px] 2xl:max-h-auto md:h-[460px]"}`}>
                <table className="table-auto min-w-full w-full border-collapse">
                  <thead className="sticky top-0 bg-white z-20 shadow-md">
                    <tr className="text-gray-800">
                      <th className="py-2 px-4 border-b text-start min-w-44 sticky left-0 bg-white z-10">
                        <span className="mr-3">
                          <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                        </span>
                        BL Number
                      </th>
                      {/* <th className="py-2 px-4 border-b text-start min-w-44 sticky left-0 bg-white  z-10 cursor-pointer" onClick={() => toggleSort("blNumber")}>
                        <span className="mr-3">
                          <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                        </span>
                        BL Number
                        {sortColumn === "blNumber" && (
                          <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                        )}
                      </th> */}
                      {/* <th
                        className="py-2 px-4 border-b text-start min-w-44 sticky left-0 bg-white z-10 cursor-pointer"
                        onClick={() => toggleSort("blNumber")}
                      >
                        <span className="mr-3">
                          <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                        </span>
                        BL Number
                        {sortColumn === "blNumber" && (
                          <motion.div
                            className="inline-block ml-1"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: sortOrder === "asc" ? 0 : 360 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <span className="block w-4 text-center">{sortOrder === "asc" ? "▲" : "▼"}</span>
                          </motion.div>
                        )}

                      </th> */}
                      <th className="py-2 px-4 border-b text-center min-w-36">Uploaded File</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Job Name</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">POD Date</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Stamp Exists</th>
                      <th className="py-2 px-4 border-b text-center min-w-40">Signature Exists</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Issued Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Received Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Damaged Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-28">Short Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-28">Over Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Refused Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-52">Customer Order Num</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Final Status</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Review Status</th>
                      <th className="py-2 px-4 border-b text-center min-w-48">Recognition Status</th>
                      <th className="py-2 px-4 border-b text-center min-w-48">Breakdown Reason</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Reviewed By</th>
                      <th className="py-2 px-4 border-b text-center min-w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody className="relative">
                    {loadingTable ? (
                      <tr>
                        <td colSpan={Object.keys(master[0] || {}).length} className="text-center">
                          <div className="flex justify-center">
                            <TableSpinner />
                          </div>
                        </td>
                      </tr>
                    ) : master.length === 0 ? (
                      <tr>
                        <td colSpan={9999} className="py-10 text-center text-gray-800 text-xl shadow-xl p-4 rounded-lg">
                          No data found
                        </td>
                      </tr>
                    ) : (
                      master.map((job) => (
                        <tr key={job._id} className="text-gray-500">
                          <td className="py-2 px-4 border-b text-start m-0 sticky left-0 bg-white z-10" ><span className="mr-3"><input type="checkbox" checked={selectedRows.includes(job._id)}
                            onChange={() => handleRowSelection(job._id)} /></span>
                            <Link
                              href={`/extracted-data-monitoring/${job._id}`} onClick={() => { handleRouteChange(); localStorage.setItem("prev", "") }}
                              className="group"
                            >
                              <span className="text-[#005B97] underline group-hover:text-blue-500 transition-all duration-500 transform group-hover:scale-110">
                                {job.blNumber}
                              </span>

                            </Link>
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.pdfUrl ? job.pdfUrl.split('/').pop()?.replace('.pdf', '') || "No PDF Available" : "No PDF Available"}
                          </td>

                          <td className="py-2 px-4 border-b text-center">
                            {job.jobName}
                          </td>
                          <td className="py-2 px-4 border-b text-center">{job.podDate}</td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.stampExists === null || job.stampExists === undefined ? (
                              <span className="flex justify-center items-center">
                                <IoIosInformationCircle className="text-2xl text-red-500" />
                              </span>
                            ) : job.stampExists}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.podSignature === null || job.podSignature === undefined ? (
                              <span className="flex justify-center items-center">
                                <IoIosInformationCircle className="text-2xl text-red-500" />
                              </span>
                            ) : job.podSignature}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.totalQty === null || job.totalQty === undefined ? (
                              <span className="flex justify-center items-center">
                                <IoIosInformationCircle className="text-2xl text-red-500" />
                              </span>
                            ) : (
                              job.totalQty
                            )}

                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.received === null || job.received === undefined ? (
                              <span className="flex justify-center items-center">
                                <IoIosInformationCircle className="text-2xl text-red-500" />
                              </span>
                            ) : job.received}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.damaged === null || job.damaged === undefined ? (
                              <span className="flex justify-center items-center">
                                <IoIosInformationCircle className="text-2xl text-red-500" />
                              </span>
                            ) : job.damaged}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.short === null || job.short === undefined ? (
                              <span className="flex justify-center items-center">
                                <IoIosInformationCircle className="text-2xl text-red-500" />
                              </span>
                            ) : job.short}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.over === null || job.over === undefined ? (
                              <span className="flex justify-center items-center">
                                <IoIosInformationCircle className="text-2xl text-red-500" />
                              </span>
                            ) : job.over}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.refused === null || job.refused === undefined ? (
                              <span className="flex justify-center items-center">
                                <IoIosInformationCircle className="text-2xl text-red-500" />
                              </span>
                            ) : job.refused}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {Array.isArray(job.customerOrderNum)
                              ? job.customerOrderNum.join(", ")
                              : job.customerOrderNum || ""}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <Tippy
                              onMount={(instance) => {
                                parentRefFinal.current = instance;
                              }}
                              onHide={() => {
                                parentRefFinal.current = null;
                                setDropdownStates(null);
                              }}
                              content={
                                <ul className="bg-white border text-center rounded-md shadow-lg w-32">
                                  {finalOptions.map(({ status, color, bgColor }) => (
                                    <li
                                      key={status}
                                      className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.finalStatus === status ? `${color} ${bgColor}` : color
                                        }`}
                                      onClick={() => {
                                        updateStatus(job._id, "finalStatus", status, name);
                                        parentRefFinal.current?.hide();
                                      }}
                                    >
                                      {status}
                                    </li>
                                  ))}
                                </ul>
                              }
                              interactive={true}
                              trigger="click"
                              placement="bottom"
                              arrow={false}
                              zIndex={50}
                              onShow={() => {
                                if (userRole !== "standarduser") {
                                  setDropdownStates(job._id);
                                } else {
                                  return false;
                                }
                              }}
                              appendTo={() => document.body}>
                              <div
                                className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${userRole !== "standarduser" ? 'cursor-pointer' : ''} ${job.finalStatus === "new"
                                  ? "bg-blue-100 text-blue-600"
                                  : job.finalStatus === "inProgress"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : job.finalStatus === "valid"
                                      ? "bg-green-100 text-green-600"
                                      : job.finalStatus === "partiallyValid"
                                        ? "bg-[#faf1be] text-[#AF9918]"
                                        : job.finalStatus === "failure"
                                          ? "bg-red-100 text-red-600"
                                          : job.finalStatus === "sent"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-gray-100 text-gray-600"
                                  }`}
                              >
                                <div>{job.finalStatus}</div>
                                <RiArrowDropDownLine
                                  className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStates === job._id ? "rotate-180" : ""}`}
                                />
                              </div>
                            </Tippy>
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <Tippy
                              onMount={(instance) => {
                                parentRefReview.current = instance;
                              }}
                              onHide={() => {
                                parentRefReview.current = null;
                                setDropdownStatesFirst(null);
                              }}
                              content={
                                <ul className="bg-white border text-center rounded-md shadow-lg w-32">
                                  {reviewOptions.map(({ status, color, bgColor }) => (
                                    <li
                                      key={status}
                                      className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.reviewStatus === status ? `${color} ${bgColor}` : color
                                        }`}
                                      onClick={() => {
                                        updateStatus(job._id, "reviewStatus", status, name);
                                        parentRefReview.current?.hide();
                                      }}
                                    >
                                      {status}
                                    </li>
                                  ))}
                                </ul>
                              }
                              interactive={true}
                              trigger="click"
                              placement="bottom"
                              arrow={false}
                              zIndex={50}
                              onShow={() => {
                                if (userRole !== "standarduser") {
                                  setDropdownStatesFirst(job._id);
                                } else {
                                  return false;
                                }
                              }}
                              appendTo={() => document.body}>

                              <div
                                className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${userRole !== "standarduser" ? 'cursor-pointer' : ''} ${job.reviewStatus === "unConfirmed"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : job.reviewStatus === "confirmed"
                                    ? "bg-green-100 text-green-600"
                                    : job.reviewStatus === "denied"
                                      ? "bg-[#faf1be] text-[#AF9918]"
                                      : job.reviewStatus === "deleted"
                                        ? "bg-red-100 text-red-600"
                                        : ""
                                  }`}>
                                <div>{job.reviewStatus}</div>
                                <RiArrowDropDownLine
                                  className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesFirst === job._id ? "rotate-180" : ""}`}
                                />
                              </div>
                            </Tippy>
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <Tippy
                              onMount={(instance) => {
                                parentRefRecognition.current = instance;
                              }}
                              onHide={() => {
                                parentRefRecognition.current = null;
                                setDropdownStatesSecond(null);
                              }}
                              content={
                                <ul className="bg-white border text-center rounded-md shadow-lg w-32">
                                  {recognitionOptions.map(({ status, color, bgColor }) => (
                                    <li
                                      key={status}
                                      className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.recognitionStatus === status ? `${color} ${bgColor}` : color
                                        }`}
                                      onClick={() => {
                                        updateStatus(job._id, "recognitionStatus", status, name);
                                        parentRefRecognition.current?.hide();
                                      }}
                                    >
                                      {status}
                                    </li>
                                  ))}
                                </ul>
                              }
                              interactive={true}
                              trigger="click"
                              placement="bottom"
                              arrow={false}
                              zIndex={50}
                              onShow={() => {
                                if (userRole !== "standarduser") {
                                  setDropdownStatesSecond(job._id);
                                } else {
                                  return false;
                                }
                              }}
                              appendTo={() => document.body}>

                              <div
                                className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${userRole !== "standarduser" ? 'cursor-pointer' : ''} ${job.recognitionStatus === "new"
                                  ? "bg-blue-100 text-blue-600"
                                  : job.recognitionStatus === "inProgress"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : job.recognitionStatus === "valid"
                                      ? "bg-green-100 text-green-600"
                                      : job.recognitionStatus === "partiallyValid"
                                        ? "bg-[#faf1be] text-[#AF9918]"
                                        : job.recognitionStatus === "failure"
                                          ? "bg-red-100 text-red-600"
                                          : job.recognitionStatus === "sent"
                                            ? "bg-green-100 text-green-600"
                                            : ""
                                  }`}>
                                <div>{job.recognitionStatus}</div>
                                <RiArrowDropDownLine
                                  className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesSecond === job._id ? "rotate-180" : ""}`}
                                />
                              </div>
                            </Tippy>
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <Tippy
                              onMount={(instance) => {
                                parentRefBreakdown.current = instance;
                              }}
                              onHide={() => {
                                parentRefBreakdown.current = null;
                                setDropdownStatesThird(null);
                              }}
                              content={
                                <ul className="bg-white border text-center rounded-md shadow-lg w-32">
                                  {breakdownOptions.map(({ status, color, bgColor }) => (
                                    <li
                                      key={status}
                                      className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.breakdownReason === status ? `${color} ${bgColor}` : color
                                        }`}
                                      onClick={() => {
                                        updateStatus(job._id, "breakdownReason", status, name);
                                        parentRefBreakdown.current?.hide();
                                      }}
                                    >
                                      {status}
                                    </li>
                                  ))}
                                </ul>
                              }
                              interactive={true}
                              trigger="click"
                              placement="bottom"
                              arrow={false}
                              zIndex={50}
                              onShow={() => {
                                if (userRole !== "standarduser") {
                                  setDropdownStatesThird(job._id);
                                } else {
                                  return false;
                                }
                              }}
                              appendTo={() => document.body}>

                              <div
                                className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${userRole !== "standarduser" ? 'cursor-pointer' : ''} ${job.breakdownReason === "none"
                                  ? "bg-blue-100 text-blue-600"
                                  : job.breakdownReason === "damaged"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : job.breakdownReason === "shortage"
                                      ? "bg-green-100 text-green-600"
                                      : job.breakdownReason === "overage"
                                        ? "bg-[#faf1be] text-[#AF9918]"
                                        : job.breakdownReason === "refused"
                                          ? "bg-red-100 text-red-600"
                                          : ""
                                  }`}
                              >
                                <div>{job.breakdownReason}</div>
                                <RiArrowDropDownLine
                                  className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesThird === job._id ? "rotate-180" : ""}`}
                                />
                              </div>
                            </Tippy>
                          </td>
                          <td className="py-2 px-4 border-b text-center">{job.reviewedBy}</td>
                          <td className="py-2 px-6 border-b text-center">
                            <Link
                              href={`/extracted-data-monitoring/edit-pdf/${job._id}`} onClick={() => { handleRouteChange(); localStorage.setItem("prev", "") }}
                              className="underline text-[#005B97] flex items-center gap-1 transition-all duration-300 hover:text-blue-500 group"
                            >
                              Detail
                              <span
                                className="transform transition-transform duration-300 ease-in-out group-hover:translate-x-1"
                              >
                                <IoIosArrowForward className="text-xl p-0" />
                              </span>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}


            {
              master.length !== 0 && (
                <div className="mt-5 flex justify-end gap-5 items-center text-gray-800">
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
              )
            }

          </div >
        </div >
      </div >
    </div >
  );
};

export default MasterPage;
