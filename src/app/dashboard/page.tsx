"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 
  const router = useRouter();

  function decodeJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
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
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p>You are not authenticated. Redirecting...</p>;
  }

  return (
    <div>
      <h1>Welcome to the Dashboard!</h1>
      <p>Your protected content goes here.</p>
    </div>
  );
}
