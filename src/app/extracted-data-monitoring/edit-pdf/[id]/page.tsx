// "use client";

// import { useState, useEffect } from 'react';
// import Sidebar from '@/app/components/Sidebar';
// import { useParams, useRouter } from 'next/navigation';
// import { FaArrowLeftLong } from "react-icons/fa6";
// import Spinner from '@/app/components/Spinner';
// import { useSidebar } from "../../../context/SidebarContext";
// import Link from 'next/link';
// import { ObjectId } from "mongodb";

// interface Job {
//     _id: ObjectId;
//     pdfUrl: string;
//     blNumber: string;
//     jobName: string;
//     podDate: string;
//     deliveryDate: Date;
//     podSignature: string;
//     totalQty: number;
//     received: number;
//     damaged: number;
//     short: number;
//     over: number;
//     refused: number;
//     noOfPages: number;
//     stampExists: string;
//     sealIntact: string;
//     finalStatus: string;
//     reviewStatus: string;
//     recognitionStatus: string;
//     breakdownReason: string;
//     reviewedBy: string;
//     cargoDescription: string;
//     createdAt: string;
//     updatedAt?: string;
// }

// const JobDetail = () => {
//     const { id } = useParams();
//     const [job, setJob] = useState<Job | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [formData, setFormData] = useState({
//         blNumber: "",
//         podDate: "",
//         totalQty: "",
//         received: "",
//         damaged: "",
//         short: "",
//         over: "",
//         refused: "",
//         stampExists: "",
//         sealIntact: "",
//     });
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [saving, setSaving] = useState(false);
//     const router = useRouter();
//     const [userRole, setUserRole] = useState("");
//     const [isLoading, setIsLoading] = useState(true);
//     const [name, setName] = useState("");

//     const { isExpanded } = useSidebar();

//     const handleSidebarStateChange = (newState: boolean) => {
//         // setIsSidebarExpanded(newState);
//         return newState;
//     };

//     const isSupportedFormat = (fileName: string) => {
//         const ext = fileName.toLowerCase().split(".").pop();
//         return ["pdf", "jpg", "jpeg", "png", "bmp"].includes(ext || "");
//     };

//     const formatDateForInput = (dateStr: string | null) => {
//         if (!dateStr) return "";

//         const parts = dateStr.split("/");
//         if (parts.length < 2) return "";

//         const [month, day, rawYear] = [...parts, "2024"].slice(0, 3);

//         let year = rawYear;
//         if (year.length === 2) {
//             const currentYear = new Date().getFullYear();
//             const century = Math.floor(currentYear / 100) * 100;
//             year = (parseInt(year, 10) + century).toString();
//         }

//         return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
//     };

//     const formatDateForDB = (dateStr: string) => {
//         if (!dateStr) return "";
//         const [year, month, day] = dateStr.split("-");
//         return `${month}/${day}/${year.slice(-2)}`;
//     };

//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (!token) {
//             router.push("/login");
//             return;
//         }
//         const decodeJwt = (token: string) => {
//             const base64Url = token.split(".")[1];
//             const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//             const jsonPayload = decodeURIComponent(
//                 atob(base64)
//                     .split("")
//                     .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//                     .join("")
//             );

//             return JSON.parse(jsonPayload);
//         };
//         const decodedToken = decodeJwt(token);
//         setUserRole(decodedToken.role);

//         setName(decodedToken.username);

//     }, [router]);

//     useEffect(() => {
//         if (id) {
//             setLoading(true);

//             fetch(`/api/process-data/detail-data/${id}`)
//                 .then((res) => res.json())
//                 .then((data) => {
//                     if (data.error) {
//                         setError(data.error);
//                     } else {
//                         setJob(data);
//                         setFormData({
//                             blNumber: data.blNumber || "",
//                             podDate: formatDateForInput(data.podDate || ""),
//                             totalQty: data.totalQty?.toString() ?? "",
//                             received: data.received ?? "",
//                             damaged: data.damaged ?? "",
//                             short: data.short ?? "",
//                             over: data.over ?? "",
//                             refused: data.refused ?? "",
//                             stampExists: data.stampExists ?? "",
//                             sealIntact: data.sealIntact ?? "",
//                         });
//                         setLoading(false);
//                     }
//                     setLoading(false);
//                 })
//                 .catch((err) => {
//                     console.log("Error fetching job details:", err);
//                     setError("Failed to fetch job details");
//                     setLoading(false);
//                 });
//         }
//     }, [id]);

//     const handleIframeLoad = () => {
//         setIsLoading(false);
//     };

//     const handleGoBack = () => {
//         router.back();
//     };

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;


