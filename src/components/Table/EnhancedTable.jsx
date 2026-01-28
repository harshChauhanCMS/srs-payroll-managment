"use client";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  Visibility,
  Edit,
  Delete,
  Search,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Box,
  Stack,
  Typography,
  InputAdornment,
  TableSortLabel,
  Grid,
} from "@mui/material";

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
  const [dateRange, setDateRange] = useState([null, null]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleFilterChange = (accessor, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [accessor]: value === "" ? undefined : value,
    }));
  };

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
        const [start, end] = dateRange;
        if (start && end) {
          const startDate = moment(start).startOf("day");
          const endDate = moment(end).endOf("day");
          const dateValue = moment(row.updatedAt);
          if (!dateValue.isValid()) return false;
          return dateValue.isBetween(startDate, endDate, "day", "[]");
        }
        return true;
      });
  }, [data, searchQuery, filterValues, dateRange]);

  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (bValue < aValue) {
        return order === "asc" ? -1 : 1;
      }
      if (bValue > aValue) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, order, orderBy]);

  const totalPages = Math.ceil(totalDocuments / pageLimit);

  // Helper to render cell content
  const renderCell = (column, row, index) => {
    if (column.Cell) return column.Cell(row[column.accessor], row, index);
    if (column.render) return column.render(row[column.accessor], row, index);
    return row[column.accessor];
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="column" spacing={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            fontWeight="bold"
            sx={{ color: "#1E3A5F" }}
          >
            {entryText}
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderColor: "#1E3A5F",
                },
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            {showDate && (
              <Stack direction="row" spacing={2}>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  onChange={(e) => {
                    const val = e.target.value ? moment(e.target.value) : null;
                    setDateRange((prev) => [val, prev[1]]);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  onChange={(e) => {
                    const val = e.target.value ? moment(e.target.value) : null;
                    setDateRange((prev) => [prev[0], val]);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            )}
          </Grid>
        </Grid>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ overflowX: "auto" }}
        >
          <Table stickyHeader className="custom-table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.accessor || column.Header}
                    width={column.width}
                    sx={{ fontWeight: "bold", backgroundColor: "#fafafa" }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <TableSortLabel
                        active={orderBy === column.accessor}
                        direction={orderBy === column.accessor ? order : "asc"}
                        onClick={() => handleRequestSort(column.accessor)}
                      >
                        {column.Header}
                      </TableSortLabel>

                      {filterColumns?.includes(column.accessor) && (
                        <Select
                          value={filterValues[column.accessor] || ""}
                          onChange={(e) =>
                            handleFilterChange(column.accessor, e.target.value)
                          }
                          displayEmpty
                          variant="standard"
                          disableUnderline
                          sx={{
                            minWidth: 100,
                            fontSize: "0.875rem",
                            "& .MuiSelect-select": {
                              paddingRight: 2,
                            },
                          }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {[
                            ...new Set(data.map((row) => row[column.accessor])),
                          ].map((value, index) => (
                            <MenuItem key={index} value={value}>
                              {value}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </Stack>
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell
                    key="actions"
                    width={150}
                    sx={{ fontWeight: "bold", backgroundColor: "#fafafa" }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, index) => (
                <TableRow
                  key={
                    row._id || row.id || row.key || JSON.stringify(row) || index
                  }
                  hover
                >
                  {columns.map((column) => (
                    <TableCell key={column.accessor || column.Header}>
                      {renderCell(column, row, index)}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {onView && (
                          <IconButton
                            size="small"
                            onClick={() => handleView(row)}
                            sx={{ color: "blue" }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        )}
                        {onEdit && (
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(row)}
                            sx={{ color: "#c9c740" }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(row)}
                            sx={{ color: "red" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {sortedData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showActions ? 1 : 0)}
                    align="center"
                  >
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ pt: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </IconButton>
            <Typography
              sx={{
                color: "#1E3A5F",
                fontWeight: "bold",
                fontSize: "0.875rem",
              }}
            >
              Page {currentPage} of {totalPages || 1}
            </Typography>
            <IconButton
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight />
            </IconButton>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2">Rows per page:</Typography>
            <Select
              value={pageLimit}
              onChange={onLimitChange}
              size="small"
              sx={{ minWidth: 70 }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default EnhancedTable;
