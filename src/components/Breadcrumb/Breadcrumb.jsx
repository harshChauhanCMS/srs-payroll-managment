"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";
import { Breadcrumb as AntBreadcrumb } from "antd";

const Breadcrumb = ({ items, className = "" }) => {
  const router = useRouter();

  const breadcrumbItems = items.map((item, index) => {
    const isLast = index === items.length - 1;

    return {
      title: isLast ? (
        <span
          className="text-[#fcd53f] font-medium cursor-default"
          style={{ color: "#fcd53f" }}
        >
          {item.title}
        </span>
      ) : (
        <Link
          href={item.href || "#"}
          className="text-black hover:text-[#366598] transition-colors duration-200"
          onClick={(e) => {
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            }
          }}
        >
          {item.title}
        </Link>
      ),
    };
  });

  return (
    <div className={`mb-6 ${className}`}>
      <AntBreadcrumb
        separator=">"
        items={breadcrumbItems}
        style={{
          fontSize: "17px",
        }}
      />
    </div>
  );
};

export default Breadcrumb;