//         const nonNumericFields = [
//             "blNumber",
//             "totalQty",
//             "received",
//             "damaged",
//             "short",
//             "over",
//             "refused",
//             "stampExists",
//             "sealIntact",
//         ];

//         if (name === "podDate") {
//             setFormData((prev) => ({
//                 ...prev,
//                 podDate: value,
//             }));
//             return;
//         }


//         if (nonNumericFields.includes(name)) {

//             const isValidNonNumeric =
//                 value === "" ||
//                 (/^[a-zA-Z0-9_]+(\s[a-zA-Z0-9_]+)*$/.test(value) && !/^\s/.test(value) && !/^0+$/.test(value));
//             if (isValidNonNumeric) {
//                 setFormData((prev) => ({
//                     ...prev,
//                     [name]: value,
//                 }));
//             }
//         } else {

//             setFormData((prev) => ({
//                 ...prev,
//                 [name]: value,
//             }));
//         }
//     };

//     const capitalizeFirstLetter = (str: string): string => {
//         return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
//     };

//     const handleSave = async () => {
//         setSaving(true);
//         try {

//             const formattedReviewedBy = capitalizeFirstLetter(name);

//             const formattedData = {
//                 ...formData,
//                 podDate: formatDateForDB(formData.podDate),
//             };

//             const response = await fetch(`/api/process-data/detail-data/${id}`, {
//                 method: "PATCH",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "x-user-name": formattedReviewedBy,
//                 },
//                 body: JSON.stringify(formattedData),
//             });

//             if (response.ok) {
//                 setIsEditMode(false);
//             } else {
//                 setIsEditMode(false);
//                 setSaving(false);
//             }
//         } catch (error) {
//             console.log("Error saving data:", error);
//         } finally {
//             setSaving(false);
//         }
//     };

//     const handleEditClick = () => {
//         setIsEditMode(true);
//     };

//     const keyMappings: Record<string, string> = {
//         totalQty: "Issued Qty",
//         received: "Received Qty",
//         damaged: "Damaged Qty",
//         short: "Short Qty",
//         over: "Over Qty",
//         refused: "Refused Qty",
//     };


//     if (!job) return <>{error}</>;

//     const fileName = job.pdfUrl.split("/").pop();

//     return (
//         <div className="flex flex-row h-screen bg-white">
//             <Sidebar onStateChange={handleSidebarStateChange} />
//             <div
//                 className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isExpanded ? "ml-64" : "ml-24"}`}
//             >
//                 <div className="bg-gray-100 py-4 flex justify-between items-center my-10 mx-5 rounded-lg px-8">
//                     <div className="flex items-center gap-5">
//                         <span className="text-[#005B97] cursor-pointer" onClick={handleGoBack}>
//                             <FaArrowLeftLong size={30} />
//                         </span>
//                         <span className="text-gray-800 text-xl font-[550]">
//                             {job.blNumber}
//                         </span>
//                     </div>
//                     <div>


//                         <Link href={`/api/access-file?filename=${fileName}`} target="_blank" rel="noopener noreferrer">
//                             <button className="bg-[#005B97] rounded-lg py-2 px-10 text-white md:mt-0 w-60 md:w-auto">
//                                 View Pdf
//                             </button>
//                         </Link>

//                         {/* <Link href={job.pdfUrl} target='_blank'>
//                             <button
//                                 className="bg-[#005B97] rounded-lg py-2 px-10 text-white md:mt-0 w-60 md:w-auto"
//                             >
//                                 View Pdf
//                             </button>
//                         </Link> */}
//                     </div>
//                 </div>
//                 {loading ? <Spinner /> :
//                     <>
//                         <div className="mx-5 flex bg-white pt-3 h-5/6">
//                             <div className="flex-auto xl:h-[calc(143vh-6rem)] 2xl:h-screen bg-white relative">

//                                 {isLoading && (
//                                     <div className="absolute inset-0 flex items-start justify-center mt-10 bg-white z-10">
//                                         <div className="loader text-gray-800">Loading...</div>
//                                     </div>
//                                 )}

//                                 {fileName && isSupportedFormat(fileName) ? (
//                                     <iframe
//                                         src={`/api/access-file?filename=${fileName}#toolbar=0`}
//                                         className="w-11/12 h-full bg-white"
//                                         loading="lazy"
//                                         onLoad={handleIframeLoad}
//                                     />
//                                 ) : (
//                                     <div className="text-center text-red-500">
//                                         Preview not available or filename is missing.
//                                     </div>
//                                 )}

