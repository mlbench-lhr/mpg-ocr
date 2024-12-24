"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

type FinalStatus = "new" | "inProgress" | "valid" | "partiallyValid" | "failure" | "sent";
type ReviewStatus = "unConfirmed" | "confirmed" | "denied" | "deleted";
type RecognitionStatus = "new" | "inProgress" | "valid" | "partiallyValid" | "failure" | "sent";
type BreakdownReason = "none" | "damaged" | "shortage" | "overage" | "refused";

interface Job {
  _id: string;
  blNumber: string;
  jobName: string;
  carrier: string;
  podDate: string;
  deliveryDate: string;
  podSignature: string;
  totalQty: number;
  delivered: number;
  damaged: number;
  short: number;
  over: number;
  refused: number;
  sealIntact: string;
  noOfPages: number;
  finalStatus: FinalStatus;
  reviewStatus: ReviewStatus;
  recognitionStatus: RecognitionStatus;
  breakdownReason: BreakdownReason;
  reviewedBy: string;
  cargoDescription: string;
  receiverSignature: string;
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>();

  const parentRefFinal = useRef<Instance | null>(null);
  const parentRefReview = useRef<Instance | null>(null);
  const parentRefRecognition = useRef<Instance | null>(null);
  const parentRefBreakdown = useRef<Instance | null>(null);
  const [firstTime, setFirstTime] = useState(false);
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
      }
      else {
        sessionStorage.setItem("finalStatusFilter", "");
        sessionStorage.setItem("reviewStatusFilter", "");
        sessionStorage.setItem("reasonStatusFilter", "");
        sessionStorage.setItem("reviewByStatusFilter", "");
        sessionStorage.setItem("podDateFilter", "");
        sessionStorage.setItem("podDateSignatureFilter", "");
        sessionStorage.setItem("jobNameFilter", "");
        sessionStorage.setItem("bolNumberFilter", "");
        setFinalStatusFilter("");
        setReviewStatusFilter("");
        setReasonStatusFilter("");
        setReviewByStatusFilter("");
        setPodDateFilter("");
        setPodDateSignatureFilter("");
        setJobNameFilter("");
        setBolNumberFilter("");
        setFirstTime(false);
      }
    }
  }, []);


  // useEffect(() => {
  //   const savedState = sessionStorage.getItem("sidebar");
  //   if (savedState) setIsSidebarExpanded(JSON.parse(savedState));
  // }, []);

  const handleSidebarStateChange = (newState: boolean) => {
    setIsSidebarExpanded(newState);
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

  useEffect(() => {
    if (firstTime) {
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, firstTime])

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
    sessionStorage.setItem("bolNumberFilter", "");
    setFinalStatusFilter("");
    setReviewStatusFilter("");
    setReasonStatusFilter("");
    setReviewByStatusFilter("");
    setPodDateFilter("");
    setPodDateSignatureFilter("");
    setJobNameFilter("");
    setBolNumberFilter("");
    setMaster([]);
    await fetchJobs();
  };


  const handleRouteChange = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("finalStatusFilter", finalStatusFilter);
      sessionStorage.setItem("reviewStatusFilter", reviewStatusFilter);
      sessionStorage.setItem("reasonStatusFilter", reasonStatusFilter);
      sessionStorage.setItem("reviewByStatusFilter", reviewByStatusFilter);
      sessionStorage.setItem("podDateFilter", podDateFilter);
      sessionStorage.setItem("podDateSignatureFilter", podDateSignatureFilter);
      sessionStorage.setItem("jobNameFilter", jobNameFilter);
      sessionStorage.setItem("bolNumberFilter", bolNumberFilter);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  }

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
      {/* <Sidebar onToggleExpand={handleSidebarToggle} /> */}
      <Sidebar onStateChange={handleSidebarStateChange} />
      <div
        className={`flex-1 flex flex-col transition-all bg-white duration-300 ${!isSidebarExpanded ? "ml-24" : "ml-64"
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
            <Link href="/history">
              <button className="bg-[#005B97] rounded-lg py-2 px-10 text-white md:mt-0 w-60 md:w-auto">
                History
              </button>
            </Link>

          }
        />


        <div className="flex-1 px-2 bg-white">
          <div
            className={`bg-gray-200 p-3 mb-0 transition-all duration-500 ease-in-out w-full sm:w-auto ${isFilterDropDownOpen ? "rounded-t-lg" : "rounded-lg"}`}
          >
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsFilterDropDownOpen(!isFilterDropDownOpen)}>
              <span className="text-gray-800 text-sm sm:text-base md:text-lg">
                Filters
              </span>
              <span>
                <IoIosArrowForward
                  className={`text-xl p-0 text-[#005B97] transition-all duration-500 ease-in-out ${isFilterDropDownOpen ? 'rotate-90' : ''}`}
                />
              </span>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out w-auto ${isFilterDropDownOpen ? "max-h-[1000px] p-3" : "max-h-0"
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
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
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
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
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
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
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
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
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
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
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
                  POD Signature
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
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
                    value={reviewByStatusFilter}
                    onChange={(e) => setReviewByStatusFilter(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Admin">Admin</option>
                    <option value="OCR Engine">OCR Engine</option>
                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
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
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
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
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
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

              <div className="flex justify-end items-center gap-4 col-span-3">
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

          <div className="mb-5">

          </div>

          <div className="py-3 mx-auto ">

            {loadingTable ? (
              <div className="flex justify-center items-end">
                <Spinner />
              </div>
            ) : master.length === 0 ? (
              <div className="flex flex-col items-center mt-20">
                <span className=" text-gray-800 text-xl shadow-xl p-4 rounded-lg">No data found</span>
              </div>
            ) : (
              <div className="overflow-x-auto w-full relative">
                <table className="table-auto min-w-full w-full border-collapse">
                  <thead>
                    <tr className="text-gray-800">
                      <th className="py-2 px-4 border-b text-start min-w-44"><span className="mr-3"><input type="checkbox" checked={isAllSelected}
                        onChange={handleSelectAll} /></span>BL Number</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Job Name</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">POD Date</th>
                      <th className="py-2 px-4 border-b text-center min-w-40">POD Signature</th>
                      <th className="py-2 px-4 border-b text-center min-w-28">Total Qty</th>
                      <th className="py-2 px-4 border-b text-center min-w-24">Delivered</th>
                      <th className="py-2 px-4 border-b text-center min-w-24">Damaged</th>
                      <th className="py-2 px-4 border-b text-center min-w-20">Short</th>
                      <th className="py-2 px-4 border-b text-center min-w-20">Over</th>
                      <th className="py-2 px-4 border-b text-center min-w-24">Refused</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Seal Intact</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Final Status</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Review Status</th>
                      <th className="py-2 px-4 border-b text-center min-w-48">Recognition Status</th>
                      <th className="py-2 px-4 border-b text-center min-w-48">Breakdown Reason</th>
                      <th className="py-2 px-4 border-b text-center min-w-36">Reviewed By</th>
                      <th className="py-2 px-4 border-b text-center min-w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody >
                    {master.map((job) => (
                      <tr key={job._id} className="text-gray-500">
                        <td className="py-2 px-4 border-b text-start m-0" ><span className="mr-3"><input type="checkbox" checked={selectedRows.includes(job._id)}
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
                          {job.delivered === null || job.delivered === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.delivered}
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
                          {job.sealIntact === null || job.sealIntact === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.sealIntact}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {/* <div
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

                            onClick={() => toggleDropdown(job._id)}
                          >
                            <div>{job.finalStatus}</div>
                            <div className="relative">
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStates === job._id ? "rotate-180" : ""}`}
                              />
                              <ul
                                className={`absolute right-0 z-50 bg-white border rounded-md shadow-lg w-32 transition-all duration-300 ease-in-out ${dropdownStates === job._id
                                  ? "scale-100 opacity-100 pointer-events-auto"
                                  : "scale-0 opacity-0 pointer-events-none"
                                  }`}
                                style={{
                                  top: dropdownStates === job._id && !isLastThreeRow(job._id) ? "100%" : "",
                                  bottom: dropdownStates === job._id && isLastThreeRow(job._id) ? "100%" : "",
                                  visibility: dropdownStates === job._id ? "visible" : "hidden",
                                  height: dropdownStates === job._id ? "auto" : "0",
                                  overflow: dropdownStates === job._id ? "visible" : "hidden",
                                }}
                              >
                                {[{ status: "new", color: "text-blue-600", bgColor: "bg-blue-100" },
                                { status: "inProgress", color: "text-yellow-600", bgColor: "bg-yellow-100" },
                                { status: "valid", color: "text-green-600", bgColor: "bg-green-100" },
                                { status: "partiallyValid", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
                                { status: "failure", color: "text-red-600", bgColor: "bg-red-100" },
                                { status: "sent", color: "text-green-600", bgColor: "bg-green-100" },
                                ].map(({ status, color, bgColor }) => (
                                  <li
                                    key={status}
                                    className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.finalStatus === status ? `${color} ${bgColor}` : color
                                      }`}
                                    onClick={() => updateStatus(job._id, "finalStatus", status, name)}
                                  >
                                    {status}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div> */}
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
                          {/* <div
                            className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${userRole !== "standarduser" ? 'cursor-pointer' : ''} ${job.reviewStatus === "unConfirmed"
                              ? "bg-yellow-100 text-yellow-600"
                              : job.reviewStatus === "confirmed"
                                ? "bg-green-100 text-green-600"
                                : job.reviewStatus === "denied"
                                  ? "bg-[#faf1be] text-[#AF9918]"
                                  : job.reviewStatus === "deleted"
                                    ? "bg-red-100 text-red-600"
                                    : ""
                              }`}
                            onClick={() => toggleDropdownFirst(job._id)}
                          >
                            <div>{job.reviewStatus}</div>
                            <div className="relative">
                              <RiArrowDropDownLine
                                className={`text-2xl transform transition-transform duration-300 ease-in-out ${dropdownStatesFirst === job._id ? "rotate-180" : ""}`}
                              />
                              <ul
                                className={`absolute right-0 z-50 bg-white border rounded-md shadow-lg w-32 transition-all duration-300 ease-in-out ${dropdownStatesFirst === job._id
                                  ? "scale-100 opacity-100 pointer-events-auto"
                                  : "scale-0 opacity-0 pointer-events-none"
                                  }`}
                                style={{
                                  top: dropdownStatesFirst === job._id && !isLastThreeRow(job._id) ? "100%" : "",
                                  bottom: dropdownStatesFirst === job._id && isLastThreeRow(job._id) ? "100%" : "",
                                  visibility: dropdownStatesFirst === job._id ? "visible" : "hidden",
                                  height: dropdownStatesFirst === job._id ? "auto" : "0",
                                  overflow: dropdownStatesFirst === job._id ? "visible" : "hidden",
                                }}
                              >
                                {[
                                  { status: "unConfirmed", color: "text-yellow-600", bgColor: "bg-yellow-100" },
                                  { status: "confirmed", color: "text-green-600", bgColor: "bg-green-100" },
                                  { status: "deleted", color: "text-red-600", bgColor: "bg-red-100" },
                                  { status: "denied", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
                                ].map(({ status, color, bgColor }) => (
                                  <li
                                    key={status}
                                    className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.reviewStatus === status ? `${color} ${bgColor}` : color
                                      }`}
                                    onClick={() => updateStatus(job._id, "reviewStatus", status, name)}
                                  >
                                    {status}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div> */}
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
                          {/* <div
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
                              }`}
                            onClick={() => toggleDropdownSecond(job._id)}
                          >
                            <div>{job.recognitionStatus}</div>
                            <div className="relative">
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesSecond === job._id ? "rotate-180" : ""}`}
                              />
                              <ul
                                className={`absolute mt-2 right-0 z-50 bg-white border rounded-md shadow-lg w-32 transition-all duration-300 ease-in-out ${dropdownStatesSecond === job._id
                                  ? "scale-100 opacity-100 pointer-events-auto"
                                  : "scale-0 opacity-0 pointer-events-none"
                                  }`}
                                style={{
                                  top: dropdownStatesSecond === job._id && !isLastThreeRow(job._id) ? "100%" : "",
                                  bottom: dropdownStatesSecond === job._id && isLastThreeRow(job._id) ? "100%" : "",
                                  visibility: dropdownStatesSecond === job._id ? "visible" : "hidden",
                                  height: dropdownStatesSecond === job._id ? "auto" : "0",
                                  overflow: dropdownStatesSecond === job._id ? "visible" : "hidden",
                                }}
                              >
                                {[{ status: "new", color: "text-blue-600", bgColor: "bg-blue-100" },
                                { status: "inProgress", color: "text-yellow-600", bgColor: "bg-yellow-100" },
                                { status: "valid", color: "text-green-600", bgColor: "bg-green-100" },
                                { status: "partiallyValid", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
                                { status: "failure", color: "text-red-600", bgColor: "bg-red-100" },
                                { status: "sent", color: "text-green-600", bgColor: "bg-green-100" },
                                ].map(({ status, color, bgColor }) => (
                                  <li
                                    key={status}
                                    className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.recognitionStatus === status ? `${color} ${bgColor}` : color
                                      }`}
                                    onClick={() => updateStatus(job._id, "recognitionStatus", status, name)}
                                  >
                                    {status}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div> */}
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
                          {/* <div
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
                            onClick={() => toggleDropdownThird(job._id)}
                          >
                            <div>{job.breakdownReason}</div>
                            <div className="relative">
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesThird === job._id ? "rotate-180" : ""
                                  }`}
                              />
                              <ul
                                className={`absolute right-0 z-50 bg-white border rounded-md shadow-lg w-32 transition-opacity duration-300 ease-in-out ${dropdownStatesThird === job._id
                                  ? "opacity-100 pointer-events-auto"
                                  : "opacity-0 pointer-events-none visibility-hidden"
                                  }`}
                                style={{
                                  top: dropdownStatesThird === job._id && !isLastThreeRow(job._id) ? "100%" : "",
                                  bottom: dropdownStatesThird === job._id && isLastThreeRow(job._id) ? "100%" : "",
                                  visibility: dropdownStatesThird === job._id ? "visible" : "hidden",
                                  height: dropdownStatesThird === job._id ? "auto" : "0",
                                  overflow: dropdownStatesThird === job._id ? "visible" : "hidden",
                                }}
                              >
                                {[
                                  { status: "none", color: "text-blue-600", bgColor: "bg-blue-100" },
                                  { status: "damaged", color: "text-yellow-600", bgColor: "bg-yellow-100" },
                                  { status: "shortage", color: "text-green-600", bgColor: "bg-green-100" },
                                  { status: "overage", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
                                  { status: "refused", color: "text-red-600", bgColor: "bg-red-100" },
                                ].map(({ status, color, bgColor }) => (
                                  <li
                                    key={status}
                                    className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.breakdownReason === status ? `${color} ${bgColor}` : color
                                      }`}
                                    onClick={() => updateStatus(job._id, "breakdownReason", status, name)}
                                  >
                                    {status}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div> */}
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
            }

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
