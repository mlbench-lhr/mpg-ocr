

"use client";

import { useState, useEffect } from "react";
import { FaChevronDown, FaClock } from "react-icons/fa";
import { Job } from "../../types";
import { DatePicker } from 'rsuite';
import 'rsuite/DatePicker/styles/index.css';



interface EditJobModalProps {
    job: Job;
    onClose: () => void;
    onSubmit: (job: Job) => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ job, onClose, onSubmit }) => {
    const [selectedDays, setSelectedDays] = useState<string[]>(job.selectedDays || []);
    const [fromTime, setFromTime] = useState<string | null>(job.fromTime);
    const [toTime, setToTime] = useState<string | null>(job.toTime);
    const [everyTime, setEveryTime] = useState(job.everyTime);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableDurations, setAvailableDurations] = useState<number[]>([]);
    const [error, setError] = useState<string>("");


    const formatTime = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setFromTime(formatTime(date));
        } else {
            setFromTime(null);
        }
    };

    const handleToDateChange = (date: Date | null) => {
        if (date) {
            setToTime(formatTime(date));
        }
        else {
            setToTime(null);
        }
    };

    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    useEffect(() => {
        setSelectedDays(job.selectedDays || []);
        setFromTime(job.fromTime);
        setToTime(job.toTime);
        setEveryTime(job.everyTime);
    }, [job]);


    useEffect(() => {
        if (fromTime && toTime) {
            const startTimeInMinutes = timeToMinutes(fromTime);
            let endTimeInMinutes = timeToMinutes(toTime);

            if (endTimeInMinutes < startTimeInMinutes) {
                endTimeInMinutes += 24 * 60;
                setError("Select 'fromTime' and 'toTime' on the same day.");
                setAvailableDurations([]);
                return;
            }

            const duration = endTimeInMinutes - startTimeInMinutes;

            if (duration < 60) {
                setError("The 'To' time must be at least 1 hour after the 'From' time.");
                setAvailableDurations([]);
            } else {
                setError("");
                const maxDuration = Math.min(duration, 20);

                const durations: number[] = [];
                for (let i = 5; i <= maxDuration; i += 5) {
                    durations.push(i);
                }
                setAvailableDurations(durations);
            }
        } else {
            setError("");
            setAvailableDurations([]);
        }
    }, [fromTime, toTime, everyTime]);


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
        setIsSubmitting(true);


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

            onSubmit(updatedJob);
            onClose();
        } catch (error) {
            console.log("Error updating job:", error);
            setErrorMessage("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
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
                    <div className="flex flex-col mb-5">
                        <label htmlFor="fromTime" className="text-sm font-semibold text-gray-800">
                            AT/From
                        </label>
                        <div>
                            <div className="w-full">
                                <DatePicker
                                    value={fromTime ? new Date(`2024-01-01T${fromTime}`) : null}
                                    format="HH:mm"
                                    onChange={handleDateChange}
                                    className="w-full outline-none text-gray-800 focus:outline-none"
                                    caretAs={() => <FaClock size={16} className="text-[#005B97]" />}
                                    placeholder="Select Time"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col mb-5">
                        <label htmlFor="toTime" className="text-sm font-semibold text-gray-800">
                            To
                        </label>
                        <div>
                            <div className="w-full">
                                <DatePicker
                                    value={toTime ? new Date(`2024-01-01T${toTime}`) : null}
                                    format="HH:mm"
                                    onChange={handleToDateChange}
                                    className="w-full outline-none text-gray-800 focus:outline-none"
                                    caretAs={() => <FaClock size={16} className="text-[#005B97]" />}
                                    placeholder="Select Time"
                                />
                            </div>
                        </div>
                    </div>
                    {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
                    <div className="flex flex-col mb-5">
                        <label htmlFor="everyTime" className="text-sm font-semibold text-gray-800">
                            Every
                        </label>
                        <div className="relative">
                            <select
                                id="everyTime"
                                className="w-full px-4 py-[6px] mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
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

                    <div className="flex">
                        <button
                            type="submit"
                            className={`w-full px-6 py-2 rounded-md ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#005B97] text-white"
                                }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Updating..." : "Update Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJobModal;
