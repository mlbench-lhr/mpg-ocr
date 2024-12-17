"use client";

import Sidebar from '@/app/components/Sidebar';
import Spinner from '@/app/components/Spinner';
// import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaArrowLeftLong } from "react-icons/fa6";
import { useRouter } from 'next/navigation';
import { FaCircleDot } from "react-icons/fa6";



// interface Job {
//     _id: string;
//     blNumber: string;
//     jobName: string;
//     carrier: string;
//     podDate: string;
//     deliveryDate: string;
//     podSignature: string;
//     totalQty: number;
//     delivered: number;
//     damaged: number;
//     short: number;
//     over: number;
//     refused: number;
//     noOfPages: number;
//     sealIntact: string;
//     finalStatus: string;
//     reviewStatus: string;
//     recognitionStatus: string;
//     breakdownReason: string;
//     reviewedBy: string;
//     cargoDescription: string;
//     receiverSignature: string;
//     createdAt: string;
// }

const JobDetail = () => {


    // const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    // const [userRole, setUserRole] = useState("");
    const router = useRouter();
    // const { id } = useParams();

    const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>();


    // useEffect(() => {
    //   const savedState = sessionStorage.getItem("sidebar");
    //   console.log(savedState);
    //   if (savedState) setIsSidebarExpanded(JSON.parse(savedState));
    // }, []);

    const handleSidebarStateChange = (newState: boolean) => {
        console.log("Sidebar state updated in parent:", newState);
        setIsSidebarExpanded(newState); // Update parent's state if needed
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        // const decodeJwt = (token: string) => {
        //     const base64Url = token.split(".")[1];
        //     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        //     const jsonPayload = decodeURIComponent(
        //         atob(base64)
        //             .split("")
        //             .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        //             .join("")
        //     );

        //     return JSON.parse(jsonPayload);
        // };

        // const decodedToken = decodeJwt(token);
        // setUserRole(decodedToken.role);
        setLoading(false);
    }, [router]);


    // useEffect(() => {
    //     if (id) {
    //         fetch(`/api/process-data/detail-data/${id}`)
    //             .then((res) => res.json())
    //             .then((data) => {
    //                 if (data.error) {
    //                     setError(data.error);
    //                 } else {
    //                     setJob(data);
    //                 }
    //                 setLoading(false);
    //             })
    //             .catch((err) => {
    //                 console.error("Error fetching job details:", err);
    //                 setError("Failed to fetch job details");
    //                 setLoading(false);
    //             });
    //     }
    // }, [id]);

    const handleGoBack = () => {
        router.back();
    };

    // const handleSidebarToggle = (expanded: boolean) => {
    //     setIsSidebarExpanded(expanded);
    // };




    if (loading) return <div><Spinner /></div>;
    // if (error) return <div>{error}</div>;

    return (
        <div className="flex flex-row h-screen bg-white">
            <Sidebar onStateChange={handleSidebarStateChange} />

            <div
                className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isSidebarExpanded ? "ml-64" : "ml-24"
                    }`}
            >

                <div className="bg-gray-100 py-3 flex justify-between items-center my-10 mx-5 rounded-lg px-8">
                    <div className="flex items-center gap-5">
                        <span className="text-[#005B97] cursor-pointer" onClick={handleGoBack}>
                            <FaArrowLeftLong size={30} />
                        </span>
                        <span className="text-gray-800 text-xl font-[550]">
                            123456
                        </span>
                    </div>
                    <div>
                        {/* {(userRole === "admin" || userRole === "standarduser") && (
                            <button
                                className="text-[#005B97] rounded-lg py-2 px-10 md:mt-0 w-60 md:w-auto flex items-center gap-3 cursor-pointer"
                                onClick={handleOpenModal}
                            >
                                <span>
                                    <BiSolidEditAlt className="fill-[#005B97] text-2xl" />
                                </span>
                                <span>Edit Data</span>
                            </button>
                        )} */}
                    </div>
                </div>
                <div className='mx-5'>
                    <div className="flex gap-3">
                        <div className="relative flex flex-col items-center justify-between mt-20">
                            <div className="absolute top-0 bottom-0 w-[4px] bg-gray-200 left-1/2 transform -translate-x-1/2"></div>
                            <div className="w-6  h-5 mt-0 flex items-start justify-center bg-white z-10">
                                <FaCircleDot fill={'#F59E0B'} size={25} />
                            </div>
                            <div className="w-6 h-5 flex items-end justify-center bg-white z-10">
                                <FaCircleDot fill={'#3B82F6'} size={25} />
                            </div>
                            <div className="w-6 h-5 flex items-center justify-center bg-white z-10">
                                <FaCircleDot fill={'#EF4444'} size={25} />
                            </div>
                            <div className="w-6 h-5 flex items-center justify-center bg-white z-10">
                                <FaCircleDot fill={'pink'} size={25} />
                            </div>
                        </div>
                        <table className="table-auto border-separate border-spacing-y-4 pb-0 w-full">
                            <thead className='mb-5'>
                                <tr className="text-lg text-gray-800">
                                    {/* <th className="py-2 px-4  text-start font-medium"></th> */}
                                    <th className="py-2 px-4  text-start font-medium">Field</th>
                                    <th className="py-2 px-4  text-center font-medium">Old Value</th>
                                    <th className="py-2 px-4  text-center font-medium">New Value</th>
                                    <th className="py-2 px-4  text-center font-medium">Changed On</th>
                                    <th className="py-2 px-4  text-center font-medium">Changed By</th>
                                </tr>
                            </thead>
                            <tbody className='space-y-4'>

                                <tr className="mb-4">
                                    {/* <td><FaCircleDot fill={'gray'} size={25} /></td> */}
                                    <td className="py-4 px-4 text-start mt-10 bg-[#F3F4F6] rounded-l-lg text-gray-800 font-semibold">BL Number</td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        232058679452165
                                    </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        232058679452165
                                    </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        02/28/2024 00:00:00                                </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400 rounded-r-lg">
                                        OCR Engine
                                    </td>
                                </tr>

                                <tr className="">
                                    {/* <td><MdFiberManualRecord fill={'blue'} size={25} /></td> */}
                                    <td className="py-4 px-4 text-start mt-10 bg-[#F3F4F6] rounded-l-lg text-gray-800 font-semibold">BL Number</td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        232058679452165
                                    </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        232058679452165
                                    </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        02/28/2024 00:00:00                                </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400 rounded-r-lg">
                                        OCR Engine
                                    </td>
                                </tr>

                                <tr className="">
                                    {/* <td><FaCircle fill={'red'} size={25} /></td> */}
                                    <td className="py-4 px-4 text-start mt-10 bg-[#F3F4F6] rounded-l-lg text-gray-800 font-semibold">BL Number</td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        232058679452165
                                    </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        232058679452165
                                    </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        02/28/2024 00:00:00                                </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400 rounded-r-lg">
                                        OCR Engine
                                    </td>
                                </tr>

                                <tr className="">
                                    {/* <td><BsCircleFill fill={'pink'} size={25} /></td> */}
                                    <td className="py-4 px-4 text-start mt-10 bg-[#F3F4F6] rounded-l-lg text-gray-800 font-semibold">BL Number</td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        232058679452165
                                    </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        232058679452165
                                    </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400">
                                        02/28/2024 00:00:00                                </td>
                                    <td className="py-4 px-4 text-center bg-[#F3F4F6] text-gray-400 rounded-r-lg">
                                        OCR Engine
                                    </td>
                                </tr>


                            </tbody>
                        </table>
                    </div>

                </div>

            </div>


        </div>
    );
};

export default JobDetail;
