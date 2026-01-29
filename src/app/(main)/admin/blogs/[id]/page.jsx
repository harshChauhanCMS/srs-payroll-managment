"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import Loader from "@/components/Loader/Loader";
import usePatchQuery from "@/hooks/patchQuery.hook";

import { Card, Button, Tag, Space, Typography, Image, Divider } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader/BackHeader";

const { Text, Paragraph, Title: AntTitle } = Typography;

const BlogDetail = ({ params }) => {
  const router = useRouter();
  const pathname = usePathname();
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
  }, [blogId]);

  const handleBack = () => {
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    router.push(`/admin/blogs?page=${page}&limit=${limit}`);
  };

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
        <Text type="secondary">Blog not found</Text>
      </div>
    );
  }

  return (
    <>
      <BackHeader label={"Back"} />

      <Title title={`Blog: ${blogData.title}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-6">
              <AntTitle level={2} className="mb-4">
                {blogData.title}
              </AntTitle>

              <div className="mb-4">
                <Space>
                  <Tag
                    color={blogData.isVerified ? "green" : "red"}
                    icon={
                      blogData.isVerified ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                  >
                    {blogData.isVerified ? "Verified" : "Not Verified"}
                  </Tag>
                  <Text type="secondary">
                    <CalendarOutlined className="mr-1" />
                    {moment(blogData.createdAt).format("MMM DD, YYYY h:mm A")}
                  </Text>
                </Space>
              </div>

              <Paragraph className="text-lg leading-relaxed">
                {blogData.description}
              </Paragraph>
            </div>

            {/* Images */}
            {blogData.images && blogData.images.length > 0 && (
              <div className="mb-6">
                <AntTitle level={4} className="mb-4">
                  Images
                </AntTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blogData.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`Blog image ${index + 1}`}
                      className="rounded-lg"
                      style={{ width: "100%", height: "auto" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card title="Blog Information" className="mb-6">
            <div className="space-y-4">
              <div>
                <Text strong>Author</Text>
                <div className="flex items-center mt-2">
                  <UserOutlined className="mr-2 text-blue-500" />
                  <div>
                    <div className="font-medium">
                      {blogData.author.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {blogData.author.email}
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>Verification Status</Text>
                <div className="mt-2">
                  <Tag
                    color={blogData.isVerified ? "green" : "red"}
                    icon={
                      blogData.isVerified ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                    className="text-sm"
                  >
                    {blogData.isVerified ? "Verified" : "Not Verified"}
                  </Tag>
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>Created</Text>
                <div className="mt-2 text-sm text-gray-600">
                  {moment(blogData.createdAt).format("MMM DD, YYYY h:mm A")}
                </div>
              </div>

              <div>
                <Text strong>Last Updated</Text>
                <div className="mt-2 text-sm text-gray-600">
                  {moment(blogData.updatedAt).format("MMM DD, YYYY h:mm A")}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Actions">
            <div className="space-y-3">
              <Button
                type={blogData.isVerified ? "default" : "primary"}
                danger={blogData.isVerified}
                icon={
                  blogData.isVerified ? (
                    <CloseCircleOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
                onClick={handleToggleVerification}
                loading={toggling}
                disabled={toggling}
                block
              >
                {blogData.isVerified
                  ? "Mark as Not Verified"
                  : "Mark as Verified"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BlogDetail;
