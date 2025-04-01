
import { WorkOrder, SortDirection, SortField } from "@/components/workorders/types";

/**
 * Gets the best available date from work order data for sorting purposes
 * Prioritizes completionResponse endTime, then startTime, then service_date
 */
const getBestWorkOrderDate = (order: WorkOrder): Date | null => {
  // First try to get the end time from completion data (most reliable)
  const endTime = order.completion_response?.orders?.[0]?.data?.endTime?.localTime;
  if (endTime) {
    try {
      const date = new Date(endTime);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, continue to fallbacks
    }
  }
  
  // Next try to get the start time from completion data
  const startTime = order.completion_response?.orders?.[0]?.data?.startTime?.localTime;
  if (startTime) {
    try {
      const date = new Date(startTime);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, continue to fallback
    }
  }
  
  // Then try service_date if available
  if (order.service_date) {
    try {
      const date = new Date(order.service_date);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, continue to fallback
    }
  }
  
  // Finally, fall back to timestamp if available
  if (order.timestamp) {
    try {
      const date = new Date(order.timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, return null
    }
  }
  
  return null;
};

/**
 * Sorts work orders based on the provided sort field and direction
 */
export const sortWorkOrders = (
  orders: WorkOrder[], 
  sortField: SortField, 
  sortDirection: SortDirection
): WorkOrder[] => {
  // Default sort - if no sort specified, sort by service_date descending (newest first)
  if (!sortField || !sortDirection) {
    return [...orders].sort((a, b) => {
      const dateA = getBestWorkOrderDate(a);
      const dateB = getBestWorkOrderDate(b);
      
      if (dateA && !dateB) return -1; // Valid dates come first
      if (!dateA && dateB) return 1;
      if (!dateA && !dateB) return 0;
      
      // Sort descending by default (newest first)
      return dateB!.getTime() - dateA!.getTime();
    });
  }
  
  return [...orders].sort((a, b) => {
    let valueA: any;
    let valueB: any;
    
    switch (sortField) {
      case 'order_no':
        valueA = a.order_no || '';
        valueB = b.order_no || '';
        break;
      case 'service_date':
        // Use enhanced date extraction logic
        const dateA = getBestWorkOrderDate(a);
        const dateB = getBestWorkOrderDate(b);
        
        if (dateA && !dateB) return sortDirection === 'asc' ? -1 : 1;
        if (!dateA && dateB) return sortDirection === 'asc' ? 1 : -1;
        if (!dateA && !dateB) return 0;
        
        return sortDirection === 'asc' 
          ? dateA!.getTime() - dateB!.getTime()
          : dateB!.getTime() - dateA!.getTime();
      case 'driver':
        valueA = a.driver && typeof a.driver === 'object' && a.driver.name
          ? a.driver.name.toLowerCase() : '';
        valueB = b.driver && typeof b.driver === 'object' && b.driver.name
          ? b.driver.name.toLowerCase() : '';
        break;
      case 'location':
        valueA = a.location && typeof a.location === 'object' 
          ? (a.location.name || a.location.locationName || '').toLowerCase() : '';
        valueB = b.location && typeof b.location === 'object'
          ? (b.location.name || b.location.locationName || '').toLowerCase() : '';
        break;
      case 'status':
        valueA = a.status || '';
        valueB = b.status || '';
        break;
      default:
        return 0;
    }
    
    // For strings
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // For other values
    return sortDirection === 'asc' 
      ? valueA - valueB 
      : valueB - valueA;
  });
};

/**
 * Creates handlers for updating sort state
 */
export const useSortHandlers = (
  setSortField: React.Dispatch<React.SetStateAction<SortField>>,
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>,
  setPagination: React.Dispatch<React.SetStateAction<any>>
) => {
  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return { handleSort };
};
