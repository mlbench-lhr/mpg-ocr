import { useState, useEffect } from "react";

interface Job {
    _id: string;
    selectedDays: string[];
    fromTime: string;
    toTime: string;
    everyTime: string;
    active: boolean;
}

interface EditJobModalProps {
    job: Job;
    onClose: () => void;
    onSubmit: (job: Job) => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ job, onClose, onSubmit }) => {
    // Ensure `selectedDays` is initialized to an empty array if not provided
    const [selectedDays, setSelectedDays] = useState<string[]>(job.selectedDays || []);
    const [fromTime, setFromTime] = useState(job.fromTime);
    const [toTime, setToTime] = useState(job.toTime);
    const [everyTime, setEveryTime] = useState(job.everyTime);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Sync state when job data changes (if it changes)
        setSelectedDays(job.selectedDays || []);
        setFromTime(job.fromTime);
        setToTime(job.toTime);
        setEveryTime(job.everyTime);
    }, [job]);

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

        if (fromTime === toTime) {
            setErrorMessage('"From" time and "To" time cannot be the same.');
            return;
        }

        setErrorMessage("");

        const updatedJob: Job = { _id: job._id, selectedDays, fromTime, toTime, everyTime, active: job.active };

        try {
            const response = await fetch(`/api/jobs/edit/${job._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedJob),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.error || "Failed to update job.");
                return;
            }

            const responseData = await response.json();
            console.log("Job updated successfully:", responseData);

            onSubmit(updatedJob); // Pass the updated job data to parent
            onClose(); // Close the modal
        } catch (error) {
            console.error("Error updating job:", error);
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
                <h2 className="text-2xl text-center text-gray-800 font-bold mb-4">Edit Job</h2>
                <form onSubmit={handleFormSubmit}>
                    {errorMessage && (
                        <div className="mb-4 text-red-600 font-medium text-center">
                            {errorMessage}
                        </div>
                    )}

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

                    <div className="mb-4">
                        <label className="block font-semibold text-gray-800">From Time</label>
                        <input
                            type="time"
                            value={fromTime}
                            onChange={(e) => setFromTime(e.target.value)}
                            className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md w-full"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-semibold text-gray-800">To Time</label>
                        <input
                            type="time"
                            value={toTime}
                            onChange={(e) => setToTime(e.target.value)}
                            className="px-4 py-2 border text-gray-800 border-gray-300 rounded-md w-full"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-semibold text-gray-800">Every</label>

                        {/* If you want to allow editing with a dropdown */}
                        <select
                            value={everyTime}
                            onChange={(e) => setEveryTime(e.target.value)}
                            className="px-4 py-2 border text-gray-800 border-gray-300 rounded-md w-full"
                            required
                        >
                            <option value="">Select Time</option>
                            <option value="20">20 Mins</option>
                            <option value="40">40 Mins</option>
                            <option value="60">60 Mins</option>
                            <option value="80">80 Mins</option>
                            <option value="100">100 Mins</option>
                            <option value="120">120 Mins</option>
                        </select>
                    </div>


                    <div className="flex">
                        <button
                            type="submit"
                            className="w-full bg-[#005B97] text-white px-6 py-2 rounded-md"
                        >
                            Update Job
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJobModal;
