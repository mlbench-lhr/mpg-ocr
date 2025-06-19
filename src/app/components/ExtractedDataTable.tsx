import React from "react";
import Link from "next/link";
import { RiArrowDropDownLine } from "react-icons/ri";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import TableSpinner from "./TableSpinner";
// import FileNameCell from "./FileNameCell";
import FileNameCell from "../components/UI/FileNameCell";
import { IoIosArrowForward } from "react-icons/io";


interface TableProps {
    isFilterDropDownOpen:any
  master: any[];
  selectedRows: string[];
  handleRowSelection: (id: string) => void;
  handlePageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  loadingTable: boolean;
  isAllSelected: boolean;
  handleSelectAll: () => void;
  handleRouteChange: () => void;
  updateStatus: (id: string, field: string, value: string, name: string) => void;
  name: string;
  userRole: string;
  finalOptions: any[];
  reviewOptions: any[];
  recognitionOptions: any[];
  breakdownOptions: any[];
  dropdownStates: string | null;
  setDropdownStates: (id: string | null) => void;
  dropdownStatesFirst: string | null;
  setDropdownStatesFirst: (id: string | null) => void;
  dropdownStatesSecond: string | null;
  setDropdownStatesSecond: (id: string | null) => void;
  dropdownStatesThird: string | null;
  setDropdownStatesThird: (id: string | null) => void;
  parentRefFinal: any;
  parentRefReview: any;
  parentRefRecognition: any;
  parentRefBreakdown: any;
}