//                                 {/* <iframe
//                                     // src={`${job.pdfUrl}#toolbar=0`}
//                                     src={`/api/access-file?filename=${fileName}#toolbar=0`}
//                                     className="w-11/12 h-full bg-white"
//                                     loading="lazy"
//                                     onLoad={handleIframeLoad}
//                                 /> */}
//                             </div>
//                             <div className="flex-1 bg-gray-100 rounded-xl p-6 flex flex-col  xl:h-[calc(170vh-6rem)] 2xl:h-[calc(130vh-6rem)]">
//                                 <div className='flex justify-between items-center mb-4'>
//                                     <span>
//                                         <h3 className="text-xl font-medium text-gray-800">Extracted Data</h3>
//                                     </span>
//                                     <span>
//                                         {(userRole === "admin" || userRole === "standarduser") && (
//                                             <button
//                                                 className={`text-[#005B97] underline ${isEditMode ? "text-blue-300" : ""}`}
//                                                 onClick={handleEditClick}
//                                                 disabled={isEditMode}
//                                             >
//                                                 Edit Data
//                                             </button>
//                                         )}

//                                     </span>
//                                 </div>
//                                 <form className="space-y-10 flex-1 overflow-y-auto">
//                                     {Object.keys(formData).map((key) => (
//                                         <div
//                                             key={key}
//                                             className="flex items-center gap-3 bg-white px-2 border-l-8 border-[#005B97] rounded-lg py-[7px]"
//                                         >
//                                             {/* <label className="font-medium text-gray-500 capitalize min-w-28">
//                                                 {key.replace(/([A-Z])/g, " $1")} :
//                                             </label> */}
//                                             <label className="font-medium text-gray-500 capitalize min-w-28">
//                                                 {keyMappings[key] || key.replace(/([A-Z])/g, " $1")} :
//                                             </label>
//                                             <input
//                                                 // type={key === "podDate" ? "date" : "text"}
//                                                 type={"text"}

//                                                 name={key}
//                                                 value={formData[key as keyof typeof formData]}
//                                                 onChange={handleChange}
//                                                 disabled={!isEditMode}
//                                                 className="p-2 text-gray-800 border-none focus:outline-none w-full"
//                                             />
//                                         </div>
//                                     ))}
//                                 </form>

//                                 {isEditMode && (
//                                     <>
//                                         <button
//                                             type="button"
//                                             onClick={handleSave}
//                                             className="w-full bg-[#005B97] text-white font-medium py-3 rounded-lg hover:bg-[#2772a3] mt-auto"
//                                             disabled={saving}
//                                         >
//                                             {saving ? "Saving..." : "Save Changes"}
//                                         </button>
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     </>
//                 }

//             </div>
//         </div>
//     );
// };

// export default JobDetail;






