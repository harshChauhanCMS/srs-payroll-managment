"use client";

import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { clearAuthData } from "@/utils/storage";

import { images } from "@/assets/images";
import { useRef, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSidebarItems, sidebarHeading } from "@/constants/sidebarItems";
import {
  LogoutOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  isCollapsed,
  setIsCollapsed,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebar = useRef(null);
  const { logout, user } = useAuth();

  // Get sidebar items based on user role
  const sidebarNavItems = getSidebarItems(user?.role || "customer");

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    switch (user?.role) {
      case "admin":
        return "/admin/dashboard";
      case "vendor":
        return "/vendor/dashboard";
      case "customer":
      default:
        return "/user/dashboard";
    }
  };

  // Collapse state is managed by parent and passed via props

  const isActive = (item) => {
    const childRoutes = (item.children || []).map((c) => c.link);
    const routesToMatch = [
      item.link,
      ...(item.matchRoutes || []),
      ...childRoutes,
    ].filter(Boolean);
    return routesToMatch.some((route) => pathname.startsWith(route));
  };

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = () => {
    logout();

    clearAuthData();

    toast.success("Logged out successfully");
    router.push("/");
  };

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current) return;
      if (!sidebarOpen) return;
      if (sidebar.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    // Auto-open any parent with an active child
    const initialOpen = {};
    sidebarNavItems.forEach((item) => {
      if (
        item.children &&
        item.children.some((c) => pathname.startsWith(c.link))
      ) {
        initialOpen[item.name] = true;
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...initialOpen }));
  }, [pathname]);

  return (
    <>
      <aside
        ref={sidebar}
        className={`fixed left-0 top-0 h-screen shadow-lg transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        } bg-[#1E3A5F] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col z-40`}
      >
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="p-4 flex flex-col items-center gap-2 relative">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex absolute top-5 -right-3 w-6 h-6 bg-white rounded-full items-center justify-center text-[#C2A368] shadow-md cursor-pointer"
            >
              {isCollapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
            </button>

            <Image
              src={images.vakeelLogo}
              alt="Vakeel At Home"
              width={120}
              height={120}
              onClick={() => router.push(getDashboardLink())}
              className="cursor-pointer"
            />
            {!isCollapsed && (
              <span
                className="font-bold text-lg text-[#C2A368] cursor-pointer"
                onClick={() => router.push(getDashboardLink())}
              >
                {sidebarHeading}
              </span>
            )}
          </div>

          <nav className="p-4 space-y-2 overflow-y-auto overflow-x-hidden sidebar-scroll">
            {sidebarNavItems.map((item) => {
              const hasChildren =
                Array.isArray(item.children) && item.children.length > 0;
              const active = isActive(item);
              const isOpen = openMenus[item.name];

              if (!hasChildren) {
                return (
                  <Link
                    key={item.name}
                    href={item.link}
                    prefetch={false}
                    title={isCollapsed ? item.name : undefined}
                    aria-label={isCollapsed ? item.name : undefined}
                    onClick={() => {
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`relative group flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                      active
                        ? "bg-slate-400 text-white shadow-lg"
                        : "text-white hover:bg-slate-600"
                    } ${isCollapsed && "justify-center"}`}
                  >
                    <item.icon />
                    {!isCollapsed && <span>{item.name}</span>}
                    {isCollapsed && (
                      <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-white/95 text-gray-900 shadow-lg px-3 py-1.5 text-sm ring-1 ring-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <div key={item.name} className="w-full">
                  <button
                    type="button"
                    title={isCollapsed ? item.name : undefined}
                    aria-label={isCollapsed ? item.name : undefined}
                    onClick={() => {
                      if (isCollapsed) {
                        router.push(item.link);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                        return;
                      }
                      toggleMenu(item.name);
                    }}
                    className={`relative group w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                      active
                        ? "bg-slate-400 text-white shadow-lg"
                        : "text-white hover:bg-slate-600"
                    } ${isCollapsed && "justify-center"}`}
                  >
                    <item.icon />
                    {!isCollapsed && (
                      <span className="flex-1">{item.name}</span>
                    )}
                    {!isCollapsed && hasChildren && (
                      <span className="ml-auto text-white/80">
                        {isOpen ? (
                          <CaretDownOutlined />
                        ) : (
                          <CaretRightOutlined />
                        )}
                      </span>
                    )}
                    {isCollapsed && (
                      <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-white/95 text-gray-900 shadow-lg px-3 py-1.5 text-sm ring-1 ring-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                        {item.name}
                      </span>
                    )}
                  </button>

                  {isOpen && !isCollapsed && (
                    <div className="mt-1 ml-8 space-y-1">
                      {item.children.map((child) => {
                        const childActive = pathname.startsWith(child.link);
                        return (
                          <Link
                            key={child.name}
                            href={child.link}
                            prefetch={false}
                            onClick={() => {
                              if (window.innerWidth < 1024)
                                setSidebarOpen(false);
                            }}
                            className={`block px-3 py-1.5 rounded-md text-sm ${
                              childActive
                                ? "bg-white/20 text-white"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span>• {child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div
            className={`h-px bg-white mx-auto mb-4 ${
              isCollapsed ? "w-4/5" : "w-11/12"
            }`}
          ></div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 text-white hover:text-red-400 transition-colors duration-200 cursor-pointer ${
              isCollapsed ? "justify-center" : "justify-center"
            }`}
          >
            <LogoutOutlined className="text-xl" />
            {!isCollapsed && "Log Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
