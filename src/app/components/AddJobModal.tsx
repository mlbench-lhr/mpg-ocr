"use client";

import { useState, useEffect } from "react";
import { Job } from "../../types"; // Import the shared Job type
import { FaChevronDown, FaClock } from "react-icons/fa";


// interface Job {
//   _id?: string;
//   selectedDays: string[];
//   fromTime: string;
//   toTime: string;
//   everyTime: string;
//   active?: boolean;
// }

interface AddJobModalProps {
  onClose: () => void;
  onSubmit: (data: Job) => void; // Updated to Job type
}

// Helper function to convert HH:mm time to minutes
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const AddJobModal: React.FC<AddJobModalProps> = ({ onClose, onSubmit }) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [everyTime, setEveryTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [availableDurations, setAvailableDurations] = useState<number[]>([]);
  const [error, setError] = useState<string>("");


  // Update available durations whenever fromTime or toTime changes
  useEffect(() => {
    if (fromTime && toTime) {
      const startMinutes = timeToMinutes(fromTime);
      const endMinutes = timeToMinutes(toTime);

      // Check if toTime is at least 1 hour after fromTime
      if (endMinutes - startMinutes < 60) {
        setError("The 'To' time must be at least 1 hour after the 'From' time.");
        setAvailableDurations([]); // Clear available durations
      } else {
        setError(""); // Clear error

        const totalMinutes = endMinutes - startMinutes;

        // Limit the maximum duration to 120 minutes
        const maxDuration = Math.min(totalMinutes, 120);

        // Generate duration options in increments of 20 minutes up to the total duration or 120 minutes
        const durations = [];
        for (let i = 20; i <= maxDuration; i += 20) {
          durations.push(i);
        }

        setAvailableDurations(durations);

        // Reset `everyTime` if it exceeds the new range
        if (everyTime && +everyTime > maxDuration) {
          setEveryTime("");
        }
      }
    } else {
      setError(""); // Clear error when time fields are empty
      setAvailableDurations([]);
    }
  }, [fromTime, toTime, everyTime]);

  // Handle day selection (checkbox change)
  const handleDayChange = (day: string) => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((selectedDay) => selectedDay !== day)
        : [...prevSelectedDays, day]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (selectedDays.length === 0) {
      setErrorMessage("Please select at least one day.");
      return;
    }

    if (fromTime === toTime) {
      setErrorMessage('"From" time and "To" time cannot be the same.');
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const jobData: Job = { selectedDays, fromTime, toTime, everyTime, _id: "", active: false }; // Add default _id

    try {
      const response = await fetch("/api/jobs/add-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to add job.");
        return;
      }

      const responseData = await response.json();
      console.log("Job added successfully:", responseData);

      onSubmit(jobData);  // Pass the new job data to the parent
      onClose();          // Close the modal
    } catch (error) {
      console.error("Error adding job:", error);
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-7 right-2 font-bold text-white bg-[#005B97] rounded-full px-[7px] py-0"
        >
          &times;
        </button>
        <h2 className="text-2xl text-center text-gray-800 font-bold mb-4">Add Job</h2>
        <form onSubmit={handleFormSubmit}>
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 text-red-600 font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Day Selection - Checkboxes */}
          <div className="mb-4">
            <label className="block font-semibold text-gray-800 mb-3">Select Days</label>
            <div className="grid grid-cols-3 gap-4">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <div key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    id={day}
                    checked={selectedDays.includes(day)}
                    onChange={() => handleDayChange(day)}
                    className="mr-2"
                  />
                  <label htmlFor={day} className="text-gray-800">{day}</label>
                </div>
              ))}
            </div>
          </div>


          <div className="flex flex-col mb-5">
            <label htmlFor="fromTime" className="text-sm font-semibold text-gray-800">
              AT/From
            </label>
            <div className="relative">
              <input
                id="fromTime"
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] custom-time-input"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
                onClick={() => {
                  const podDateInput = document.getElementById("fromTime") as HTMLInputElement;
                  if (podDateInput) {
                    podDateInput.showPicker();
                  }
                }}
              >
                <FaClock size={16} className="text-[#005B97]" />
              </button>
            </div>
          </div>
          {/* To Time Field */}
          <div className="flex flex-col mb-5">
            <label htmlFor="toTime" className="text-sm font-semibold text-gray-800">
              To
            </label>
            <div className="relative">
              <input
                id="toTime"
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] custom-time-input"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
                onClick={() => {
                  const podDateInput = document.getElementById("toTime") as HTMLInputElement;
                  if (podDateInput) {
                    podDateInput.showPicker();
                  }
                }}
              >
                <FaClock size={16} className="text-[#005B97]" />
              </button>
            </div>
          </div>
          {/* Error message */}
          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
          {/* Every Time Field */}
          <div className="flex flex-col mb-5">
            <label htmlFor="everyTime" className="text-sm font-semibold text-gray-800">
              Every
            </label>
            <div className="relative">
              <select
                id="everyTime"
                className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
                value={everyTime}
                onChange={(e) => setEveryTime(e.target.value)}
                required
              >
                <option value="">Select Time</option>
                {availableDurations.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} Mins
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
              >
                <FaChevronDown size={16} className="text-[#005B97]" />
              </button>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex">
            <button
              type="submit"
              className={`w-full px-6 py-2 rounded-md ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#005B97] text-white"
                }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobModal;
