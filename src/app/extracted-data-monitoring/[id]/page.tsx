"use client";

import Sidebar from '@/app/components/Sidebar';
import { format } from 'date-fns';
import Spinner from '@/app/components/Spinner';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaArrowLeftLong } from "react-icons/fa6";
import { useRouter } from 'next/navigation';


// Define the Job type
interface Job {
    _id: string;
    blNumber: string;
    carrier: string;
    podDate: string;
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
    cargoDescription: string;
    receiverSignature: string;
    createdAt: string;
}

const JobDetail = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const { id } = useParams(); // Use useParams to get the dynamic ID from the URL
    const [job, setJob] = useState<Job | null>(null); // Explicitly type as Job or null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();


    // Fetch job details after the component has mounted and the id is available
    useEffect(() => {
        if (id) {
            // Fetch job details using the API route
            fetch(`/api/process-data/detail-data/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error); // Set error if the job is not found
                    } else {
                        setJob(data); // Set the job data if fetched successfully
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching job details:", err);
                    setError("Failed to fetch job details");
                    setLoading(false);
                });
        }
    }, [id]);

    const handleGoBack = () => {
        router.back();
    };

    // Handle sidebar toggle
    const handleSidebarToggle = (expanded: boolean) => {
        setIsSidebarExpanded(expanded);
    };

    if (loading) return <div><Spinner /></div>;
    if (error) return <div>{error}</div>;
    if (!job) return <div>Job not found</div>;

    return (

        <div className="flex flex-row h-screen bg-white">
            <Sidebar onToggleExpand={handleSidebarToggle} />
            <div
                className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isSidebarExpanded ? "ml-64" : "ml-24"
                    }`}
            >
                <div className='bg-gray-100 py-4 flex items-center gap-5 my-10 mx-5 rounded-lg px-8'>
                    <span className='text-[#005B97] cursor-pointer' onClick={handleGoBack}>
                        <FaArrowLeftLong size={30} />
                    </span>
                    <span className='text-gray-800 text-xl font-[550]'>
                        {job.blNumber}
                    </span>
                </div>

                <div className='mx-5'>
                    <h1 className='text-3xl text-gray-800 font-semibold mb-5'>Shipment Information</h1>

                    {/* First Row */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 my-5'>
                        <div className='flex items-center gap-5'>
                            <span className='text-xl text-gray-800 font-semibold'>Created On</span>
                            <span className='text-xl text-gray-400 font-medium'>
                                {job.createdAt ? format(new Date(job.podDate), 'dd/MM/yyyy') : 'N/A'}
                            </span>
                        </div>
                        <div className='flex items-center gap-5'>
                            <span className='text-xl text-gray-800 font-semibold'>Delivery Date</span>
                            <span className='text-xl text-gray-400 font-medium'>
                                {job.podDate ? format(new Date(job.podDate), 'dd/MM/yyyy') : 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Second Row */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 my-5'>
                        <div className='flex items-center gap-5'>
                            <span className='text-xl text-gray-800 font-semibold'>Final Status</span>
                            <span className='text-xl text-[#005B97] font-medium bg-blue-100 py-1 px-4 rounded-3xl'>
                                {job.finalStatus}
                            </span>
                        </div>
                        <div className='flex items-center gap-5'>
                            <span className='text-xl text-gray-800 font-semibold'>Review Status</span>
                            <span className='text-xl text-green-600 font-medium bg-green-100 py-1 px-4 rounded-3xl'>
                                {job.reviewStatus}
                            </span>
                        </div>
                        <div className='flex items-center gap-5'>
                            <span className='text-xl text-gray-800 font-semibold'>Recognition Status</span>
                            <span className='text-xl text-yellow-600 font-medium bg-yellow-100 py-1 px-4 rounded-3xl'>
                                {job.recognitionStatus}
                            </span>
                        </div>
                    </div>

                    {/* Cargo Description */}
                    <div className='flex flex-col my-5'>
                        <h1 className='text-xl text-gray-800 font-semibold mb-3'>Cargo Description</h1>
                        <div className='text-gray-400 text-lg text-justify'>{job.cargoDescription}</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default JobDetail;
