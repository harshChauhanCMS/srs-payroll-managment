"use client";

import Loader from "@/components/Loader/Loader";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Close, Menu } from "@mui/icons-material";

export default function MainLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, getAccessToken, isTokenExpired } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated || !getAccessToken() || isTokenExpired()) {
        router.replace("/");
      } else {
        setIsCheckingAuth(false);
      }
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, getAccessToken, isTokenExpired, router]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden hydrated antialiased bg-white">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div
        className={`flex flex-col flex-1 overflow-auto transition-all duration-300 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="p-4">
          <Header />
        </div>
        <main className="p-4">{children}</main>
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="fixed lg:hidden top-4.5 left-5 z-50 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#366598]"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <Close /> : <Menu />}
        </button>
      </div>
    </div>
  );
}
