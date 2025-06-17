"use client";

import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextProps {
  db?: string;
}

const DBConnectionContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const DBConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [db, setDb] = useState<string>();

  useEffect(() => {
    const fetchDBType = async () => {
      const dbRes = await axios.get("/api/oracle/connection-status");
      setDb(dbRes.data.dataBase);
    };
    fetchDBType();
  }, []);

  return (
    <DBConnectionContext.Provider value={{ db }}>
      {children}
    </DBConnectionContext.Provider>
  );
};

export const useDBConnection = () => {
  const context = useContext(DBConnectionContext);
  if (!context) {
    throw new Error("DBConnection must be used within a DBConnectionProvider");
  }
  return context;
};
