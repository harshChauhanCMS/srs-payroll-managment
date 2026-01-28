"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import {
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";

const Blogs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { patchQuery, loading: toggleLoading } = usePatchQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [togglingId, setTogglingId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  /* eslint-disable react-hooks/exhaustive-deps */
  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.blogs?.getAllBlogs}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.blogs)
          ? response?.data?.blogs
          : [];
        setTotalDocuments(response.data.pagination.totalBlogs);

        const mappedData = dataList.map((item) => ({
          title: item?.title || "N/A",
          authorName: item?.author?.fullName || "N/A",
          email: item?.author?.email || "N/A",
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          updatedAt: item?.updatedAt,
          isVerified: item?.isVerified,
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  };

  const handleToggleVerification = (blogId, currentStatus) => {
    setTogglingId(blogId);
    patchQuery({
      url: `${apiUrls.blogs.verifyBlog.replace("/id", `/${blogId}`)}`,
      onSuccess: (response) => {
        toast.success("Blog verification status updated successfully");
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === blogId
              ? { ...item, isVerified: !currentStatus }
              : item,
          ),
        );
        setTogglingId(null);
      },
      onFail: (err) => {
        console.log("Toggle failed:", err);
        toast.error("Failed to update verification status");
        setTogglingId(null);
      },
    });
  };

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!blogToDelete) return;

    deleteQuery({
      url: `${apiUrls.blogs.deleteBlog.replace("/id", `/${blogToDelete._id}`)}`,
      onSuccess: (response) => {
        toast.success("Blog deleted successfully");
        setTableData((prevData) =>
          prevData.filter((item) => item._id !== blogToDelete._id),
        );
        setTotalDocuments((prev) => prev - 1);
        setDeleteModalVisible(false);
        setBlogToDelete(null);
      },
      onFail: (err) => {
        console.log("Delete failed:", err);
        toast.error("Failed to delete blog");
        setDeleteModalVisible(false);
        setBlogToDelete(null);
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setBlogToDelete(null);
  };

  const columns = [
    {
      Header: "Title",
      accessor: "title",
      width: 200,
    },
    {
      Header: "Author Name",
      accessor: "authorName",
      width: 150,
    },
    {
      Header: "Email",
      accessor: "email",
      width: 180,
    },
    {
      Header: "Verification Status",
      accessor: "isVerified",
      width: 180,
      Cell: (value, record) => {
        return (
          <Select
            value={value ? "verified" : "not_verified"}
            onChange={(e) => {
              handleToggleVerification(record._id, value);
            }}
            disabled={togglingId === record._id}
            sx={{ width: "100%", minWidth: "160px" }}
            size="small"
            variant="outlined"
          >
            <MenuItem value="not_verified">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Not Verified</span>
              </div>
            </MenuItem>
            <MenuItem value="verified">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Verified</span>
              </div>
            </MenuItem>
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
      <Title title={"Blogs List"} />

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
              `/admin/blogs/${row._id}/?page=${page}&limit=${limit}`
            }
            onDelete={handleDeleteClick}
            entryText={`Total Blogs: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={(e) => handleLimitChange(e.target.value)}
            totalDocuments={totalDocuments}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteModalVisible}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Blog</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this blog? This action cannot be
            undone.
          </DialogContentText>
          {blogToDelete && (
            <Box sx={{ mt: 2, bgcolor: "#f9fafb", p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Blog Title:
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {blogToDelete.title}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">
                Author:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {blogToDelete.authorName}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteLoading}
            autoFocus
            startIcon={
              deleteLoading ? <CircularProgress size={20} /> : undefined
            }
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Blogs;
