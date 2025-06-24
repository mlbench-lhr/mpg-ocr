import React from "react";
import Link from "next/link";
import { RiArrowDropDownLine } from "react-icons/ri";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import TableSpinner from "../../TableSpinner";
import FileNameCell from "../../UI/FileNameCell";
import { IoIosArrowForward } from "react-icons/io";
import ExtractedDataRow from "./ExtractedDataRow";
import { Instance } from "tippy.js";
import { PODOCR } from "@/app/extracted-data-monitoring/page";

interface TableController {
  PODOCR: PODOCR[];
  selectedRows: string[];
  currentPage: number;
  totalPages: number;
  loadingTable: boolean;
  isAllSelected: boolean;
  name: string;
  userRole: string;
  updateStatus: (
    id: string,
    field: string,
    value: string,
    reviewedBy: string
  ) => Promise<void>;
}

interface Handlers {
  handleRowSelection: (id: string) => void;
  handlePageChange: (page: number) => void;
  handleSelectAll: () => void;
  handleRouteChange: () => void;
}

interface UIControls {
  isFilterDropDownOpen: boolean;
  dropdownStates: string | null;
  setDropdownStates: React.Dispatch<React.SetStateAction<string | null>>;
  dropdownStatesFirst: string | null;
  setDropdownStatesFirst: React.Dispatch<React.SetStateAction<string | null>>;
  dropdownStatesSecond: string | null;
  setDropdownStatesSecond: React.Dispatch<React.SetStateAction<string | null>>;
  dropdownStatesThird: string | null;
  setDropdownStatesThird: React.Dispatch<React.SetStateAction<string | null>>;
  parentRefFinal: React.MutableRefObject<Instance | null>;
  parentRefReview: React.MutableRefObject<Instance | null>;
  parentRefRecognition: React.MutableRefObject<Instance | null>;
  parentRefBreakdown: React.MutableRefObject<Instance | null>;
  finalOptions: any[];
  reviewOptions: any[];
  recognitionOptions: any[];
  breakdownOptions: any[];
}

interface ExtractedDataTableProps {
  tableController: TableController;
  handlers: Handlers;
  uiControls: UIControls;
}

const ExtractedDataTable: React.FC<ExtractedDataTableProps> = ({
  tableController,
  handlers,
  uiControls,
}) => {
  const {
    PODOCR,
    selectedRows,
    currentPage,
    totalPages,
    loadingTable,
    isAllSelected,
    name,
    userRole,
    updateStatus,
  } = tableController;

  const {
    handleRowSelection,
    handlePageChange,
    handleSelectAll,
    handleRouteChange,
  } = handlers;

  const {
    isFilterDropDownOpen,
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
    finalOptions,
    reviewOptions,
    recognitionOptions,
    breakdownOptions,
  } = uiControls;

  return (
    <div className="py-3 mx-auto z-10">
      {PODOCR.length === 0 && !loadingTable ? (
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
                  File Name
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
                    colSpan={Object.keys(PODOCR[0] || {}).length}
                    className="text-center"
                  >
                    <div className="flex justify-center">
                      <TableSpinner />
                    </div>
                  </td>
                </tr>
              ) : PODOCR.length === 0 ? (
                <tr>
                  <td
                    colSpan={9999}
                    className="py-10 text-center text-gray-800 text-xl shadow-xl p-4 rounded-lg"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                PODOCR.map((job) => (
                  <ExtractedDataRow
                  key={job.FILE_ID}
                  job={job}
                  selectedRows={selectedRows}
                  tableController={{ updateStatus, name, userRole }}
                  handlers={{ handleRowSelection, handleRouteChange }}
                  uiControls={{
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
                  }}
                />
                
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {PODOCR.length !== 0 && (
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