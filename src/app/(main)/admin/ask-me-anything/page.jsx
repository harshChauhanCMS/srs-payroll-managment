"use client";

import moment from "moment";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import Loader from "@/components/Loader/Loader";

import {
  Card,
  Avatar,
  Button,
  Tag,
  Space,
  Typography,
  Dropdown,
  Modal,
} from "antd";
import {
  UserOutlined,
  MessageOutlined,
  LeftOutlined,
  RightOutlined,
  MoreOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const { Text, Paragraph } = Typography;

// Confirmation Modal Component
const ConfirmationModal = ({
  visible,
  onCancel,
  onConfirm,
  title,
  content,
  confirmText,
  loading,
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText={confirmText}
      cancelText="Cancel"
      confirmLoading={loading}
      width={500}
    >
      <div style={{ padding: "16px 0" }}>
        <div style={{ marginBottom: "16px" }}>
          <Text strong style={{ fontSize: "16px", color: "#1f2937" }}>
            {content?.author || "N/A"}
          </Text>
          <Text
            type="secondary"
            style={{ fontSize: "14px", display: "block", marginTop: "4px" }}
          >
            {content?.email || "No email"}
          </Text>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <Text
            strong
            style={{
              fontSize: "14px",
              color: "#4b5563",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {content?.isReply ? "Reply:" : "Comment:"}
          </Text>
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text style={{ fontSize: "14px", lineHeight: "1.5" }}>
              {content?.text || "No content"}
            </Text>
          </div>
        </div>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {content?.isReply
            ? "This action will hide/show the selected reply."
            : "This action will hide/show the entire post and all its replies."}
        </Text>
      </div>
    </Modal>
  );
};

// Component to render nested replies
const ReplyComponent = ({ reply, level = 0, parentCommentId, onShowModal }) => {
  const isHidden = reply.hide;
  const maxLevel = 3; // Maximum nesting level to prevent infinite recursion
  const { putQuery, loading: hideLoading } = usePutQuery();

  if (level > maxLevel) {
    return null;
  }

  // Note: These functions are no longer needed since we refresh data from server
  // const handleHideToggle = (replyId, currentHideStatus) => { ... };
  // const handleModalConfirm = () => { ... };

  return (
    <div style={{ marginLeft: `${level * 24}px`, marginTop: "12px" }}>
      <Card
        size="small"
        style={{
          marginBottom: "12px",
          opacity: isHidden ? 0.6 : 1,
          backgroundColor: isHidden ? "#f9fafb" : "#ffffff",
          boxShadow: isHidden
            ? "none"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          width: "100%",
          maxWidth: "100%",
        }}
        styles={{
          body: { padding: "12px 16px" },
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <Avatar
            size="default"
            icon={<UserOutlined />}
            style={{
              flexShrink: 0,
              backgroundColor: "#dbeafe",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                flexWrap: "wrap",
              }}
            >
              <Text strong style={{ fontSize: "14px", color: "#1f2937" }}>
                {reply.author && typeof reply.author === "object"
                  ? reply.author.fullName
                  : "Unknown User"}
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {reply.createdAt
                  ? moment(reply.createdAt).format("MMM DD, h:mm A")
                  : "No date"}
              </Text>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isHidden && (
                  <Tag color="red" size="small">
                    Hidden
                  </Tag>
                )}
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "hide",
                        label: isHidden ? "Show" : "Hide",
                        icon: isHidden ? (
                          <EyeOutlined />
                        ) : (
                          <EyeInvisibleOutlined />
                        ),
                        onClick: () => {
                          console.log("Dropdown clicked for reply:", reply._id);
                          onShowModal &&
                            onShowModal({
                              type: "reply",
                              id: reply._id,
                              author:
                                reply.author && typeof reply.author === "object"
                                  ? reply.author.fullName
                                  : "Unknown User",
                              email:
                                reply.author && typeof reply.author === "object"
                                  ? reply.author.email
                                  : "No email",
                              text: reply.comment || "No comment",
                              isHidden: isHidden,
                              parentCommentId: parentCommentId,
                            });
                        },
                      },
                    ],
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    loading={hideLoading}
                    style={{ padding: "4px" }}
                    onClick={(e) => {
                      console.log("Button clicked for reply:", reply._id);
                      e.stopPropagation();
                    }}
                  />
                </Dropdown>
              </div>
            </div>
            <Paragraph
              style={{
                marginBottom: "8px",
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.5",
              }}
            >
              {reply.comment || "No comment"}
            </Paragraph>
            {reply.replies && reply.replies.length > 0 && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {reply.replies.length}{" "}
                {reply.replies.length === 1 ? "reply" : "replies"}
              </Text>
            )}
          </div>
        </div>
      </Card>

      {/* Render nested replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div style={{ marginTop: "4px" }}>
          {reply.replies.map((nestedReply, index) => (
            <ReplyComponent
              key={nestedReply._id || index}
              reply={nestedReply}
              level={level + 1}
              parentCommentId={parentCommentId}
              onShowModal={onShowModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Component to render main comment
const CommentCard = ({ comment, onShowModal }) => {
  const { putQuery, loading: hideLoading } = usePutQuery();

  // Note: These functions are no longer needed since we refresh data from server
  // const handleHideToggle = (replyId, currentHideStatus) => { ... };
  // const handleMainPostHideToggle = (commentId, currentHideStatus) => { ... };
  // const handleMainPostModalConfirm = () => { ... };

  const isMainPostHidden = comment.hide;

  return (
    <Card
      style={{
        marginTop: "32px",
        marginBottom: "32px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        border: "none",
        width: "100%",
        maxWidth: "100%",
        opacity: isMainPostHidden ? 0.6 : 1,
        backgroundColor: isMainPostHidden ? "#f9fafb" : "#ffffff",
      }}
      styles={{
        body: { padding: "20px" },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <Avatar
          size="large"
          src={comment.author?.profilePic}
          icon={<UserOutlined />}
          style={{ flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            <Text strong style={{ fontSize: "18px", color: "#1f2937" }}>
              {comment.author?.fullName || "Unknown User"}
            </Text>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              {comment.author?.email || "No email"}
            </Text>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isMainPostHidden && (
                <Tag color="red" size="small">
                  Hidden
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {comment.createdAt
                  ? moment(comment.createdAt).format("MMM DD, YYYY h:mm A")
                  : "No date"}
              </Text>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "hide",
                      label: isMainPostHidden ? "Show" : "Hide",
                      icon: isMainPostHidden ? (
                        <EyeOutlined />
                      ) : (
                        <EyeInvisibleOutlined />
                      ),
                      onClick: () => {
                        console.log(
                          "Dropdown clicked for main post:",
                          comment._id
                        );
                        onShowModal &&
                          onShowModal({
                            type: "mainPost",
                            id: comment._id,
                            author: comment.author?.fullName || "Unknown User",
                            email: comment.author?.email || "No email",
                            text: comment.comment || "No comment",
                            title: comment.title || "No title",
                            isHidden: isMainPostHidden,
                          });
                      },
                    },
                  ],
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  loading={hideLoading}
                  style={{ padding: "4px" }}
                  onClick={(e) => {
                    console.log("Button clicked for main post:", comment._id);
                    e.stopPropagation();
                  }}
                />
              </Dropdown>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Text
              strong
              style={{
                fontSize: "20px",
                display: "block",
                marginBottom: "12px",
                color: "#111827",
              }}
            >
              {comment.title || "No title"}
            </Text>
            <Paragraph
              style={{
                marginBottom: 0,
                color: "#374151",
                lineHeight: "1.6",
                fontSize: "16px",
              }}
            >
              {comment.comment || "No comment"}
            </Paragraph>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div
              style={{
                borderLeft: "4px solid #dbeafe",
                paddingLeft: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "0 8px 8px 0",
                padding: "12px",
              }}
            >
              <Text
                strong
                style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "Reply" : "Replies"}
              </Text>
              {comment.replies.map((reply, index) => (
                <ReplyComponent
                  key={reply._id || index}
                  reply={reply}
                  level={0}
                  parentCommentId={comment._id}
                  onShowModal={onShowModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const AskMeAnthing = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { putQuery } = usePutQuery();

  const [commentsData, setCommentsData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Note: These functions are no longer needed since we refresh data from server
  // const handleHideToggle = (replyId, newHideStatus) => { ... };
  // const handleMainPostHideToggle = (commentId, newHideStatus) => { ... };

  const handleShowModal = (data) => {
    setModalData(data);
  };

  const handleModalCancel = () => {
    setModalData(null);
    setModalLoading(false);
  };

  const handleModalConfirm = () => {
    if (!modalData) return;

    setModalLoading(true);

    if (modalData.type === "mainPost") {
      // Call API directly for main post
      const url = `/ask-me-anything/${modalData.id}/hide`;
      putQuery({
        url: url,
        onSuccess: (response) => {
          console.log("Main post hide toggle success:", response);
          // Refresh the data after successful toggle
          fetchData();
          setModalData(null);
          setModalLoading(false);
        },
        onFail: (error) => {
          console.error("Failed to toggle main post hide status:", error);
          setModalData(null);
          setModalLoading(false);
        },
      });
    } else if (modalData.type === "reply") {
      // Call API directly for reply
      const url = `/ask-me-anything/${modalData.parentCommentId}/hide/${modalData.id}`;
      putQuery({
        url: url,
        onSuccess: (response) => {
          console.log("Reply hide toggle success:", response);
          // Refresh the data after successful toggle
          fetchData();
          setModalData(null);
          setModalLoading(false);
        },
        onFail: (error) => {
          console.error("Failed to toggle reply hide status:", error);
          setModalData(null);
          setModalLoading(false);
        },
      });
    }
  };

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 5; // Fixed to 5 comments per page

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.askMeAnything?.getComments}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.posts)
          ? response?.data?.posts
          : [];
        setTotalDocuments(response.data.pagination.totalPosts);

        console.log("datalist", dataList);
        setCommentsData(dataList);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  };

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
      <Title title={"Ask Me Anything"} />

      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Total Comments: {totalDocuments}
          </Text>
          <Text type="secondary" style={{ fontSize: "14px", display: "block" }}>
            Showing {Math.min((page - 1) * limit + 1, totalDocuments)}-
            {Math.min(page * limit, totalDocuments)} of {totalDocuments}{" "}
            comments
          </Text>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Page {page} of {Math.ceil(totalDocuments / limit)}
          </Text>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "256px",
          }}
        >
          <Loader />
        </div>
      ) : (
        <div style={{ paddingTop: "16px", width: "100%", maxWidth: "100%" }}>
          {commentsData.length > 0 ? (
            <div style={{ width: "100%" }}>
              {commentsData.map((comment, index) => (
                <CommentCard
                  key={comment._id || index}
                  comment={comment}
                  onShowModal={handleShowModal}
                />
              ))}
            </div>
          ) : (
            <Card>
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <MessageOutlined
                  style={{
                    fontSize: "48px",
                    color: "#9ca3af",
                    marginBottom: "16px",
                  }}
                />
                <Text type="secondary">No comments found</Text>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {totalDocuments > limit && (
            <div
              style={{
                marginTop: "32px",
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Card
                style={{
                  boxShadow:
                    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                  width: "100%",
                  maxWidth: "600px",
                }}
              >
                <Space
                  size="large"
                  style={{
                    padding: "8px 16px",
                    width: "100%",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    type="primary"
                    icon={<LeftOutlined />}
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: "100px",
                    }}
                  >
                    Previous
                  </Button>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <Text strong style={{ color: "#374151" }}>
                      Page {page} of {Math.ceil(totalDocuments / limit)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      ({totalDocuments} total comments)
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<RightOutlined />}
                    disabled={page >= Math.ceil(totalDocuments / limit)}
                    onClick={() => handlePageChange(page + 1)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: "100px",
                    }}
                  >
                    Next
                  </Button>
                </Space>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={!!modalData}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        title={
          modalData
            ? `${modalData.isHidden ? "Show" : "Hide"} ${
                modalData.type === "mainPost" ? "Post" : "Reply"
              }`
            : ""
        }
        content={
          modalData
            ? {
                author: modalData.author,
                email: modalData.email,
                text: modalData.text,
                isReply: modalData.type === "reply",
              }
            : null
        }
        confirmText={modalData ? `${modalData.isHidden ? "Show" : "Hide"}` : ""}
        loading={modalLoading}
      />
    </>
  );
};

export default AskMeAnthing;
