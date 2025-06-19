import React from "react";
import Tippy from "@tippyjs/react";
import { RiArrowDropDownLine } from "react-icons/ri";

interface StatusDropdownProps {
  jobId: string;
  statusKey: string; // e.g., 'finalStatus', 'reviewStatus'
  currentStatus: string;
  options: { status: string; color: string; bgColor: string }[];
  userRole: string;
  dropdownState: string | null;
  setDropdownState: (id: string | null) => void;
  updateStatus: (id: string, field: string, value: string, name: string) => void;
  name: string;
  parentRef: React.MutableRefObject<any>;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  jobId,
  statusKey,
  currentStatus,
  options,
  userRole,
  dropdownState,
  setDropdownState,
  updateStatus,
  name,
  parentRef,
}) => {
  return (
    <Tippy
      onMount={(instance) => {
        parentRef.current = instance;
      }}
      onHide={() => {
        parentRef.current = null;
        setDropdownState(null);
      }}
      content={
        <ul className="bg-white border text-center rounded-md shadow-lg w-32">
          {options.map(({ status, color, bgColor }) => (
            <li
              key={status}
              className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${
                currentStatus === status ? `${color} ${bgColor}` : color
              }`}
              onClick={() => {
                updateStatus(jobId, statusKey, status, name);
                parentRef.current?.hide();
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
          setDropdownState(jobId);
        } else {
          return false;
        }
      }}
      appendTo={() => document.body}
    >
      <div
        className={`inline-flex items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium ${
          userRole !== "standarduser" ? "cursor-pointer" : ""
        } ${
          currentStatus === "new"
            ? "bg-blue-100 text-blue-600"
            : currentStatus === "inProgress"
            ? "bg-yellow-100 text-yellow-600"
            : currentStatus === "valid"
            ? "bg-green-100 text-green-600"
            : currentStatus === "partiallyValid"
            ? "bg-[#faf1be] text-[#AF9918]"
            : currentStatus === "failure"
            ? "bg-red-100 text-red-600"
            : currentStatus === "sent"
            ? "bg-green-100 text-green-600"
            : currentStatus === "unConfirmed"
            ? "bg-yellow-100 text-yellow-600"
            : currentStatus === "confirmed"
            ? "bg-green-100 text-green-600"
            : currentStatus === "denied"
            ? "bg-[#faf1be] text-[#AF9918]"
            : currentStatus === "deleted"
            ? "bg-red-100 text-red-600"
            : currentStatus === "none"
            ? "bg-blue-100 text-blue-600"
            : currentStatus === "damaged"
            ? "bg-yellow-100 text-yellow-600"
            : currentStatus === "shortage"
            ? "bg-green-100 text-green-600"
            : currentStatus === "overage"
            ? "bg-[#faf1be] text-[#AF9918]"
            : currentStatus === "refused"
            ? "bg-red-100 text-red-600"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        <div>{currentStatus}</div>
        <RiArrowDropDownLine
          className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${
            dropdownState === jobId ? "rotate-180" : ""
          }`}
        />
      </div>
    </Tippy>
  );
};

export default StatusDropdown;
