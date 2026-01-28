"use client";

import Image from "next/image";

import { images } from "@/assets/images";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handleLoginClick = () => router.push("/");

  return (
    <div className="w-full mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-6">
      {/* Greeting */}
      <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-[#C2A368] leading-snug">
        Hi, {user?.fullName || "User"}
      </h1>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-100">
              <Image
                src={user?.profilePicture || images.userProfile}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-medium text-sm sm:text-base text-slate-800">
              {user?.fullName || "User"}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="simple-button text-sm px-3 py-1 sm:px-4 sm:py-2"
              onClick={handleLoginClick}
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
