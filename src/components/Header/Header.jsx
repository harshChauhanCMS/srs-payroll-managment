"use client";

import Image from "next/image";

import { images } from "@/assets/images";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { LogoutOutlined, BellOutlined } from "@ant-design/icons";

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLoginClick = () => router.push("/");

  const handleLogout = () => {
    logout?.();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-10 w-full">
      {/* Glassmorphism container */}
      <div className="my-2 px-4 py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Greeting Section */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Welcome back
            </span>
            <h1 className="text-lg lg:text-xl font-bold bg-linear-to-r from-[#C2A368] to-[#E8D5B0] bg-clip-text text-transparent">
              {user?.name || "Guest"}
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* <button className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 group">
                  <BellOutlined className="text-lg text-slate-600 group-hover:text-[#C2A368] transition-colors" />

                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button> */}

                {/* <div className="h-8 w-px bg-linear-to-b from-transparent via-slate-200 to-transparent" /> */}

                <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-linear-to-r from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-50 transition-all duration-300 cursor-pointer group">
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-[#C2A368]/30 group-hover:ring-[#C2A368]/60 transition-all duration-300">
                      <Image
                        src={user?.profilePicture || images.userProfile}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">
                      {user?.name || "User"}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 group cursor-pointer"
                  title="Logout"
                >
                  <LogoutOutlined className="text-lg" />
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="px-6 py-2.5 rounded-xl bg-linear-to-r from-[#C2A368] to-[#A8894E] hover:from-[#D4B57A] hover:to-[#C2A368] text-white font-semibold text-sm shadow-lg shadow-[#C2A368]/25 hover:shadow-xl hover:shadow-[#C2A368]/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
