"use client";
import React from "react";
import { Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Title from "@/components/Title/Title";
import BackHeader from "@/components/BackHeader/BackHeader";

const { Dragger } = Upload;

const BulkUploadPage = () => {
  const props = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".xlsx, .xls",
    action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload", // Placeholder URL, replace with actual API endpoint later
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <>
      <BackHeader label="User Management" />
      <Title title="Bulk Upload Users" showButton={false} />

      <div className="rounded-lg shadow-md" style={{ marginTop: "16px" }}>
        <Dragger {...props} style={{ padding: "40px 0" }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: "#366598" }} />
          </p>
          <p className="ant-upload-text text-lg font-medium text-gray-700">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint text-gray-500 mt-2">
            Support for a single or bulk upload. Strictly prohibit from
            uploading company data or other band files.
          </p>
        </Dragger>
      </div>
    </>
  );
};

export default BulkUploadPage;
