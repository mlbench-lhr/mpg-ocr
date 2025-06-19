"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Header from "../components/Header";
import { useRouter } from "next/navigation";
import axios from "axios";
import PODFilter from "../components/pod/PODFilter";
import PodTable from "../components/Tables/PODData/PODDataTable";
import NoData from "../components/pod/NoData";
import LimitInput from "../components/pod/LimitInput";
import FilterActions from "../components/pod/FilterActions";
import PodPagination from "../components/pod/PodPagination";
import TableSpinner from "../components/TableSpinner";

type POD = {
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
  const [loadingTable, setLoadingTable] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [podData, setPodData] = useState<POD[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [applyFilters, setApplyFilters] = useState(false);
  const [resetEnabled, setResetEnabled] = useState(false);
  const [limit, setLimit] = useState<number | "">(100);

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

  console.log(filtersApplied);

  const handleApplyFilters = () => {
    const hasFilterData = Object.values(filters).some((v) => v !== "");

    // Always fetch data when Apply Filter is clicked
    setApplyFilters(true);

    // Enable Reset button only if there was some filter input
    if (hasFilterData) {
      setResetEnabled(true);
    }
  };

  const handleResetFilters = () => {
    setFilters(
      (prev) =>
        Object.fromEntries(
          Object.keys(prev).map((key) => [key, ""])
        ) as typeof filters
    );
    setResetEnabled(false); // Disable button after reset
    setApplyFilters(false);
  };

  useEffect(() => {
    const isAny = Object.values(filters).some((v) => v !== "");
    setFiltersApplied(isAny);
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

      const searchParam = Object.entries(filters)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      const response = await axios.get(
        `/api/oracle-data?page=${currentPage}&${searchParam}&limit=${limit}`
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
  }, [currentPage, filters, limit]);
  console.log("limit-> ", limit);
  useEffect(() => {
    if (applyFilters) {
      fetchPodData();
      setApplyFilters(false);
    }
  }, [applyFilters, fetchPodData]);

  useEffect(() => {
    fetchPodData();
  }, [currentPage, limit]);

  console.log("current-> ", currentPage);

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
            ""
            // <input
            //   type="text"
            //   placeholder="Search user..."
            //   className="px-4 py-2 rounded-lg border border-gray-300"
            //   value={searchQuery}
            //   onChange={(e) => setSearchQuery(e.target.value)}
            // />
          }
          buttonContent={""}
        />
        <div className="px-2  bg-[#E6E7EB] rounded-lg mx-2 mb-3 pb-3">
          <PODFilter filters={filters} setFilters={setFilters} />
          <LimitInput value={limit} onChange={setLimit} />

          <FilterActions
            onReset={handleResetFilters}
            onApply={handleApplyFilters}
            resetEnabled={resetEnabled}
          />
        </div>

        {loadingTable ? (
          <div className="flex justify-center">
            <TableSpinner />
          </div>
        ) : podData.length === 0 ? (
          <NoData />
        ) : (
          <div className="w-full overflow-x-auto grid">
            <PodTable data={podData} />
          </div>
        )}

        {!loadingTable && totalPages > 0 && podData.length > 0 && (
          <PodPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
