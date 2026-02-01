"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import EnhancedTable from "@/components/Table/EnhancedTable";
import { usePermissions } from "@/hooks/usePermissions";

import { Modal, Tag, Select } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const { Option } = Select;

export default function SiteManagement({
  basePath = "/admin",
  showAddButton = true, // Backward compatibility
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canView, canEdit, canDelete, canCreate } = usePermissions();

  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { getQuery: getCompanies } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  useEffect(() => {
    getCompanies({
      url: "/api/v1/admin/companies?active=true&limit=100",
      onSuccess: (response) => {
        setCompanies(response.companies || []);
      },
      onFail: () => {},
    });
  }, []);

  const fetchData = () => {
    let url = `/api/v1/admin/sites?page=${page}&limit=${limit}`;
    if (selectedCompany) {
      url += `&company=${selectedCompany}`;
    }

    getQuery({
      url,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.sites) ? response.sites : [];
        setTotalDocuments(response.pagination?.total || 0);

        const mappedData = dataList.map((item) => ({
          name: item?.name || "N/A",
          siteCode: item?.siteCode || "N/A",
          company: item?.company?.name || "N/A",
          address: item?.address || "N/A",
          status: item?.active ? "Active" : "Inactive",
          active: item?.active,
          createdAt: moment(item?.createdAt).format("DD-MM-YYYY"),
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        toast.error("Failed to fetch sites");
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, selectedCompany]);

  const handleEditStart = (site) => {
    router.push(`${basePath}/site/edit/${site._id}`);
  };

  const handleDeleteClick = (site) => {
    setSiteToDelete(site);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!siteToDelete) return;

    deleteQuery({
      url: `/api/v1/admin/sites/${siteToDelete._id}`,
      onSuccess: () => {
        toast.success("Site deactivated successfully");
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === siteToDelete._id
              ? { ...item, active: false, status: "Inactive" }
              : item,
          ),
        );
        setDeleteModalVisible(false);
        setSiteToDelete(null);
      },
      onFail: () => {
        toast.error("Failed to deactivate site");
        setDeleteModalVisible(false);
        setSiteToDelete(null);
      },
    });
  };

  const columns = [
    { Header: "Site Name", accessor: "name", width: 180 },
    { Header: "Site Code", accessor: "siteCode", width: 120 },
    { Header: "Company", accessor: "company", width: 200 },
    { Header: "Address", accessor: "address", width: 200 },
    {
      Header: "Status",
      accessor: "status",
      width: 100,
      Cell: (value, record) => (
        <Tag color={record.active ? "success" : "default"}>{value}</Tag>
      ),
    },
    { Header: "Created At", accessor: "createdAt", width: 120 },
  ];

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
      <Title
        title="Site Management"
        showButton={canCreate()}
        buttonText="Add Site"
        destination={`${basePath}/site/add`}
      />

      {fetchLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="pt-4">
          <EnhancedTable
            columns={columns}
            data={tableData}
            showActions={true}
            filterColumns={"company"}
            onView={
              canView()
                ? (row) => `${basePath}/site/view/${row._id}`
                : undefined
            }
            onEdit={canEdit() ? handleEditStart : undefined}
            onDelete={canDelete() ? handleDeleteClick : undefined}
            entryText={`Total Sites: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            totalDocuments={totalDocuments}
          />
        </div>
      )}

      <Modal
        title="Deactivate Site"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Deactivate"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
          className: "red-button",
          style: { borderRadius: "8px" },
        }}
        cancelButtonProps={{
          className: "white-button",
          style: { borderRadius: "8px" },
        }}
        centered
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to deactivate this site?
          </p>
          {siteToDelete && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-800">Site:</p>
              <p className="text-gray-600">
                {siteToDelete.name} ({siteToDelete.siteCode})
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
