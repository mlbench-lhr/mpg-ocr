"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import PODFilter from "../components/PODFilter";

type Log = {
  FILE_ID: string;
  CRTD_USR_CD: string;
  CRTD_DTT: string;
  SENT_FILE_DTT: string;
  OCR_BOLNO: string;
  OCR_ISSQTY: number;
  OCR_RCVQTY: number;
  OCR_STMP_SIGN: string;
  OCR_SYMT_NONE: string;
  OCR_SYMT_DAMG: string;
  OCR_SYMT_SHRT: string;
  OCR_SYMT_ORVG: string;
  OCR_SYMT_REFS: string;
  RECV_DATA_DTT: string;
  UPTD_USR_CD: string;
  UPTD_DTT: string;
  OCR_STMP_POD_DTT: string;
  RNUM: number;
  OCR_SYMT_SEAL: string;
};

export default function Page() {
  const [totalPod, setTotalPod] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [podData, setPodData] = useState<Log[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [applyFilters, setApplyFilters] = useState(false);
  const [filters, setFilters] = useState({
    file_id: "",
    crtd_usr_cd: "",
    crtd_dtt: "",
    sent_file_dtt: "",
    ocr_bolno: "",
    ocr_issqty: "",
    ocr_rcvqty: "",
    ocr_stmp_sign: "",
    ocr_symt_none: "",
    ocr_symt_damg: "",
    ocr_symt_shrt: "",
    ocr_symt_orvg: "",
    ocr_symt_refs: "",
    ocr_symt_seal: "",
    recv_data_dtt: "",
    uptd_usr_cd: "",
    uptd_dtt: "",
    ocr_stmp_pod_dtt: "",
    rnum: "",
  });
  const router = useRouter();
  const [filtersApplied, setFiltersApplied] = useState(false);

  const handleApplyFilters = () => {
    const isAnyFilterSet = Object.values(filters).some((val) => val !== "");
    setFiltersApplied(isAnyFilterSet);

    if (isAnyFilterSet) {
      setApplyFilters(true); // this will trigger fetchPodData via useEffect
    }
  };

  const handleResetFilters = () => {
    setFilters(
      (prev) =>
        Object.fromEntries(
          Object.keys(prev).map((key) => [key, ""])
        ) as typeof filters
    );
    setFiltersApplied(false);
    setApplyFilters(false); // prevents unnecessary fetch
  };

  useEffect(() => {
    const isAny = Object.values(filters).some((v) => v !== "");
    if (!isAny) setFiltersApplied(false);
  }, [filters]);
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

  const fetchPodData = useCallback(async () => {
    try {
      setLoadingTable(true);

      // const searchParam = searchQuery
      //   ? `&search=${encodeURIComponent(searchQuery)}`
      //   : "";

      const searchParam = Object.entries(filters)
        .filter(([_, value]) => value !== "")
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      console.log("search params-> ", searchParam);
      const response = await axios.get(
        `/api/oracle-data?page=${currentPage}${searchParam}`
      );

      const data = response.data;
      setPodData(data.data);
      setTotalPages(data.totalPages);
      setTotalPod(data.total);
    } catch (error) {
      console.log("Error fetching podData:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    if (applyFilters) {
      fetchPodData();
    }
  }, [applyFilters, currentPage, fetchPodData]);

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
          leftContent="Total POD"
          totalContent={totalPod}
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
        <div>
          <PODFilter filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex justify-end items-center gap-2 col-span-3">
          <button
            onClick={handleResetFilters}
            disabled={!filtersApplied}
            className={`underline ${
              !filtersApplied
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#005B97] cursor-pointer"
            }`}
          >
            Reset Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 rounded-lg bg-[#005B97] text-white hover:bg-[#2270a3]"
          >
            Apply Filters
          </button>
        </div>
        <div className="flex-1 p-4 bg-white">
          {loadingTable ? (
            <div className="flex justify-center items-center">
              <Spinner />
            </div>
          ) : podData.length === 0 ? (
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
            <>
              <div className="w-full overflow-x-auto grid">
                <table className="min-w-full bg-white border-gray-300">
                  <thead>
                    <tr className="text-xl text-gray-800">
                      <th className="py-2 px-4 border-b text-start font-medium">
                        File ID
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        CRTD_USR_CD
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        CRTD_DTT
                      </th>

                      <th className="py-2 px-4 border-b text-center font-medium">
                        SENT_FILE_DTT
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_BOLNO
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_ISSQTY
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_RCVQTY
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_STMP_SIGN
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_SYMT_NONE
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_SYMT_DAMG
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_SYMT_SHRT
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_SYMT_ORVG
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_SYMT_REFS
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_SYMT_SEAL
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        RECV_DATA_DTT
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        UPTD_USR_CD
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        UPTD_DTT
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        OCR_STMP_POD_DTT
                      </th>
                      <th className="py-2 px-4 border-b text-center font-medium">
                        RNUM
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {podData.map((podData: Log, index: number) => (
                      <tr key={index} className="text-gray-600">
                        <td className="py-1 px-4 border-b text-start text-lg font-medium">
                          {podData.FILE_ID}
                        </td>

                        <td className="py-1 px-4 border-b text-center">
                          {podData.CRTD_USR_CD}
                        </td>
                        <td className="py-1 px-4 border-b text-center text-gray-500">
                          {new Date(podData.CRTD_DTT).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="py-1 px-4 border-b text-center text-gray-500">
                          {new Date(podData.SENT_FILE_DTT).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.OCR_BOLNO}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.OCR_ISSQTY}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.OCR_RCVQTY}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.OCR_STMP_SIGN}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.OCR_SYMT_NONE}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.OCR_SYMT_DAMG}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.OCR_SYMT_SHRT}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.OCR_SYMT_ORVG}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.OCR_SYMT_REFS}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.OCR_SYMT_SEAL}
                        </td>
                        <td className="py-1 px-4 border-b text-center text-gray-500">
                          {new Date(podData.RECV_DATA_DTT).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.UPTD_USR_CD}
                        </td>
                        <td className="py-1 px-4 border-b text-center text-gray-500">
                          {new Date(podData.UPTD_DTT).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="py-1 px-4 border-b text-center text-gray-500">
                          {podData.OCR_STMP_POD_DTT}
                        </td>
                        <td className="py-1 px-4 border-b text-center">
                          {podData.RNUM}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {loadingTable || totalPages === 0 || podData.length === 0 ? null : (
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
