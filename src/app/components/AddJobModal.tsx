import { useState } from "react";

interface JobData {
  selectedDays: string[];
  fromTime: string;
  toTime: string;
  everyTime: string;
}

interface AddJobModalProps {
  onClose: () => void;
  onSubmit: (data: JobData) => void; 
}

const AddJobModal: React.FC<AddJobModalProps> = ({ onClose, onSubmit }) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [everyTime, setEveryTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

    if (selectedDays.length === 0) {
      setErrorMessage("Please select at least one day.");
      return;
    }

    // Validate "From" and "To" times
    if (fromTime === toTime) {
      setErrorMessage('"From" time and "To" time cannot be the same.');
      return;
    }

    // If validation passes, clear the error message and submit the data
    setErrorMessage("");
    const jobData: JobData = { selectedDays, fromTime, toTime, everyTime };

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

      onSubmit(jobData);  // Pass the correctly typed data
      onClose();
    } catch (error) {
      console.error("Error adding job:", error);
      setErrorMessage("An unexpected error occurred.");
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
            <label className="block font-semibold text-gray-800 mb-3">Select Day On which you want to add files</label>
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

          {/* Time Fields */}
          <div className="mb-4">
            <label className="block font-semibold text-gray-800">AT/From</label>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md w-full" required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-gray-800">To</label>
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="px-4 py-2 border text-gray-800 border-gray-300 rounded-md w-full" required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-gray-800">Every</label>
            <input
              type="number"
              value={everyTime}
              onChange={(e) => setEveryTime(e.target.value)}
              className="px-4 py-2 border text-gray-800 border-gray-300 rounded-md w-full" required
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex">
            <button
              type="submit"
              className="w-full bg-[#005B97] text-white px-6 py-2 rounded-md"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobModal;
