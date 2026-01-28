"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import Loader from "@/components/Loader/Loader";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { Select } from "antd";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const Clerks = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { putQuery, loading: toggleLoading } = usePutQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [togglingId, setTogglingId] = useState(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.auth?.getAllClerks}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.clerks)
          ? response?.data?.clerks
          : [];
        setTotalDocuments(response.data.pagination.totalClerks);

        const mappedData = dataList.map((item) => ({
          fullName: item?.fullName || "N/A",
          mobileNumber: item?.mobileNumber || "N/A",
          email: item?.email || "N/A",
          experience: item?.experience || 0,
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          updatedAt: item?.updatedAt,
          isProfileUpdated: item?.isProfileUpdated,
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  };

  const handleToggleStatus = (clerkId, currentStatus) => {
    setTogglingId(clerkId);
    putQuery({
      url: `${apiUrls.auth.toggleStatus}/${clerkId}`,
      onSuccess: (response) => {
        toast.success("Status updated successfully");
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === clerkId
              ? { ...item, isProfileUpdated: !currentStatus }
              : item
          )
        );
        setTogglingId(null);
      },
      onFail: (err) => {
        console.log("Toggle failed:", err);
        toast.error("Failed to update status");
        setTogglingId(null);
      },
    });
  };

  const columns = [
    {
      Header: "Full Name",
      accessor: "fullName",
      width: 180,
    },
    {
      Header: "Mobile Number",
      accessor: "mobileNumber",
      width: 140,
    },
    {
      Header: "Email ID",
      accessor: "email",
      width: 180,
    },
    {
      Header: "Experience",
      accessor: "experience",
      width: 100,
    },
    {
      Header: "Update Profile",
      accessor: "isProfileUpdated",
      width: 160,
      Cell: (value, record) => {
        return (
          <Select
            value={value ? "updated" : "not_updated"}
            onChange={(newValue) => {
              handleToggleStatus(record._id, value);
            }}
            loading={togglingId === record._id}
            disabled={togglingId === record._id}
            style={{ width: "100%", minWidth: "140px" }}
            size="small"
            className="profile-status-select"
          >
            <Select.Option value="not_updated">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Not Updated</span>
              </div>
            </Select.Option>
            <Select.Option value="updated">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Updated</span>
              </div>
            </Select.Option>
          </Select>
        );
      },
    },
    {
      Header: "Created",
      accessor: "date",
      width: 100,
    },
  ];

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handlePageChange = (newPage) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", newPage);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleLimitChange = (newLimit) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("limit", newLimit);
    newSearchParams.set("page", 1);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <>
      <Title title={"Clerks List"} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="pt-4">
          <EnhancedTable
            columns={columns}
            data={tableData}
            showDate={true}
            showActions={true}
            onView={(row) =>
              `/admin/clerks-list/${row._id}/?page=${page}&limit=${limit}`
            }
            entryText={`Total Clerks: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            totalDocuments={totalDocuments}
          />
        </div>
      )}
    </>
  );
};

export default Clerks;
