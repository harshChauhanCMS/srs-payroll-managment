"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import Loader from "@/components/Loader/Loader";
import usePatchQuery from "@/hooks/patchQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Stack,
  Typography,
  Divider,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  Person as UserIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CloseCircleIcon,
} from "@mui/icons-material";

const BlogDetail = ({ params }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { patchQuery, loading: toggleLoading } = usePatchQuery();

  const [blogData, setBlogData] = useState(null);
  const [toggling, setToggling] = useState(false);

  const blogId = params.id;

  const fetchBlogData = () => {
    getQuery({
      url: `${apiUrls?.blogs?.getBlogById.replace("/id", `/${blogId}`)}`,
      onSuccess: (response) => {
        setBlogData(response.data);
      },
      onFail: (err) => {
        console.log(err);
        toast.error("Failed to fetch blog details");
      },
    });
  };

  const handleToggleVerification = () => {
    setToggling(true);
    patchQuery({
      url: `${apiUrls.blogs.verifyBlog.replace("/id", `/${blogId}`)}`,
      onSuccess: (response) => {
        toast.success("Blog verification status updated successfully");
        setBlogData((prev) => ({
          ...prev,
          isVerified: !prev.isVerified,
        }));
        setToggling(false);
      },
      onFail: (err) => {
        console.log("Toggle failed:", err);
        toast.error("Failed to update verification status");
        setToggling(false);
      },
    });
  };

  useEffect(() => {
    if (blogId) {
      fetchBlogData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="text-center py-8">
        <Typography color="textSecondary">Blog not found</Typography>
      </div>
    );
  }

  return (
    <>
      <BackHeader label={"Back"} />

      <Title title={`Blog: ${blogData.title}`} />

      <Grid container spacing={3} sx={{ pt: 3 }}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box mb={3}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {blogData.title}
                </Typography>

                <Box mb={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={blogData.isVerified ? "Verified" : "Not Verified"}
                      color={blogData.isVerified ? "success" : "error"}
                      icon={
                        blogData.isVerified ? (
                          <CheckCircleIcon />
                        ) : (
                          <CloseCircleIcon />
                        )
                      }
                      size="small"
                      variant="filled"
                      sx={{ color: "white" }}
                    />
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      color="text.secondary"
                    >
                      <CalendarIcon fontSize="small" />
                      <Typography variant="body2">
                        {moment(blogData.createdAt).format(
                          "MMM DD, YYYY h:mm A",
                        )}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Typography
                  variant="body1"
                  fontSize="1.125rem"
                  sx={{ lineHeight: 1.7 }}
                >
                  {blogData.description}
                </Typography>
              </Box>

              {/* Images */}
              {blogData.images && blogData.images.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Images
                  </Typography>
                  <Grid container spacing={2}>
                    {blogData.images.map((image, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Box
                          component="img"
                          src={image}
                          alt={`Blog image ${index + 1}`}
                          sx={{
                            width: "100%",
                            height: "auto",
                            borderRadius: 2,
                            display: "block",
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title={<Typography variant="h6">Blog Information</Typography>}
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Author
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                    <UserIcon sx={{ color: "primary.main" }} />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {blogData.author.fullName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {blogData.author.email}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Verification Status
                  </Typography>
                  <Box mt={1}>
                    <Chip
                      label={blogData.isVerified ? "Verified" : "Not Verified"}
                      color={blogData.isVerified ? "success" : "error"}
                      icon={
                        blogData.isVerified ? (
                          <CheckCircleIcon />
                        ) : (
                          <CloseCircleIcon />
                        )
                      }
                      size="small"
                      variant="filled" // Updated
                      sx={{ color: "white" }}
                    />
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Created
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mt={0.5}>
                    {moment(blogData.createdAt).format("MMM DD, YYYY h:mm A")}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Last Updated
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mt={0.5}>
                    {moment(blogData.updatedAt).format("MMM DD, YYYY h:mm A")}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={<Typography variant="h6">Actions</Typography>} />
            <Divider />
            <CardContent>
              <Button
                variant="contained"
                color={blogData.isVerified ? "inherit" : "primary"}
                fullWidth
                startIcon={
                  blogData.isVerified ? (
                    <CloseCircleIcon />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                onClick={handleToggleVerification}
                disabled={toggling}
                sx={{
                  bgcolor: blogData.isVerified ? "grey.300" : undefined,
                  color: blogData.isVerified ? "text.primary" : undefined,
                  "&:hover": {
                    bgcolor: blogData.isVerified ? "grey.400" : undefined,
                  },
                }}
              >
                {toggling ? (
                  <CircularProgress size={24} />
                ) : blogData.isVerified ? (
                  "Mark as Not Verified"
                ) : (
                  "Mark as Verified"
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default BlogDetail;
