"use client";

import { useState } from "react";
import { format } from "date-fns";
import { IoCalendar } from "react-icons/io5";

interface Job {
    _id: string;
    blNumber: string;
    jobName: string;
    createdAt: string;
    podDate: string;
    cargoDescription: string;
    carrier: string;
    podSignature: string;
    totalQty: number;
    delivered: number;
    damaged: number;
    short: number;
    over: number;
    refused: number;
    noOfPages: number;
    sealIntact: string;
    finalStatus: string;
    reviewStatus: string;
    recognitionStatus: string;
    breakdownReason: string;
    reviewedBy: string;
    receiverSignature: string;
}

interface EditModalProps {
    job: Job;
    onClose: () => void;
    onUpdate: (updatedJob: Job) => void;
}

const EditModal: React.FC<EditModalProps> = ({ job, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        createdAt: format(new Date(job.createdAt), "yyyy-MM-dd"),
        podDate: format(new Date(job.podDate), "yyyy-MM-dd"),
        cargoDescription: job.cargoDescription,
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate the form inputs if needed
        if (!formData.cargoDescription.trim()) {
            setErrorMessage("Cargo description is required.");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const updatedJob: Job = {
                ...job,
                createdAt: new Date(formData.createdAt).toISOString(),
                podDate: new Date(formData.podDate).toISOString(),
                cargoDescription: formData.cargoDescription,
            };

            // Simulate API or async operation (remove if unnecessary)
            await new Promise((resolve) => setTimeout(resolve, 1000));

            onUpdate(updatedJob); // Call parent update function
            onClose(); // Close the modal
        } catch (error) {
            console.error("Error updating job:", error);
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
                <h2 className="text-2xl text-center text-gray-800 font-bold mb-4">Edit Shipment</h2>

                <form onSubmit={handleFormSubmit}>
                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mb-4 text-red-600 font-medium text-center">
                            {errorMessage}
                        </div>
                    )}

                    {/* Created At */}
                    <div className="mb-4">
                        <label className="block font-semibold text-gray-800 mb-3">Created On</label>
                        <div className="relative">
                            <input
                                id="createdAt"
                                type="date"
                                name="createdAt"
                                value={formData.createdAt}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 mt-1 pr-10 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005B97] custom-date-input"
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                onClick={() => {
                                    const createdAtInput = document.getElementById('createdAt') as HTMLInputElement;
                                    if (createdAtInput) {
                                        createdAtInput.showPicker();
                                    }
                                }}
                            >
                                <IoCalendar size={20} className="text-[#005B97]" />
                            </button>
                        </div>
                    </div>

                    {/* POD Date */}
                    <div className="mb-4">
                        <label className="block font-semibold text-gray-800 mb-3">Delivery Date</label>
                        <div className="relative">
                            <input
                                id="podDate"
                                type="date"
                                name="podDate"
                                value={formData.podDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 mt-1 pr-10 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005B97] custom-date-input"
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                onClick={() => {
                                    const podDateInput = document.getElementById('podDate') as HTMLInputElement;
                                    if (podDateInput) {
                                        podDateInput.showPicker();
                                    }
                                }}
                            >
                                <IoCalendar size={20} className="text-[#005B97]" />
                            </button>
                        </div>
                    </div>

                    {/* Cargo Description */}
                    <div className="mb-4">
                        <label className="block font-semibold text-gray-800 mb-3">Cargo Description</label>
                        <textarea
                            name="cargoDescription"
                            value={formData.cargoDescription}
                            onChange={handleInputChange}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md w-full"
                            rows={5}
                            required
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 mt-10">
                        <button
                            type="submit"
                            className={`w-full px-6 py-2 rounded-md ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#005B97] text-white'
                                }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default EditModal;
