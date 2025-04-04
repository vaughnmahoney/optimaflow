
import { useState, useEffect } from "react";
import { SortField, SortDirection, PaginationState, WorkOrderFilters } from "@/components/workorders/types";
import { useWorkOrderFetch } from "./useWorkOrderFetch";
import { useWorkOrderStatusCounts } from "./useWorkOrderStatusCounts";
import { useWorkOrderMutations } from "./useWorkOrderMutations";
import { useWorkOrderImport } from "./useWorkOrderImport";
import { useAutoImport } from "./useAutoImport";

export const useWorkOrderData = () => {
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // End of today
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);
  
  const [filters, setFilters] = useState<WorkOrderFilters>({
    status: null,
    dateRange: { from: today, to: endOfToday }, // Default to today's date
    driver: null,
    location: null,
    orderNo: null,
    optimoRouteStatus: null,
    searchText: null // Add this for the global search
  });
  
  const [sortField, setSortField] = useState<SortField>('end_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  const { data: workOrdersData = { data: [], total: 0 }, isLoading, refetch } = useWorkOrderFetch(
    filters, 
    pagination.page, 
    pagination.pageSize,
    sortField,
    sortDirection
  );
  
  const { runAutoImport } = useAutoImport();
  
  const workOrders = workOrdersData.data;
  const total = workOrdersData.total;
  
  if (pagination.total !== total) {
    setPagination(prev => ({ ...prev, total }));
  }
  
  // Pass filters to useWorkOrderStatusCounts to filter by date range
  const statusCounts = useWorkOrderStatusCounts(workOrders, filters.status, filters);
  
  const { searchOptimoRoute } = useWorkOrderImport();
  const { updateWorkOrderStatus, deleteWorkOrder } = useWorkOrderMutations();

  // This combined function will handle both refetch and auto-import
  const handleRefreshWithAutoImport = async () => {
    await refetch();
    await runAutoImport();
  };

  const handleColumnFilterChange = (column: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (column) {
        case 'order_no':
          newFilters.orderNo = value;
          break;
        case 'service_date':
          newFilters.dateRange = value;
          break;
        case 'driver':
          newFilters.driver = value;
          break;
        case 'location':
          newFilters.location = value;
          break;
        case 'status':
          newFilters.status = value;
          break;
        case 'optimoroute_status':
          newFilters.optimoRouteStatus = value;
          break;
        case 'search':
          newFilters.searchText = value;
          break;
      }
      
      return newFilters;
    });
    
    handlePageChange(1);
  };

  const clearColumnFilter = (column: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (column) {
        case 'order_no':
          newFilters.orderNo = null;
          break;
        case 'service_date':
          newFilters.dateRange = { from: null, to: null };
          break;
        case 'driver':
          newFilters.driver = null;
          break;
        case 'location':
          newFilters.location = null;
          break;
        case 'status':
          newFilters.status = null;
          break;
        case 'optimoroute_status':
          newFilters.optimoRouteStatus = null;
          break;
        case 'search':
          newFilters.searchText = null;
          break;
      }
      
      return newFilters;
    });
    
    handlePageChange(1);
  };

  const clearAllFilters = () => {
    setFilters({
      status: null,
      dateRange: { from: today, to: endOfToday },
      driver: null,
      location: null,
      orderNo: null,
      optimoRouteStatus: null,
      searchText: null // Clear search text too
    });
    
    handlePageChange(1);
  };

  const openImageViewer = (workOrderId: string) => {
    console.log(`Opening images for work order: ${workOrderId}`);
  };

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    handlePageChange(1);
  };
  
  const handlePageChange = (page: number) => {
    const newPage = Math.max(1, page);
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };
  
  const handleFiltersChange = (newFilters: WorkOrderFilters) => {
    setFilters(newFilters);
    handlePageChange(1);
  };

  const handleSearchChange = (searchText: string) => {
    handleColumnFilterChange('search', searchText || null);
  };

  return {
    data: workOrders,
    isLoading,
    filters,
    setFilters: handleFiltersChange,
    onColumnFilterChange: handleColumnFilterChange,
    clearColumnFilter,
    clearAllFilters,
    searchOptimoRoute,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort: handleSort,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total
    },
    handlePageChange,
    handlePageSizeChange,
    refetch: handleRefreshWithAutoImport,
    handleSearchChange
  };
};
