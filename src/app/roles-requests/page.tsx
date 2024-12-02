"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Page() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const handleSidebarToggle = (expanded: boolean) => {
        setIsSidebarExpanded(expanded);
    };

    return (
        <div className="flex flex-row h-screen bg-white">
            <Sidebar onToggleExpand={handleSidebarToggle} />
            <div
                className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isSidebarExpanded ? "ml-64" : "ml-24"
                    }`}
            >
            </div>
        </div>
    );
}
