import React from "react";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import FileNameCell from "../../UI/FileNameCell";
import StatusDropdown from "./StatusDropdown";
import { Instance } from "tippy.js";
import { PODOCR } from "@/app/extracted-data-monitoring/page";

interface StatusOption {
  status: string;
  color: string;
  bgColor: string;
}

interface TableControllerSubset {
  updateStatus: (
    id: string,
    field: string,
    value: string,
    reviewedBy: string
  ) => Promise<void>;
  name: string;
  userRole: string;
}

interface HandlersSubset {
  handleRowSelection: (id: string) => void;
  handleRouteChange: () => void;
}

interface UIControlsSubset {
  finalOptions: StatusOption[];
  reviewOptions: StatusOption[];
  recognitionOptions: StatusOption[];
  breakdownOptions: StatusOption[];
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
}

interface ExtractedDataRowProps {
  job: PODOCR;
  selectedRows: string[];
  tableController: TableControllerSubset;
  handlers: HandlersSubset;
  uiControls: UIControlsSubset;
}

const ExtractedDataRow: React.FC<ExtractedDataRowProps> = ({
  job,
  selectedRows,
  tableController,
  handlers,
  uiControls,
}) => {
  const { updateStatus, name, userRole } = tableController;
  const { handleRowSelection, handleRouteChange } = handlers;
  const {
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
  } = uiControls;

  return (
    <tr className="text-gray-500">
      {/* Checkbox + BL Number */}
      <td className="py-2 px-4 border-b text-start sticky left-0 bg-white z-10 min-w-44 max-w-44">
        <span className="mr-3">
          <input
            type="checkbox"
            checked={selectedRows.includes(job.FILE_ID)}
            onChange={() => handleRowSelection(job.FILE_ID)}
          />
        </span>
        <Link
          href={`/extracted-data-monitoring/${job.FILE_ID}`}
          onClick={() => {
            handleRouteChange();
            localStorage.setItem("prev", "");
          }}
          className="group"
        >
          <span className="text-[#005B97] underline group-hover:text-blue-500 transition-all duration-300 transform group-hover:scale-110">
            {job.OCR_BOLNO}
          </span>
        </Link>
      </td>

      {/* File name */}
      <FileNameCell pdfUrl={job.pdfUrl} fileId={job.FILE_ID} />

      {/* Job name */}
      <td className="py-2 px-4 border-b text-center min-w-44 max-w-44 sticky left-[22rem] bg-white z-10">
        {job.jobName}
      </td>

      {/* Metadata Fields */}
      <td className="py-2 px-4 border-b text-center">{job.OCR_STMP_POD_DTT}</td>
      <td className="py-2 px-4 border-b text-center">{job.OCR_SYMT_NONE ?? ""}</td>
      <td className="py-2 px-4 border-b text-center">{job.OCR_STMP_SIGN ?? ""}</td>
      <td className="py-2 px-4 border-b text-center">{job.OCR_SYMT_SEAL ?? ""}</td>
      <td className="py-2 px-4 border-b text-center">{job.OCR_ISSQTY ?? ""}</td>
      <td className="py-2 px-4 border-b text-center">{job.OCR_RCVQTY ?? ""}</td>
      <td className="py-2 px-4 border-b text-center">{job.OCR_SYMT_DAMG ?? ""}</td>
      <td className="py-2 px-4 border-b text-center">{job.OCR_SYMT_SHRT ?? ""}</td>
      <td className="py-2 px-4 border-b text-center">{job.OCR_SYMT_ORVG ?? ""}</td>
      <td className="py-2 px-4 border-b text-center">{job.OCR_SYMT_REFS ?? ""}</td>
      <td className="py-2 px-4 border-b text-center">
        {Array.isArray(job.customerOrderNum)
          ? job.customerOrderNum.join(", ")
          : job.customerOrderNum || ""}
      </td>

      {/* Status Dropdowns */}
      <td className="py-2 px-4 border-b text-center">
      <StatusDropdown
  statusData={{
    jobId: job.FILE_ID,
    statusKey: "finalStatus",
    currentStatus: job.finalStatus,
    userRole,
    name,
  }}
  dropdownController={{
    dropdownState: dropdownStates,
    setDropdownState: setDropdownStates,
    parentRef: parentRefFinal,
  }}
  interactionHandlers={{
    options: finalOptions,
    updateStatus,
  }}
/>
      </td>

      <td className="py-2 px-4 border-b text-center">
        
<StatusDropdown
  statusData={{
    jobId: job.FILE_ID,
    statusKey: "reviewStatus",
    currentStatus: job.reviewStatus,
    userRole,
    name,
  }}
  dropdownController={{
    dropdownState: dropdownStatesFirst,
    setDropdownState: setDropdownStatesFirst,
    parentRef: parentRefReview,
  }}
  interactionHandlers={{
    options: reviewOptions,
    updateStatus,
  }}
/>



      </td>

      <td className="py-2 px-4 border-b text-center">
        
<StatusDropdown
  statusData={{
    jobId: job.FILE_ID,
    statusKey: "recognitionStatus",
    currentStatus: job.recognitionStatus,
    userRole,
    name,
  }}
  dropdownController={{
    dropdownState: dropdownStatesSecond,
    setDropdownState: setDropdownStatesSecond,
    parentRef: parentRefRecognition,
  }}
  interactionHandlers={{
    options: recognitionOptions,
    updateStatus,
  }}
/>




      </td>

      <td className="py-2 px-4 border-b text-center">
       

<StatusDropdown
  statusData={{
    jobId: job.FILE_ID,
    statusKey: "breakdownReason",
    currentStatus: job.breakdownReason,
    userRole,
    name,
  }}
  dropdownController={{
    dropdownState: dropdownStatesThird,
    setDropdownState: setDropdownStatesThird,
    parentRef: parentRefBreakdown,
  }}
  interactionHandlers={{
    options: breakdownOptions,
    updateStatus,
  }}
/>
      </td>

      {/* Updated By */}
      <td className="py-2 px-4 border-b text-center">{job.UPTD_USR_CD}</td>

      {/* Detail Link */}
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
            <IoIosArrowForward className="text-xl" />
          </span>
        </Link>
      </td>
    </tr>
  );
};

export default ExtractedDataRow;
