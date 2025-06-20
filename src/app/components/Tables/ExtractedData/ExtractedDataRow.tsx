import React from "react";
import Link from "next/link";
import FileNameCell from "../../UI/FileNameCell";
import { IoIosArrowForward } from "react-icons/io";
import StatusDropdown from "./StatusDropdown"; // Make sure the path is correct

interface RowProps {
  job: any;
  selectedRows: string[];
  handleRowSelection: (id: string) => void;
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

const ExtractedDataRow: React.FC<RowProps> = ({
  job,
  selectedRows,
  handleRowSelection,
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
    <tr key={job.FILE_ID} className="text-gray-500">
      <td className="py-2 px-4 border-b text-start m-0 sticky left-0 bg-white z-10">
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
          <span className="text-[#005B97] underline group-hover:text-blue-500 transition-all duration-500 transform group-hover:scale-110">
            {job.OCR_BOLNO}
          </span>
        </Link>
      </td>
      <FileNameCell pdfUrl={job.pdfUrl} fileId={job.FILE_ID} />
      <td className="py-2 px-4 border-b text-center min-w-44 max-w-44 sticky left-[22rem] bg-white z-10">
        {job.jobName}
      </td>
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

      {/* Final Status Dropdown */}
      <td className="py-2 px-4 border-b text-center">
        <StatusDropdown
          jobId={job.FILE_ID}
          statusKey="finalStatus"
          currentStatus={job.finalStatus}
          options={finalOptions}
          userRole={userRole}
          dropdownState={dropdownStates}
          setDropdownState={setDropdownStates}
          updateStatus={updateStatus}
          name={name}
          parentRef={parentRefFinal}
        />
      </td>

      {/* Review Status Dropdown */}
      <td className="py-2 px-4 border-b text-center">
        <StatusDropdown
          jobId={job.FILE_ID}
          statusKey="reviewStatus"
          currentStatus={job.reviewStatus}
          options={reviewOptions}
          userRole={userRole}
          dropdownState={dropdownStatesFirst}
          setDropdownState={setDropdownStatesFirst}
          updateStatus={updateStatus}
          name={name}
          parentRef={parentRefReview}
        />
      </td>

      {/* Recognition Status Dropdown */}
      <td className="py-2 px-4 border-b text-center">
        <StatusDropdown
          jobId={job.FILE_ID}
          statusKey="recognitionStatus"
          currentStatus={job.recognitionStatus}
          options={recognitionOptions}
          userRole={userRole}
          dropdownState={dropdownStatesSecond}
          setDropdownState={setDropdownStatesSecond}
          updateStatus={updateStatus}
          name={name}
          parentRef={parentRefRecognition}
        />
      </td>

      {/* Breakdown Reason Dropdown */}
      <td className="py-2 px-4 border-b text-center">
        <StatusDropdown
          jobId={job.FILE_ID}
          statusKey="breakdownReason"
          currentStatus={job.breakdownReason}
          options={breakdownOptions}
          userRole={userRole}
          dropdownState={dropdownStatesThird}
          setDropdownState={setDropdownStatesThird}
          updateStatus={updateStatus}
          name={name}
          parentRef={parentRefBreakdown}
        />
      </td>

      <td className="py-2 px-4 border-b text-center">{job.UPTD_USR_CD}</td>
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
  );
};

export default ExtractedDataRow;
