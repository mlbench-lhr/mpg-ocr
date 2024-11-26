"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import Header from "../components/Header";

export default function MasterPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  function decodeJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const decodedToken = decodeJwt(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);

    
    setLoading(false);

  }, [router]);

  if (loading) {
    return <Spinner />;
  }


  if (!isAuthenticated) {
    return <p>Access Denied. Redirecting...</p>;
  }

  return (
    <div className="flex flex-row md:flex-row h-screen bg-white">
      <div className="my-5 ml-5">
      <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <Header
          leftContent="Jobs"
          totalContent="12"
          rightContent={
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-lg border border-gray-300"
            />
          }
          buttonContent={''}
        />
        <div className="flex-1 p-4 bg-white">
          <h1 className="text-gray-800 text-9xl">Master Content</h1>
        </div>
      </div>
    </div>
  );
}
