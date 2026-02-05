"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import { Card, Descriptions } from "antd";
import { BankOutlined, PhoneOutlined, HomeOutlined } from "@ant-design/icons";

import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import BackHeader from "@/components/BackHeader/BackHeader";
import useGetQuery from "@/hooks/getQuery.hook";

export default function AdminViewCompanyPage() {
  const params = useParams();
  const { id } = params;
  const { getQuery, loading } = useGetQuery();
  const [company, setCompany] = useState(null);

  useEffect(() => {
    if (!id) return;
    getQuery({
      url: `/api/v1/admin/companies/${id}`,
      onSuccess: (res) => setCompany(res.company || null),
      onFail: (err) => {
        console.error(err);
        toast.error("Failed to fetch company details");
      },
    });
  }, []);

  if (loading) {
    return (
      <>
        <BackHeader label="Back" href="/admin/company" />
        <Title title="Company Details" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </>
    );
  }

  if (!company) {
    return (
      <>
        <BackHeader label="Back" href="/admin/company" />
        <Title title="Company Details" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Company not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackHeader label="Back" href="/admin/company" />
      <Title title="Company Details" />

      <Card className="shadow-md" style={{ marginTop: 8 }}>
        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <BankOutlined /> Basic Info
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          <Descriptions.Item label="Name">
            {company.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="GST Number">
            {company.gstNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="PAN">
            {company.pan || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Bank Name">
            {company.bankName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Bank Account Number">
            {company.bankAccountNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="IFSC Code">
            {company.ifscCode || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Mobile">
            {company.mobileNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {company.active ? "Active" : "Inactive"}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {company.createdAt
              ? moment(company.createdAt).format("DD-MM-YYYY HH:mm")
              : "N/A"}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions
          title={
            <span className="flex items-center gap-2 mt-4">
              <HomeOutlined /> Address
            </span>
          }
          bordered
          column={{ xs: 1, sm: 1, md: 1 }}
          style={{ marginTop: 16 }}
        >
          <Descriptions.Item label="Address">
            {company.address || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
}
