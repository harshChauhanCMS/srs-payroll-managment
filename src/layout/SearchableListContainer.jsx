"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination/Pagination";
import SearchBar from "@/components/SearchBar/SearchBar";

// This is our new generic wrapper component
const SearchableListContainer = ({
  apiFetchFunction, // The function to call to get data
  renderItem, // A function that tells us how to render one item (e.g., a VendorCard)
  initialFilters, // Default filter values
  itemsPerPage, // How many items to show on a page
  searchPlaceholder, // Placeholder text for the search bar
  filterBarComponent: FilterBarComponent, // Optional: A custom filter bar component
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- State Management ---
  // State is now initialized from the URL's query parameters
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(searchParams);
    return {
      searchQuery: params.get("search") || initialFilters.searchQuery,
      selectedTag: params.get("tag") || initialFilters.selectedTag,
      sortBy: params.get("sortBy") || initialFilters.sortBy,
      sortDirection: params.get("sortDir") || initialFilters.sortDirection,
    };
  });
  const [currentPage, setCurrentPage] = useState(
    () => parseInt(searchParams.get("page")) || 1
  );
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- URL Synchronization ---
  // This effect updates the URL whenever filters or the page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set("search", filters.searchQuery);
    if (
      filters.selectedTag &&
      filters.selectedTag !== initialFilters.selectedTag
    )
      params.set("tag", filters.selectedTag);
    if (filters.sortBy !== initialFilters.sortBy)
      params.set("sortBy", filters.sortBy);
    if (filters.sortDirection !== initialFilters.sortDirection)
      params.set("sortDir", filters.sortDirection);
    if (currentPage > 1) params.set("page", currentPage.toString());

    // Use push to update the URL without a full page reload

    const newUrl = `${pathname}?${params.toString()}`;
    const currentUrl = `${pathname}?${searchParams.toString()}`;

    // 🔑 Only update if URL has actually changed
    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [filters, currentPage, pathname, router, initialFilters]);

  // --- Data Fetching ---
  // This effect fetches data when filters or page change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await apiFetchFunction({
        page: currentPage,
        limit: itemsPerPage,
        filters,
      });
      setData(response.data);
      setTotalPages(Math.ceil(response.totalCount / itemsPerPage));
      setIsLoading(false);
    };
    fetchData();
  }, [filters, currentPage, itemsPerPage, apiFetchFunction]);

  // --- Handlers ---
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div>
      <SearchBar
        placeholder={searchPlaceholder}
        value={filters.searchQuery}
        onChange={(query) => handleFilterChange("searchQuery", query)}
      />

      {/* Conditionally render the custom filter bar if it was provided */}
      {FilterBarComponent && (
        <FilterBarComponent
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      <div className="mt-5 flex flex-col gap-5 min-h-[300px]">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : data.length > 0 ? (
          <>
            {/* The magic happens here: we call the render prop for each item */}
            {data.map((item) => renderItem(item))}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-800">
              No results found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableListContainer;
