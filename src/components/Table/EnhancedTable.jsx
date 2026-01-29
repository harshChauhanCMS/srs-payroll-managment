/* eslint-disable react-hooks/exhaustive-deps */
import moment from "moment";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Table,
  Select,
  Typography,
  Button,
  Input,
  Row,
  Col,
  Space,
  DatePicker,
} from "antd";

const { Option } = Select;
const { RangePicker } = DatePicker;

const EnhancedTable = ({
  columns,
  data,
  filterColumns,
  showDate = true,
  entryText = "Total entries:",
  showActions = false,
  onView,
  onEdit,
  onDelete,
  currentPage,
  totalPages: totalPagesProp,
  pageLimit,
  onPageChange,
  onLimitChange,
  totalDocuments,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [dateRange, setDateRange] = useState([]);
  const navigate = useRouter();

  const handleView = (item) => {
    if (typeof onView === "function") {
      const url = onView(item);
      navigate.push(url);
    } else {
      navigate.push(onView);
    }
  };

  const handleEdit = (item) => {
    if (typeof onEdit === "function") {
      onEdit(item);
    } else {
      navigate.push(onEdit);
    }
  };

  const handleDelete = (item) => {
    if (typeof onDelete === "function") {
      onDelete(item);
    } else if (onDelete === true) {
      console.log("Delete action for:", item);
    }
  };

  const actionColumn = {
    title: "Actions",
    dataIndex: "actions",
    key: "actions",
    width: 150,
    render: (_, row) => (
      <Space>
        {onView && (
          <Button
            type="link"
            icon={<EyeOutlined style={{ color: "blue", fontSize: "16px" }} />}
            onClick={() => handleView(row)}
          />
        )}
        {onEdit && (
          <Button
            type="link"
            icon={
              <EditOutlined style={{ color: "#c9c740", fontSize: "16px" }} />
            }
            onClick={() => handleEdit(row)}
          />
        )}
        {onDelete && (
          <Button
            type="link"
            icon={<DeleteOutlined style={{ color: "red", fontSize: "16px" }} />}
            onClick={() => handleDelete(row)}
          />
        )}
      </Space>
    ),
  };

  const handleFilterChange = (column, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [column.accessor]: value === "" ? undefined : value,
    }));
  };

  const enhancedColumns = useMemo(() => {
    let baseColumns = columns;
    if (showActions) {
      baseColumns = [...columns, actionColumn];
    }
    return baseColumns;
  }, [columns, showActions, onView, onEdit, onDelete]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data
      .filter((row) =>
        Object.entries(row).some(([, value]) => {
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchQuery.toLowerCase());
          }
          if (typeof value === "number") {
            return value.toString().includes(searchQuery);
          }
          return false;
        }),
      )
      .filter((row) =>
        Object.entries(filterValues).every(([key, value]) => {
          if (value === undefined) return true;
          return row[key] === value;
        }),
      )
      .filter((row) => {
        if (dateRange.length === 2) {
          const [start, end] = dateRange;
          const startDate = moment(start.toDate()).startOf("day");
          const endDate = moment(end.toDate()).endOf("day");
          const dateValue = moment(row.updatedAt);
          if (!dateValue.isValid()) return false;
          return dateValue.isBetween(startDate, endDate, "day", "[]");
        }
        return true;
      });
  }, [data, searchQuery, filterValues, dateRange]);

  const antColumns = enhancedColumns.map((column) => ({
    title: (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography.Text strong style={{ textAlign: "left" }}>
          {column.title || column.Header}
        </Typography.Text>
        {filterColumns?.includes(column.accessor) && (
          <Select
            placeholder={`Filter by ${column.Header}`}
            value={filterValues[column.accessor] || ""}
            onChange={(value) => handleFilterChange(column, value)}
            style={{ width: "60%", minWidth: 120 }}
            dropdownStyle={{ backgroundColor: "#f9f9f9" }}
          >
            <Option value="">All</Option>
            {[...new Set(data.map((row) => row[column.accessor]))].map(
              (value, index) => (
                <Option key={index} value={value}>
                  {value}
                </Option>
              ),
            )}
          </Select>
        )}
      </div>
    ),
    dataIndex: column.accessor || column.dataIndex,
    key: column.accessor || column.key,
    width: column.width,
    sorter: (a, b) =>
      a[column.accessor || column.dataIndex] >
      b[column.accessor || column.dataIndex]
        ? 1
        : a[column.accessor || column.dataIndex] <
            b[column.accessor || column.dataIndex]
          ? -1
          : 0,
    render: column.Cell || column.render || ((value, record, index) => value),
  }));

  const paginatedData = filteredData;

  const totalPages = Math.ceil(totalDocuments / pageLimit);

  return (
    <>
      <Space orientation="vertical" style={{ width: "100%" }}>
        <Typography.Text
          type="secondary"
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1E3A5F",
            float: "right",
          }}
        >
          {entryText}
        </Typography.Text>

        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderColor: "#1E3A5F", borderWidth: 1 }}
            />
          </Col>
          <Col xs={24} md={12}>
            {showDate && (
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates || [])}
                format="DD-MM-YYYY"
                style={{ width: "100%", borderColor: "#1E3A5F" }}
                allowClear
              />
            )}
          </Col>
        </Row>

        <Table
          columns={antColumns}
          dataSource={paginatedData}
          pagination={false}
          rowKey={(record) =>
            record._id || record.id || record.key || JSON.stringify(record)
          }
          bordered
          scroll={{ x: "max-content" }}
          className="custom-table"
        />

        <Row justify="space-between" align="middle">
          <Col className="flex">
            <Button
              type="text"
              icon={<LeftCircleOutlined />}
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="pt-2"
            />
            <p
              style={{ color: "#1E3A5F", fontWeight: "bold", marginTop: "6px" }}
            >
              Page {currentPage} of {totalPages}
            </p>
            <Button
              type="text"
              icon={<RightCircleOutlined />}
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="pt-2"
            />
          </Col>
          <Col>
            <Space>
              <Typography.Text>Rows per page:</Typography.Text>
              <Select
                value={pageLimit}
                onChange={onLimitChange}
                style={{ width: 80, borderColor: "#1E3A5F" }}
              >
                <Option value={10}>10</Option>
                <Option value={20}>20</Option>
                <Option value={50}>50</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Space>
    </>
  );
};

export default EnhancedTable;
