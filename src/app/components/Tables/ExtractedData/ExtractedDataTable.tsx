import React from "react";
import Link from "next/link";
import { RiArrowDropDownLine } from "react-icons/ri";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import TableSpinner from "../../TableSpinner";
// import FileNameCell from "./FileNameCell";
import FileNameCell from "../../UI/FileNameCell";
import { IoIosArrowForward } from "react-icons/io";
import ExtractedDataRow from "./ExtractedDataRow";

interface TableProps {
  isFilterDropDownOpen: any;
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
  updateStatus: (
    id: string,
    field: string,
    value: string,
    name: string
  ) => void;
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
  parentRefBreakdown,
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
                  <ExtractedDataRow
                    key={job._id}
                    job={job}
                    selectedRows={selectedRows}
                    handleRowSelection={handleRowSelection}
                    handleRouteChange={handleRouteChange}
                    updateStatus={updateStatus}
                    name={name}
                    userRole={userRole}
                    finalOptions={finalOptions}
                    reviewOptions={reviewOptions}
                    recognitionOptions={recognitionOptions}
                    breakdownOptions={breakdownOptions}
                    dropdownStates={dropdownStates}
                    setDropdownStates={setDropdownStates}
                    dropdownStatesFirst={dropdownStatesFirst}
                    setDropdownStatesFirst={setDropdownStatesFirst}
                    dropdownStatesSecond={dropdownStatesSecond}
                    setDropdownStatesSecond={setDropdownStatesSecond}
                    dropdownStatesThird={dropdownStatesThird}
                    setDropdownStatesThird={setDropdownStatesThird}
                    parentRefFinal={parentRefFinal}
                    parentRefReview={parentRefReview}
                    parentRefRecognition={parentRefRecognition}
                    parentRefBreakdown={parentRefBreakdown}
                  />
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
