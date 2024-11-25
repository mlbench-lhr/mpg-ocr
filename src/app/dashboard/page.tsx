"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [dbConnectionValid, setDbConnectionValid] = useState(false);
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

    // If no token, redirect to login page
    if (!token) {
      router.push("/login");
      return;
    }

    const decodedToken = decodeJwt(token);
    const currentTime = Date.now() / 1000;

    // If token is expired, remove it and redirect to login page
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);

    // Check the DB connection status
    fetch("/api/auth/db-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.dbConnected) {
          setDbConnectionValid(true);
        } else {
          router.push("/db-connection"); // Redirect to DB connection page
        }
      })
      .catch(() => {
        router.push("/db-connection"); // If error occurs, redirect to DB connection page
      })
      .finally(() => setLoading(false));

  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated || !dbConnectionValid) {
    // This shouldn't be shown because redirects are handled, but keep it as a fallback.
    return <p>Access Denied. Redirecting...</p>;
  }

  return (
    <div>
      <h1>Welcome to the Dashboard!</h1>
      <p>Your protected content goes here.</p>
    </div>
  );
}