"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeftLong } from "react-icons/fa6";
import Spinner from '@/app/components/Spinner';
import { useSidebar } from "../../../context/SidebarContext";
import Link from 'next/link';
import { FileData, FileDataProps } from '@/lib/FileData';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState<FileDataProps | null>(null);
  const [formData, setFormData] = useState<FileDataProps>(new FileData(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [openedViaButton, setOpenedViaButton] = useState(false);



  const { isExpanded } = useSidebar();
  const router = useRouter();

  const handleSidebarStateChange = (newState: boolean) => newState;

  const editableFields: (keyof FileDataProps)[] = [
    "OCR_BOLNO",
    "OCR_STMP_POD_DTT",
    "OCR_ISSQTY",
    "OCR_RCVQTY",
    "OCR_SYMT_DAMG",
    "OCR_SYMT_SHRT",
    "OCR_SYMT_ORVG",
    "OCR_SYMT_REFS",
    "OCR_SYMT_NONE",
    "OCR_SYMT_SEAL"
  ];

  const isSupportedFormat = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop();
    return ["pdf", "jpg", "jpeg", "png", "bmp"].includes(ext || "");
  };

  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length < 2) return "";
    const [month, day, rawYear] = [...parts, "2024"].slice(0, 3);
    let year = rawYear;
    if (year.length === 2) {
      const currentYear = new Date().getFullYear();
      const century = Math.floor(currentYear / 100) * 100;
      year = (parseInt(year, 10) + century).toString();
    }
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const formatDateForDB = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year.slice(-2)}`;
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
  }, [router]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/process-data/detail-data/${id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Data PDF ->",data)
          if (data.error) {
            setError(data.error);
          } else {
            const cleanData = FileData.fromPartial(data);
            setJob(cleanData);
            setFormData({
              ...cleanData,
              OCR_STMP_POD_DTT: formatDateForInput(cleanData.OCR_STMP_POD_DTT || "")
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

  const handleIframeLoad = () => setIsLoading(false);

  const handleGoBack = () => router.back();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formattedReviewedBy = capitalizeFirstLetter(name);
      const formattedData = {
        ...formData,
        reviewedBy: formattedReviewedBy,
        OCR_STMP_POD_DTT: formatDateForDB(formData.OCR_STMP_POD_DTT || ""),
      };
      const response = await fetch(`/api/process-data/detail-data/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
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

  const handleEditClick = () => setIsEditMode(true);

  const keyMappings: Record<string, string> = {
    OCR_BOLNO: "BL Number",
    pdfUrl: "Uploaded File",
    jobName: "Job Name",
    OCR_STMP_POD_DTT: "POD Date",
    OCR_SYMT_NONE: "Stamp Exists",
    OCR_STMP_SIGN: "Signature Exists",
    OCR_SYMT_SEAL: "Seal Intact",
    OCR_ISSQTY: "Issued Qty",
    OCR_RCVQTY: "Received Qty",
    OCR_SYMT_DAMG: "Damaged Qty",
    OCR_SYMT_SHRT: "Short Qty",
    OCR_SYMT_ORVG: "Over Qty",
    OCR_SYMT_REFS: "Refused Qty",
    customerOrderNum: "Customer Order Num",
    finalStatus: "Final Status",
    reviewStatus: "Review Status",
    recognitionStatus: "Recognition Status",
    breakdownReason: "Breakdown Reason",
    reviewedBy: "Reviewed By",
  };

  
  

  if (!job) return <>{error}</>;

  const fileName = job.pdfUrl.split("/").pop();

  const handleViewPdf = () => {
    setOpenedViaButton(true); // Disable iframe if button is used
  
    try {
      if (!job?.FILE_DATA) {
        alert("No PDF data found");
        return;
      }
  
      const byteCharacters = atob(job.FILE_DATA);
      const byteArray = new Uint8Array(
        Array.from(byteCharacters, c => c.charCodeAt(0))
      );
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setOpenedViaButton(false); 
    } catch (error) {
      console.error("Error opening PDF:", error);
      alert("Could not open PDF.");
    }
  };
  
  
  
  

  return (
    <div className="flex flex-row h-screen bg-white">
      <Sidebar onStateChange={handleSidebarStateChange} />
      <div className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isExpanded ? "ml-64" : "ml-24"}`}>
        <div className="bg-gray-100 py-4 flex justify-between items-center my-10 mx-5 rounded-lg px-8">
          <div className="flex items-center gap-5">
            <span className="text-[#005B97] cursor-pointer" onClick={handleGoBack}>
              <FaArrowLeftLong size={30} />
            </span>
            <span className="text-gray-800 text-xl font-[550]">{job.OCR_BOLNO}</span>
          </div>
          <div>
          <button
  onClick={handleViewPdf}
  className="bg-[#005B97] rounded-lg py-2 px-10 text-white md:mt-0 w-60 md:w-auto"
>
  View Pdf
</button>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="mx-5 flex bg-white pt-3 h-5/6">
            <div className="flex-auto xl:h-[calc(143vh-6rem)] 2xl:h-screen bg-white relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-start justify-center mt-10 bg-white z-10">
                  <div className="loader text-gray-800">Loading...</div>
                </div>
              )}
              {!openedViaButton && fileName && isSupportedFormat(fileName) ? (
                <iframe
                src={`data:application/pdf;base64,${job.FILE_DATA}#toolbar=0`}
                className="w-11/12 h-full bg-white"
                loading="lazy"
                onLoad={handleIframeLoad}
              />
              ) : (
                <div className="text-center text-red-500">
                  Preview not available or filename is missing.
                </div>
              )}
            </div>
            <div className="flex-1 bg-gray-100 rounded-xl p-6 flex flex-col xl:h-[calc(170vh-6rem)] 2xl:h-[calc(130vh-6rem)]">
              <div className='flex justify-between items-center mb-4'>
                <h3 className="text-xl font-medium text-gray-800">Extracted Data</h3>
                {(userRole === "admin" || userRole === "standarduser") && (
                  <button
                    className={`text-[#005B97] underline ${isEditMode ? "text-blue-300" : ""}`}
                    onClick={handleEditClick}
                    disabled={isEditMode}
                  >
                    Edit Data
                  </button>
                )}
              </div>
              <form className="space-y-10 flex-1 overflow-y-auto">
                {editableFields.map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 bg-white px-2 border-l-8 border-[#005B97] rounded-lg py-[7px]"
                  >
                    <label className="font-medium text-gray-500 capitalize min-w-28">
                      {keyMappings[key] || key.replace(/([A-Z])/g, " $1")} :
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={formData[key] as string}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className="p-2 text-gray-800 border-none focus:outline-none w-full"
                    />
                  </div>
                ))}
              </form>

              {isEditMode && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full bg-[#005B97] text-white font-medium py-3 rounded-lg hover:bg-[#2772a3] mt-auto"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
