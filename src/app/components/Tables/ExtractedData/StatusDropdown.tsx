import React from "react";
import Tippy from "@tippyjs/react";
import { RiArrowDropDownLine } from "react-icons/ri";

interface StatusOption {
  status: string;
  color: string;
  bgColor: string;
}

interface StatusData {
  jobId: string;
  statusKey: string;
  currentStatus: string;
  userRole: string;
  name: string;
}

interface DropdownController {
  dropdownState: string | null;
  setDropdownState: (id: string | null) => void;
  parentRef: React.MutableRefObject<any>;
}

interface InteractionHandlers {
  options: StatusOption[];
  updateStatus: (
    id: string,
    field: string,
    value: string,
    reviewedBy: string
  ) => void;
}

interface StatusDropdownProps {
  statusData: StatusData;
  dropdownController: DropdownController;
  interactionHandlers: InteractionHandlers;
}

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    new: "bg-blue-100 text-blue-600",
    inProgress: "bg-yellow-100 text-yellow-600",
    valid: "bg-green-100 text-green-600",
    partiallyValid: "bg-[#faf1be] text-[#AF9918]",
    failure: "bg-red-100 text-red-600",
    sent: "bg-green-100 text-green-600",
    unConfirmed: "bg-yellow-100 text-yellow-600",
    confirmed: "bg-green-100 text-green-600",
    denied: "bg-[#faf1be] text-[#AF9918]",
    deleted: "bg-red-100 text-red-600",
    none: "bg-blue-100 text-blue-600",
    damaged: "bg-yellow-100 text-yellow-600",
    shortage: "bg-green-100 text-green-600",
    overage: "bg-[#faf1be] text-[#AF9918]",
    refused: "bg-red-100 text-red-600",
  };

  return styles[status] || "bg-gray-100 text-gray-600";
};

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  statusData,
  dropdownController,
  interactionHandlers,
}) => {
  const {
    jobId,
    statusKey,
    currentStatus,
    userRole,
    name,
  } = statusData;

  const {
    dropdownState,
    setDropdownState,
    parentRef,
  } = dropdownController;

  const {
    options,
    updateStatus,
  } = interactionHandlers;

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
        className={`inline-flex items-center justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
          userRole !== "standarduser" ? "cursor-pointer" : ""
        } ${getStatusStyle(currentStatus)}`}
      >
        <div>{currentStatus}</div>
        <RiArrowDropDownLine
          className={`text-2xl transform transition-transform duration-300 ${
            dropdownState === jobId ? "rotate-180" : ""
          }`}
        />
      </div>
    </Tippy>
  );
};

export default StatusDropdown;
