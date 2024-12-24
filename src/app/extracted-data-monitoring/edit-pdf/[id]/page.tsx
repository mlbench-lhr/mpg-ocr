"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeftLong } from "react-icons/fa6";
import Spinner from '@/app/components/Spinner';
import Link from 'next/link';

interface Job {
    _id: string;
    blNumber: string;
    jobName: string;
    carrier: string;
    podDate: string;
    deliveryDate: string;
    podSignature: string;
    totalQty: number;
    delivered: number;
    damaged: number;
    short: number;
    over: number;
    refused: number;
    noOfPages: number;
    sealIntact: string;
    pdfUrl: string;
    finalStatus: string;
    reviewStatus: string;
    recognitionStatus: string;
    breakdownReason: string;
    reviewedBy: string;
    cargoDescription: string;
    receiverSignature: string;
    createdAt: string;
    updatedAt: string;

}

const JobDetail = () => {
    const { id } = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        blNumber: "",
        podDate: "",
        totalQty: "",
        delivered: "",
        damaged: "",
        short: "",
        over: "",
        refused: "",
        sealIntact: "",
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>();
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const [userRole, setUserRole] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState("");


    const handleSidebarStateChange = (newState: boolean) => {
        setIsSidebarExpanded(newState);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        const decodeJwt = (token: string) => {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );

            return JSON.parse(jsonPayload);
        };

        const decodedToken = decodeJwt(token);
        setUserRole(decodedToken.role);
        setName(decodedToken.username);
        setLoading(false);
    }, [router]);

    useEffect(() => {
        if (id) {
            fetch(`/api/process-data/detail-data/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setJob(data);
                        setFormData({
                            blNumber: data.blNumber || "",
                            podDate: data.podDate || "",
                            totalQty: data.totalQty?.toString() ?? "",
                            delivered: data.delivered ?? "",
                            damaged: data.damaged ?? "",
                            short: data.short ?? "",
                            over: data.over ?? "",
                            refused: data.refused ?? "",
                            sealIntact: data.sealIntact ?? "",
                        });
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.log("Error fetching job details:", err);
                    setError("Failed to fetch job details");
                    setLoading(false);
                });
        }
    }, [id]);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const handleGoBack = () => {
        router.back();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        const numericFields = [
            "totalQty",
            "delivered",
            "damaged",
            "short",
            "over",
            "refused",
            "noOfPages",
        ];

        const nonNumericFields = [
            "blNumber",
            "carrier",
            "podSignature",
            "receiverSignature",
            "sealIntact",
        ];

        if (numericFields.includes(name)) {

            const isValidNumeric = /^(0|[1-9][0-9]{0,4})$/.test(value) || value === "";

            if (isValidNumeric) {
                setFormData((prev) => ({
                    ...prev,
                    [name]: value,
                }));
            }
        } else if (nonNumericFields.includes(name)) {



            const isValidNonNumeric =
                value === "" ||
                (/^[a-zA-Z0-9_]+(\s[a-zA-Z0-9_]+)*$/.test(value) && !/^\s/.test(value) && !/^0+$/.test(value));

            if (isValidNonNumeric) {
                setFormData((prev) => ({
                    ...prev,
                    [name]: value,
                }));
            }
        } else {

            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const capitalizeFirstLetter = (str: string): string => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const handleSave = async () => {
        setSaving(true);
        try {

            const formattedReviewedBy = capitalizeFirstLetter(name);

            const response = await fetch(`/api/process-data/detail-data/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-name": formattedReviewedBy,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setIsEditMode(false);
            } else {
                setIsEditMode(false);
                setSaving(false);
            }
        } catch (error) {
            console.log("Error saving data:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleEditClick = () => {
        setIsEditMode(true);
    };

    if (loading) return <div><Spinner /></div>;
    if (error) return <div>{error}</div>;
    if (!job) return <div><Spinner /></div>;

    return (
        <div className="flex flex-row h-screen bg-white">
            <Sidebar onStateChange={handleSidebarStateChange} />
            <div
                className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isSidebarExpanded ? "ml-64" : "ml-24"}`}
            >
                <div className="bg-gray-100 py-4 flex justify-between items-center my-10 mx-5 rounded-lg px-8">
                    <div className="flex items-center gap-5">
                        <span className="text-[#005B97] cursor-pointer" onClick={handleGoBack}>
                            <FaArrowLeftLong size={30} />
                        </span>
                        <span className="text-gray-800 text-xl font-[550]">
                            {job.blNumber}
                        </span>
                    </div>
                    <div>
                        <Link href={job.pdfUrl} target='_blank'>
                            <button
                                className="bg-[#005B97] rounded-lg py-2 px-10 text-white md:mt-0 w-60 md:w-auto"
                            >
                                View Pdf
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="mx-5 flex bg-white pt-3 h-5/6">

                    <div className="flex-auto xl:h-[calc(142vh-6rem)] 2xl:h-screen bg-white relative">

                        {isLoading && (
                            <div className="absolute inset-0 flex items-start justify-center mt-10 bg-white z-10">
                                <div className="loader text-gray-800">Loading...</div>
                            </div>
                        )}


                        <iframe
                            src={`${job.pdfUrl}#toolbar=0`}
                            className="w-11/12 h-full bg-white"
                            loading="lazy"
                            onLoad={handleIframeLoad}
                        />
                    </div>


                    <div className="flex-1 bg-gray-100 rounded-xl p-6 flex flex-col  xl:h-[calc(160vh-6rem)] 2xl:h-[calc(120vh-6rem)]">
                        <div className='flex justify-between items-center mb-4'>
                            <span>
                                <h3 className="text-xl font-medium text-gray-800">Extracted Data</h3>
                            </span>
                            <span>
                                {(userRole === "admin" || userRole === "standarduser") && (
                                    <button
                                        className={`text-[#005B97] underline ${isEditMode ? "text-blue-300" : ""}`}
                                        onClick={handleEditClick}
                                        disabled={isEditMode}
                                    >
                                        Edit Data
                                    </button>
                                )}

                            </span>
                        </div>
                        <form className="space-y-10 flex-1 overflow-y-auto">
                            {Object.keys(formData).map((key) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-3 bg-white px-2 border-l-8 border-[#005B97] rounded-lg py-[7px]"
                                >
                                    <label className="font-medium text-gray-500 capitalize w-32">
                                        {key.replace(/([A-Z])/g, " $1")} :
                                    </label>
                                    <input
                                        type={key === "podDate" ? "date" : "text"}
                                        name={key}
                                        value={formData[key as keyof typeof formData]}
                                        onChange={handleChange}
                                        disabled={!isEditMode}
                                        className="p-2 text-gray-800 border-none focus:outline-none w-full"
                                    />
                                </div>
                            ))}
                        </form>

                        {isEditMode && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="w-full bg-[#005B97] text-white font-medium py-3 rounded-lg hover:bg-[#2772a3] mt-auto"
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
