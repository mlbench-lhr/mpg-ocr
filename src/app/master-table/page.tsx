"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosInformationCircle } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { GiShare } from "react-icons/gi";
import { FiSearch } from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";
import { IoCopyOutline, IoCalendar } from "react-icons/io5";




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
  sealIntact: number;
  finalStatus: string;
  reviewStatus: string;
  recognitionStatus: string;
  breakdownReason: string;
  reviewedBy: string;
  cargoDescription: string;
}

const MasterPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFilterDropDownOpen, setIsFilterDropDownOpen] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [master, setMaster] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);



  const [finalStatusFilter, setFinalStatusFilter] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("");
  const [reviewByStatusFilter, setReviewByStatusFilter] = useState("");
  const [podDateFilter, setPodDateFilter] = useState("");
  const [podDateSignatureFilter, setPodDateSignatureFilter] = useState("");
  const [carrierFilter, setCarrierFilter] = useState("");
  const [bolNumberFilter, setBolNumberFilter] = useState("");

  const [dropdownStates, setDropdownStates] = useState<string | null>(null);
  const [dropdownStatesFirst, setDropdownStatesFirst] = useState<string | null>(null);
  const [dropdownStatesSecond, setDropdownStatesSecond] = useState<string | null>(null);
  const [dropdownStatesThird, setDropdownStatesThird] = useState<string | null>(null);


  const router = useRouter();

  const handleSidebarToggle = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  };

  const toggleDropdown = (jobId: string) => {
    setDropdownStates((prev) => (prev === jobId ? null : jobId));
  };

  const toggleDropdownFirst = (jobId: string) => {
    setDropdownStatesFirst((prev) => (prev === jobId ? null : jobId));
  };

  const toggleDropdownSecond = (jobId: string) => {
    setDropdownStatesSecond((prev) => (prev === jobId ? null : jobId));
  };

  const toggleDropdownThird = (jobId: string) => {
    setDropdownStatesThird((prev) => (prev === jobId ? null : jobId));
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

  // const fetchJobs = useCallback(async () => {
  //   try {
  //     setLoadingTable(true);

  //     const queryParams = new URLSearchParams({
  //       page: currentPage.toString(),
  //       finalStatus: finalStatusFilter || "",
  //       reviewStatus: reviewStatusFilter || "",
  //       reviewByStatus: reviewByStatusFilter || "",
  //       podDate: podDateFilter || "",
  //       podDateSignature: podDateSignatureFilter || "",
  //       carrier: carrierFilter || "",
  //       bolNumber: bolNumberFilter ?? "",
  //     });

  //     console.log(bolNumberFilter);


  //     const response = await fetch(`/api/process-data/get-data/?${queryParams.toString()}`);

  //     // const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
  //     // const response = await fetch(`/api/process-data/get-data/?page=${currentPage}${searchParam}`);

  //     if (response.ok) {
  //       const data = await response.json();
  //       setMaster(data.jobs);
  //       setTotalPages(data.totalPages);
  //       setTotalJobs(data.totalJobs);
  //     } else {
  //       console.error("Failed to fetch jobs");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching jobs:", error);
  //   } finally {
  //     setLoadingTable(false);
  //   }
  // }, [currentPage]);


  const handleRowSelection = (id: string) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  // Function to handle "Select All" checkbox
  const handleSelectAll = () => {
    if (selectedRows.length === master.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(master.map((job) => job._id));
    }
  };

  // const isAllSelected = selectedRows.length === master.length;
  const isAllSelected = selectedRows.length === master.length && master.length > 0;



  const fetchJobs = useCallback(async () => {
    try {
      setLoadingTable(true);
      const queryParams = new URLSearchParams();
      queryParams.set("page", currentPage.toString());
      if (bolNumberFilter) queryParams.set("bolNumber", bolNumberFilter.trim());
      if (finalStatusFilter) queryParams.set("finalStatus", finalStatusFilter);
      if (reviewStatusFilter) queryParams.set("reviewStatus", reviewStatusFilter);
      if (reviewByStatusFilter) queryParams.set("reviewByStatus", reviewByStatusFilter);
      if (podDateFilter) queryParams.set("podDate", podDateFilter);
      if (podDateSignatureFilter) queryParams.set("podDateSignature", podDateSignatureFilter.trim());
      if (carrierFilter) queryParams.set("carrier", carrierFilter.trim());

      console.log("Query Params:", queryParams.toString());

      const response = await fetch(`/api/process-data/get-data/?${queryParams.toString()}`);

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
  }, [
    currentPage,
    bolNumberFilter,
    finalStatusFilter,
    reviewStatusFilter,
    reviewByStatusFilter,
    podDateFilter,
    podDateSignatureFilter,
    carrierFilter,
  ]);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);



  const handleFilterApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form default behavior
    fetchJobs(); // Manually call fetchJobs
  };

  const resetFiltersAndFetch = () => {
    Promise.resolve().then(() => {
      setFinalStatusFilter("");
      setReviewStatusFilter("");
      setReviewByStatusFilter("");
      setCarrierFilter("");
      setBolNumberFilter("");
      setPodDateFilter("");
      setPodDateSignatureFilter("");
    }).then(() => {
      fetchJobs();
    });
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
        className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isSidebarExpanded ? "ml-64" : "ml-24"
          }`}
      >
        <div className="">

          <Header
            leftContent="Master Tables"
            totalContent={totalJobs}
            rightContent={<>
              <div className="flex gap-4 mr-3">
                <div className="flex gap-2">
                  <span>
                    <BiSolidEditAlt className="fill-[#005B97] text-2xl" />
                  </span>
                  <span className="text-[#005B97]">
                    Edit
                  </span>
                </div>
                <div className="flex gap-2">
                  <span>
                    <MdDelete className="fill-[red] text-2xl" />
                  </span>
                  <span className="text-[red]">
                    Delete
                  </span>
                </div>
                <div className="flex gap-2">
                  <span>
                    <GiShare className="fill-[#AF9918] text-2xl" />
                  </span>
                  <span className="text-[#AF9918]">
                    Send
                  </span>
                </div>
              </div>
            </>
            }
            buttonContent={
              <button className="bg-[#005B97] rounded-lg py-2 px-10 text-white md:mt-0 w-60 md:w-auto">
                History
              </button>
            }
          />
        </div>


        <div className="flex-1 p-4 bg-white">
          {/* Filters Section */}
          <div
            className={`bg-gray-200 p-3 w-7/12 transition-all duration-500 ease-in-out xl:w-[70rem] 2xl:w-[90rem] ${isFilterDropDownOpen ? "rounded-t-lg" : "rounded-lg"
              }`}
          >
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsFilterDropDownOpen(!isFilterDropDownOpen)}>
              <span className="text-gray-800">
                Filters
              </span>
              <span>
                <IoIosArrowForward className={`text-xl p-0 text-[#005B97] transition-all duration-500 ease-in-out ${isFilterDropDownOpen ? 'rotate-90' : ''}`} />
              </span>
            </div>
          </div>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out xl:w-[70rem] 2xl:w-[90rem] ${isFilterDropDownOpen ? "max-h-[1000px] p-3" : "max-h-0"
              } flex flex-wrap gap-4 w-7/12  bg-gray-200 rounded-b-lg`}
          >

            <form
              onSubmit={handleFilterApply}
              className="w-full grid grid-cols-3 gap-4"
            >

              {/* Bl Search Filter */}
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

              {/* Final Status Filter */}
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

              {/* Review Status Filter */}
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

              {/* Carrier Filter */}
              <div className="flex flex-col">
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
              </div>

              {/* POD Date Filter */}
              <div className="flex flex-col">
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
                        dateInput.showPicker();  // Now TypeScript knows dateInput has showPicker()
                      }
                    }}
                  >
                    <IoCalendar size={20} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              {/* POD Signature Filter */}
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
                    {/* <FiSearch size={20} className="text-[#005B97]" /> */}
                  </button>
                </div>
              </div>

              {/* Reviewed By Filter */}
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
                    <option value="Standard User">Standard User</option>
                    <option value="Reviewer">Reviewer</option>
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

              {/* Buttons Section */}
              <div className="flex justify-end items-center gap-4 col-span-3">
                <button
                  className="text-[#005B97] underline cursor-pointer"
                  onClick={resetFiltersAndFetch}
                >
                  Reset Filters
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005B97] text-white rounded-lg hover:bg-[#2270a3]"
                >
                  Apply Filters
                </button>

              </div>
            </form>
          </div>

          <div className="mb-5">

          </div>
          <div className="md:w-[80rem] sm:w-[50rem] lg:w-[80rem] xl:w-[80rem] 2xl:w-[110rem] py-3">


            {loadingTable ? (
              <div className="flex justify-center items-end">
                <Spinner />
              </div>
            ) : master.length === 0 ? (
              <div className="flex flex-col items-center mt-20">
                <span className=" text-gray-800 text-xl shadow-xl p-4 rounded-lg">No data found</span>
              </div>
            ) : (
              <div className="overflow-x-auto py-5">
                <table>
                  <thead>
                    <tr className="text-gray-800">
                      <th className="py-2 px-4 border-b text-start min-w-36"><span className="mr-3"><input type="checkbox" checked={isAllSelected}
                        onChange={handleSelectAll} /></span>BL Number</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">Carrier</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">POD Date</th>
                      <th className="py-2 px-4 border-b text-center min-w-32">POD Signature</th>
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
                  <tbody>
                    {master.map((job) => (
                      <tr key={job._id} className="text-gray-500">
                        <td className="py-2 px-4 border-b text-start"><span className="mr-3"><input type="checkbox" checked={selectedRows.includes(job._id)}
                          onChange={() => handleRowSelection(job._id)} /></span><span className="text-[#005B97] underline">{job.blNumber}</span></td>
                        <td className="py-2 px-4 border-b text-center">{job.carrier}</td>
                        <td className="py-2 px-4 border-b text-center">{job.podDate}</td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.podSignature === "" || job.podSignature === null ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.podSignature}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.totalQty === null ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.totalQty}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.delivered === null ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.delivered}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.damaged === null ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.damaged}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.short === null ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.short}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.over === null ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.over}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.refused === null ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.refused}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.sealIntact === null ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.sealIntact}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <div
                            className={`inline-flex items-center justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${job.finalStatus === "new"
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
                                        : "bg-red-100 text-red-600"
                              }`}
                            onClick={() => toggleDropdown(job._id)}
                          >
                            <div>{job.finalStatus}</div>
                            <div className="relative">
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 ${dropdownStates === job._id ? "rotate-180" : ""
                                  }`}
                              />
                              <ul
                                className={`absolute mt-2 right-1 z-50 bg-white border rounded-md shadow-lg w-24 ${dropdownStates === job._id ? "block" : "hidden"
                                  }`}
                              >
                                <li className={`cursor-pointer px-3 py-1 hover:bg-blue-100 text-blue-600 ${job.finalStatus === 'new' ? 'bg-blue-100 text-blue-600' : ''}`}>
                                  new
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-yellow-100 text-yellow-600 ${job.finalStatus === 'inProgress' ? 'bg-yellow-100 text-yellow-600' : ''}`}>
                                  inProgress
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-green-100 text-green-600 ${job.finalStatus === 'valid' ? 'bg-green-100 text-green-600' : ''} `}>
                                  valid
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-[#faf1be] text-[#AF9918] ${job.finalStatus === 'partiallyValid' ? 'hover:bg-[#faf1be] text-[#AF9918]' : ''} `}>
                                  partiallyValid
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-red-100 text-red-600 ${job.finalStatus === 'failure' ? ' hover:bg-red-100 text-red-600' : ''} `}>
                                  failure
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-green-100 text-green-600 ${job.finalStatus === 'sent' ? 'hover:bg-green-100 text-green-600' : ''} `}>
                                  sent
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <div
                            className={`inline-flex items-center justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${job.reviewStatus === "unConfirmed"
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
                                className={`text-2xl p-0 ${dropdownStatesFirst === job._id ? "rotate-180" : ""
                                  }`}
                              />
                              <ul
                                className={`absolute mt-2 right-1 z-50 bg-white border rounded-md shadow-lg w-28 ${dropdownStatesFirst === job._id ? "block" : "hidden"
                                  }`}
                              >
                                <li className={`cursor-pointer px-3 py-1 hover:bg-blue-100 text-blue-600 ${job.reviewStatus === 'unConfirmed' ? 'bg-blue-100 text-blue-600' : ''}`}>
                                  unConfirmed
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-[#faf1be] text-[#AF9918] ${job.reviewStatus === 'confirmed' ? 'hover:bg-[#faf1be] text-[#AF9918]' : ''} `}>
                                  confirmed
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-red-100 text-red-600 ${job.reviewStatus === 'deleted' ? ' hover:bg-red-100 text-red-600' : ''} `}>
                                  deleted
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-green-100 text-green-600 ${job.reviewStatus === 'denied' ? 'hover:bg-green-100 text-green-600' : ''} `}>
                                  denied
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <div
                            className={`inline-flex items-center justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${job.recognitionStatus === "new"
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
                                className={`text-2xl p-0 ${dropdownStatesSecond === job._id ? "rotate-180" : ""
                                  }`}
                              />
                              <ul
                                className={`absolute mt-2 right-1 z-50 bg-white border rounded-md shadow-lg w-24 ${dropdownStatesSecond === job._id ? "block" : "hidden"
                                  }`}
                              >
                                <li className={`cursor-pointer px-3 py-1 hover:bg-blue-100 text-blue-600 ${job.recognitionStatus === 'new' ? 'bg-blue-100 text-blue-600' : ''}`}>
                                  new
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-yellow-100 text-yellow-600 ${job.recognitionStatus === 'inProgress' ? 'bg-yellow-100 text-yellow-600' : ''}`}>
                                  inProgress
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-green-100 text-green-600 ${job.recognitionStatus === 'valid' ? 'bg-green-100 text-green-600' : ''} `}>
                                  valid
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-[#faf1be] text-[#AF9918] ${job.recognitionStatus === 'partiallyValid' ? 'hover:bg-[#faf1be] text-[#AF9918]' : ''} `}>
                                  partiallyValid
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-red-100 text-red-600 ${job.recognitionStatus === 'failure' ? ' hover:bg-red-100 text-red-600' : ''} `}>
                                  failure
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-green-100 text-green-600 ${job.recognitionStatus === 'sent' ? 'hover:bg-green-100 text-green-600' : ''} `}>
                                  sent
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <div
                            className={`inline-flex items-center justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${job.breakdownReason === "none"
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
                                className={`text-2xl p-0 ${dropdownStatesThird === job._id ? "rotate-180" : ""
                                  }`}
                              />
                              <ul
                                className={`absolute mt-2 right-1 z-50 bg-white border rounded-md shadow-lg w-24 ${dropdownStatesThird === job._id ? "block" : "hidden"
                                  }`}
                              >
                                <li className={`cursor-pointer px-3 py-1 hover:bg-blue-100 text-blue-600 ${job.breakdownReason === 'none' ? 'bg-blue-100 text-blue-600' : ''}`}>
                                  none
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-yellow-100 text-yellow-600 ${job.breakdownReason === 'damaged' ? 'bg-yellow-100 text-yellow-600' : ''}`}>
                                  damaged
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-green-100 text-green-600 ${job.breakdownReason === 'shortage' ? 'bg-green-100 text-green-600' : ''} `}>
                                  shortage
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-[#faf1be] text-[#AF9918] ${job.breakdownReason === 'overage' ? 'hover:bg-[#faf1be] text-[#AF9918]' : ''} `}>
                                  overage
                                </li>
                                <li className={`cursor-pointer px-3 py-1 hover:bg-red-100 text-red-600 ${job.breakdownReason === 'refused' ? ' hover:bg-red-100 text-red-600' : ''} `}>
                                  refused
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-center">{job.reviewedBy}</td>
                        <td className="py-2 px-4 border-b text-center">
                          <Link href="" className="underline text-[#005B97] flex items-center gap-1">
                            Detail <span>
                              <IoIosArrowForward className="text-xl p-0" />
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {master.length !== 0 && (
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
            )}

          </div>

        </div>

      </div>
    </div >
  );
};

export default MasterPage;
