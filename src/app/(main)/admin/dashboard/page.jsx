"use client";

import Title from "@/components/Title/Title";

import { useSelector } from "react-redux";
import { ROLE_LABELS } from "@/constants/roles";

const Dashboard = () => {
  const user = useSelector((state) => state.user?.user);
  const roleLabel = user?.role ? ROLE_LABELS[user.role] : "Dashboard";
  const heading = roleLabel ? `${roleLabel} Dashboard` : "Dashboard";

  return (
    <div className="text-slate-950">
      <Title title={heading} />
    </div>
  );
};

export default Dashboard;
