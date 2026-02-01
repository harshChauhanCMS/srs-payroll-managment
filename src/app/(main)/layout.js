"use client";

import Loader from "@/components/Loader/Loader";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, getAccessToken, isTokenExpired, user } = useAuth();
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

  // Role-based route protection: redirect if user is on wrong role's area
  useEffect(() => {
    if (isCheckingAuth || !user?.role) return;

    const role = user.role;
    const isAdmin = role === "admin" || role === "super_admin";

    // Employee: no access to admin or hr management routes
    if (role === "employee") {
      if (pathname?.startsWith("/admin") || pathname?.startsWith("/hr")) {
        router.replace("/employee/dashboard");
      }
      return;
    }

    // HR: should use /hr/* only; redirect if on /admin
    if (role === "hr") {
      if (pathname?.startsWith("/admin")) {
        router.replace("/hr/dashboard");
      }
      return;
    }

    // Admin / Super Admin: use /admin/* only; redirect if on /hr
    if (isAdmin) {
      if (pathname?.startsWith("/hr")) {
        router.replace("/admin/dashboard");
      }
    }
  }, [user?.role, pathname, isCheckingAuth, router]);

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
        className={`flex flex-col flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? "lg:ml-20" : "lg:ml-64"
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
          {sidebarOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>
    </div>
  );
}
