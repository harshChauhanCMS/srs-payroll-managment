"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";

export default function BackHeader({ label, href, rightContent }) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
      return;
    }
    router.back();
  };

  return (
    <div className="w-full flex items-center justify-between mb-6">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 text-[#121212] hover:text-[#366598] transition-colors cursor-pointer"
      >
        <ArrowLeftOutlined />
        <span className="font-medium">{label}</span>
      </button>
      {rightContent}
    </div>
  );
}
