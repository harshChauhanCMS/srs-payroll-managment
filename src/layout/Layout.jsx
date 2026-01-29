import useOnline from "@/hooks/useOnline";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";

import { FloatButton } from "antd";
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { CloseOutlined, DoubleRightOutlined } from "@ant-design/icons";

const Layout = () => {
  const isOnline = useOnline();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    let mounted = true;

    if (!token && mounted) {
      navigate("/", { replace: true });
    }

    setIsLoading(false);

    return () => {
      mounted = false;
    };
  }, [token, navigate]);

  // Early return if no token or still loading
  if (!token || isLoading) {
    return null;
  }

  return (
    <>
      {isOnline ? (
        <div className="flex h-screen overflow-hidden scroll-smooth">
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <div
            className={`flex flex-col mx-auto flex-1 overflow-auto ${
              isCollapsed ? "lg:ml-20" : "lg:ml-64"
            }`}
          >
            <Header />
            <div className="px-5 py-3 flex-1 overflow-auto relative">
              <Outlet />
              {sidebarOpen ? (
                <FloatButton
                  icon={<CloseOutlined />}
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden custom:block"
                  style={{
                    position: "fixed",
                    bottom: "16px",
                    left: "270px",
                    zIndex: 1000,
                  }}
                />
              ) : (
                <FloatButton
                  icon={<DoubleRightOutlined />}
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden custom:block"
                  style={{
                    position: "fixed",
                    bottom: "16px",
                    left: "16px",
                    zIndex: 1000,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#f4f4f4] to-[#e0e0e0]">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-[#e0e0e0] animate-fadeIn">
            <span className="text-4xl mb-4 block animate-pulse">🔴</span>
            <h1 className="text-3xl font-semibold text-[#5c536e] mb-2">
              You’re Offline!
            </h1>
            <p className="text-lg text-[#7a6f8c] flex items-center justify-center gap-2">
              <span className="animate-bounce">⚠️</span> Please check your
              internet connection
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;
