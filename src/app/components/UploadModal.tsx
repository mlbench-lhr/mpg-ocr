// import { useEffect, useState } from "react";
// import axios from "axios";

// interface UploadModalProps {
//     isOpen: boolean;
//     onClose: () => void;
// }

// const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
//     const [files, setFiles] = useState<File[]>([]);
//     const [progress, setProgress] = useState<Record<string, number>>({});
//     const [uploading, setUploading] = useState<boolean>(false);

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         if (event.target.files) {
//             setFiles(Array.from(event.target.files)); // Convert FileList to an array
//             setProgress({});
//         }
//     };

//     const uploadFiles = async () => {
//         if (files.length === 0) return;
//         setUploading(true);

//         for (let file of files) {
//             const formData = new FormData();
//             formData.append("pdf_file", file);

//             try {
//                 await axios.post("https://hanneskonzept.ml-bench.com/api/upload-pdf", formData, {
//                     headers: {
//                         "Content-Type": "multipart/form-data",
//                     },
//                     onUploadProgress: (progressEvent) => {
//                         const percentCompleted = Math.round(
//                             (progressEvent.loaded * 100) / (progressEvent.total || 1)
//                         );
//                         setProgress((prev) => ({
//                             ...prev,
//                             [file.name]: percentCompleted,
//                         }));
//                     },
//                 });
//             } catch (error) {
//                 console.error(`Error uploading ${file.name}:`, error);
//             }
//         }

//         setUploading(false);
//     };

//     return isOpen ? (
//         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
//             <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//                 <h2 className="text-xl font-semibold mb-4 text-black">Upload PDFs</h2>
//                 <p className="mb-2 text-black">
//                     Select multiple pdf
//                 </p>
//                 <input type="file" multiple onChange={handleFileChange} className="mb-4 text-black" />

//                 {files.length > 0 && (
//                     <div>
//                         {files.map((file) => (
//                             <div key={file.name} className="mb-2">
//                                 <p className="text-gray-500">{file.name}</p>
//                                 {/* <progress value={progress[file.name] || 0} max="100" className="w-full rounded-full"></progress> */}
//                                 <div className="flex justify-between items-center gap-3">
//                                     <div className="w-96">
//                                         <progress
//                                             value={progress[file.name] || 0}
//                                             max="100"
//                                             className="w-full h-3 rounded-full bg-red-500 dark:bg-green-400"
//                                         ></progress>
//                                     </div>
//                                     <div className="text-[#005B97]">
//                                         {progress[file.name] || 0}%
//                                     </div>
//                                 </div>

//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 <div className="mt-4 flex justify-end">
//                     <button onClick={onClose} className="mr-2 px-4 py-2 bg-gray-400 text-white rounded-lg">Close</button>
//                     <button
//                         onClick={uploadFiles}
//                         className="px-4 py-2 bg-[#005B97] text-white rounded-lg disabled:opacity-50"
//                         disabled={uploading}
//                     >
//                         {uploading ? "Uploading..." : "Upload"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     ) : null;
// };

// export default UploadModal;
import { useEffect, useState } from "react";
import axios from "axios";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [uploading, setUploading] = useState<boolean>(false);

    // Reset files when modal opens
    useEffect(() => {
        if (isOpen) {
            clearAll();
        }
    }, [isOpen]);

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
            setProgress({});
        }
    };

    // Upload files
    const uploadFiles = async () => {
        if (files.length === 0) return;
        setUploading(true);

        for (const file of files) {
            const formData = new FormData();
            formData.append("pdf_file", file);

            try {
                await axios.post("https://hanneskonzept.ml-bench.com/api/upload-pdf", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / (progressEvent.total || 1)
                        );
                        setProgress((prev) => ({
                            ...prev,
                            [file.name]: percentCompleted,
                        }));
                    },
                });
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
            }
        }

        setUploading(false);
        clearAll(); // Clear files & progress after upload
        onClose(); // Close modal
    };

    // Clear all selected files
    const clearAll = () => {
        setFiles([]);
        setProgress({});
    };

    return isOpen ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-5 text-black text-center">Upload PDFs</h2>
                <p className="mb-2 text-black">Select multiple PDFs</p>
                <input type="file" multiple onChange={handleFileChange} className="mb-4 text-black" disabled={uploading} />

                {files.length > 0 && (
                    <div className=" h-80 overflow-y-scroll">
                        {files.map((file) => (
                            <div key={file.name} className="mb-2">
                                <p className="text-gray-500">{file.name}</p>
                                <div className="flex justify-between items-center gap-3">
                                    <div className="w-72">
                                        <progress
                                            value={progress[file.name] || 0}
                                            max="100"
                                            className="w-full h-3 rounded-full bg-red-500 dark:bg-green-400"
                                        ></progress>
                                    </div>
                                    <div className="text-[#005B97] w-10 text-center">
                                        {progress[file.name] || 0}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex justify-between">
                    {/* {files.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg"
                        >
                            Clear All
                        </button>
                    )} */}
                    <div className="flex justify-center items-center w-full">
                        {/* <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-lg">
                            Close
                        </button> */}
                        <button
                            onClick={uploadFiles}
                            className="px-4 py-2 bg-[#005B97] text-white rounded-lg disabled:opacity-50 cursor-pointer w-full"
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};

export default UploadModal;