const ExtractedDataTable: React.FC<TableProps> = ({
    isFilterDropDownOpen,
  master,
  selectedRows,
  handleRowSelection,
  handlePageChange,
  currentPage,
  totalPages,
  loadingTable,
  isAllSelected,
  handleSelectAll,
  handleRouteChange,
  updateStatus,
  name,
  userRole,
  finalOptions,
  reviewOptions,
  recognitionOptions,
  breakdownOptions,
  dropdownStates,
  setDropdownStates,
  dropdownStatesFirst,
  setDropdownStatesFirst,
  dropdownStatesSecond,
  setDropdownStatesSecond,
  dropdownStatesThird,
  setDropdownStatesThird,
  parentRefFinal,
  parentRefReview,
  parentRefRecognition,
  parentRefBreakdown
}) => {
  return (
 
    <div className="py-3 mx-auto z-10">
            {master.length === 0 && !loadingTable ? (
              <div className="flex flex-col items-center mt-20">
                <span className="text-gray-800 text-xl shadow-xl p-4 rounded-lg">
                  No data found
                </span>
              </div>
            ) : (
              <div
                className={`overflow-x-auto w-full relative ${
                  isFilterDropDownOpen
                    ? "2xl:h-[700px] md:h-[170px] sm:h-[150px]"
                    : "2xl:h-[900px] md:h-[460px] sm:h-[450px]"
                }`}
              >
                {/* <div className={`overflow-x-auto w-full relative`}> */}
                <table className="table-auto min-w-full w-full border-collapse">
                  <thead className="sticky top-0 bg-white z-20 shadow-md">
                    <tr className="text-gray-800">
                      <th className="py-2 px-4 border-b text-start min-w-44 max-w-44 sticky left-0 bg-white z-20">
                        <span className="mr-3">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                          />
                        </span>
                        BL Number
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-44 max-w-44 sticky left-44 bg-white z-10">
                        Uploaded File
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-44 max-w-44 sticky left-[22rem] bg-white z-10">
                        Job Name
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-32">
                        POD Date
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-36">
                        Stamp Exists
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-40">
                        Signature Exists
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-36">
                        Seal Intact
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-32">
                        Issued Qty
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-36">
                        Received Qty
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-36">
                        Damaged Qty
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-28">
                        Short Qty
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-28">
                        Over Qty
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-32">
                        Refused Qty
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-52">
                        Customer Order Num
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-32">
                        Final Status
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-36">
                        Review Status
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-48">
                        Recognition Status
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-48">
                        Breakdown Reason
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-36">
                        Reviewed By
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-28">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="relative">
                    {loadingTable ? (
                      <tr>
                        <td
                          colSpan={Object.keys(master[0] || {}).length}
                          className="text-center"
                        >
                          <div className="flex justify-center">
                            <TableSpinner />
                          </div>
                        </td>
                      </tr>
                    ) : master.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9999}
                          className="py-10 text-center text-gray-800 text-xl shadow-xl p-4 rounded-lg"
                        >
                          No data found
                        </td>
                      </tr>
                    ) : (
                      master.map((job) => (
                        <tr key={job._id} className="text-gray-500">
                          <td className="py-2 px-4 border-b text-start m-0 sticky left-0 bg-white z-10">
                            <span className="mr-3">
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(job._id)}
                                onChange={() => handleRowSelection(job._id)}
                              />
                            </span>
                            <Link
                              href={`/extracted-data-monitoring/${job._id}`}
                              onClick={() => {
                                handleRouteChange();
                                localStorage.setItem("prev", "");
                              }}
                              className="group"
                            >
                              <span className="text-[#005B97] underline group-hover:text-blue-500 transition-all duration-500 transform group-hover:scale-110">
                                {job.OCR_BOLNO}
                              </span>
                            </Link>
                          </td>
                          <FileNameCell
                            pdfUrl={job.pdfUrl}
                            fileId={job.FILE_ID}
                          />
                          <td className="py-2 px-4 border-b text-center min-w-44 max-w-44 sticky left-[22rem] bg-white z-10">
                            {job.jobName}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.OCR_STMP_POD_DTT}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.OCR_SYMT_NONE === null ||
                            job.OCR_SYMT_NONE === undefined ? (
                              <span className="flex justify-center items-center">
                                {/* <IoIosInformationCircle className="text-2xl text-red-500" /> */}
                              </span>
                            ) : (
                              job.OCR_SYMT_NONE
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.OCR_STMP_SIGN === null ||
                            job.OCR_STMP_SIGN === undefined ? (
                              <span className="flex justify-center items-center">
                                {/* <IoIosInformationCircle className="text-2xl text-red-500" /> */}
                              </span>
                            ) : (
                              job.OCR_STMP_SIGN
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.OCR_SYMT_SEAL === null ||
                            job.OCR_SYMT_SEAL === undefined ? (
                              <span className="flex justify-center items-center">
                                {/* <IoIosInformationCircle className="text-2xl text-red-500" /> */}
                              </span>
                            ) : (
                              job.OCR_SYMT_SEAL
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.OCR_ISSQTY === null ||
                            job.OCR_ISSQTY === undefined ? (
                              <span className="flex justify-center items-center">
                                {/* <IoIosInformationCircle className="text-2xl text-red-500" /> */}
                              </span>
                            ) : (
                              job.OCR_ISSQTY
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.OCR_RCVQTY === null ||
                            job.OCR_RCVQTY === undefined ? (
                              <span className="flex justify-center items-center">
                                {/* <IoIosInformationCircle className="text-2xl text-red-500" /> */}
                              </span>
                            ) : (
                              job.OCR_RCVQTY
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.OCR_SYMT_DAMG === null ||
                            job.OCR_SYMT_DAMG === undefined ? (
                              <span className="flex justify-center items-center">
                                {/* <IoIosInformationCircle className="text-2xl text-red-500" /> */}
                              </span>
                            ) : (
                              job.OCR_SYMT_DAMG
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.OCR_SYMT_SHRT === null || job.OCR_SYMT_SHRT === undefined ? (
                              <span className="flex justify-center items-center">
                                {/* <IoIosInformationCircle className="text-2xl text-red-500" /> */}
                              </span>
                            ) : (
                              job.OCR_SYMT_SHRT
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.OCR_SYMT_ORVG === null || job.OCR_SYMT_ORVG === undefined ? (
                              <span className="flex justify-center items-center">
                                {/* <IoIosInformationCircle className="text-2xl text-red-500" /> */}
                              </span>
                            ) : (
                              job.OCR_SYMT_ORVG
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.OCR_SYMT_REFS === null ||
                            job.OCR_SYMT_REFS === undefined ? (
                              <span className="flex justify-center items-center">
                                {/* <IoIosInformationCircle className="text-2xl text-red-500" /> */}
                              </span>
                            ) : (
                              job.OCR_SYMT_REFS
                            )}
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
                                  {finalOptions.map(
                                    ({ status, color, bgColor }) => (
                                      <li
                                        key={status}
                                        className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${
                                          job.finalStatus === status
                                            ? `${color} ${bgColor}`
                                            : color
                                        }`}
                                        onClick={() => {
                                          updateStatus(
                                            job._id,
                                            "finalStatus",
                                            status,
                                            name
                                          );
                                          parentRefFinal.current?.hide();
                                        }}
                                      >
                                        {status}
                                      </li>
                                    )
                                  )}
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
                              appendTo={() => document.body}
                            >
                              <div
                                className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${
                                  userRole !== "standarduser"
                                    ? "cursor-pointer"
                                    : ""
                                } ${
                                  job.finalStatus === "new"
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
                                  className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${
                                    dropdownStates === job._id
                                      ? "rotate-180"
                                      : ""
                                  }`}
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
                                  {reviewOptions.map(
                                    ({ status, color, bgColor }) => (
                                      <li
                                        key={status}
                                        className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${
                                          job.reviewStatus === status
                                            ? `${color} ${bgColor}`
                                            : color
                                        }`}
                                        onClick={() => {
                                          updateStatus(
                                            job._id,
                                            "reviewStatus",
                                            status,
                                            name
                                          );
                                          parentRefReview.current?.hide();
                                        }}
                                      >
                                        {status}
                                      </li>
                                    )
                                  )}
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
                              appendTo={() => document.body}
                            >
                              <div
                                className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${
                                  userRole !== "standarduser"
                                    ? "cursor-pointer"
                                    : ""
                                } ${
                                  job.reviewStatus === "unConfirmed"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : job.reviewStatus === "confirmed"
                                    ? "bg-green-100 text-green-600"
                                    : job.reviewStatus === "denied"
                                    ? "bg-[#faf1be] text-[#AF9918]"
                                    : job.reviewStatus === "deleted"
                                    ? "bg-red-100 text-red-600"
                                    : ""
                                }`}
                              >
                                <div>{job.reviewStatus}</div>
                                <RiArrowDropDownLine
                                  className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${
                                    dropdownStatesFirst === job._id
                                      ? "rotate-180"
                                      : ""
                                  }`}
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
                                  {recognitionOptions.map(
                                    ({ status, color, bgColor }) => (
                                      <li
                                        key={status}
                                        className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${
                                          job.recognitionStatus === status
                                            ? `${color} ${bgColor}`
                                            : color
                                        }`}
                                        onClick={() => {
                                          updateStatus(
                                            job._id,
                                            "recognitionStatus",
                                            status,
                                            name
                                          );
                                          parentRefRecognition.current?.hide();
                                        }}
                                      >
                                        {status}
                                      </li>
                                    )
                                  )}
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
                              appendTo={() => document.body}
                            >
                              <div
                                className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${
                                  userRole !== "standarduser"
                                    ? "cursor-pointer"
                                    : ""
                                } ${
                                  job.recognitionStatus === "new"
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
                              >
                                <div>{job.recognitionStatus}</div>
                                <RiArrowDropDownLine
                                  className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${
                                    dropdownStatesSecond === job._id
                                      ? "rotate-180"
                                      : ""
                                  }`}
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
                                  {breakdownOptions.map(
                                    ({ status, color, bgColor }) => (
                                      <li
                                        key={status}
                                        className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${
                                          job.breakdownReason === status
                                            ? `${color} ${bgColor}`
                                            : color
                                        }`}
                                        onClick={() => {
                                          updateStatus(
                                            job._id,
                                            "breakdownReason",
                                            status,
                                            name
                                          );
                                          parentRefBreakdown.current?.hide();
                                        }}
                                      >
                                        {status}
                                      </li>
                                    )
                                  )}
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
                              appendTo={() => document.body}
                            >
                              <div
                                className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${
                                  userRole !== "standarduser"
                                    ? "cursor-pointer"
                                    : ""
                                } ${
                                  job.breakdownReason === "none"
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
                                  className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${
                                    dropdownStatesThird === job._id
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </div>
                            </Tippy>
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {job.UPTD_USR_CD}
                          </td>
                          <td className="py-2 px-6 border-b text-center">
                            <Link
                              href={`/extracted-data-monitoring/edit-pdf/${job.FILE_ID}`}
                              onClick={() => {
                                handleRouteChange();
                                localStorage.setItem("prev", "");
                              }}
                              className="underline text-[#005B97] flex items-center gap-1 transition-all duration-300 hover:text-blue-500 group"
                            >
                              Detail
                              <span className="transform transition-transform duration-300 ease-in-out group-hover:translate-x-1">
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

            {master.length !== 0 && (
              <div className="mt-5 flex justify-end gap-5 items-center text-gray-800">
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
   
  );
};

export default ExtractedDataTable;