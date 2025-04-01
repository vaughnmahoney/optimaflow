import { WorkOrder } from "@/components/workorders/types";

/**
 * Calculate counts for each status type in the work orders array
 */
export const calculateStatusCounts = (workOrders: WorkOrder[]) => {
  const counts = {
    approved: 0,
    pending_review: 0,
    flagged: 0,
    resolved: 0,
    rejected: 0,
    all: workOrders.length
  };
  
  workOrders.forEach(workOrder => {
    const status = workOrder.status || 'pending_review';
    
    // Group flagged_followup under flagged for the counts
    const normalizedStatus = status === 'flagged_followup' ? 'flagged' : status;
    
    if (counts[normalizedStatus] !== undefined) {
      counts[normalizedStatus]++;
    }
  });
  
  return counts;
};

/**
 * Safely parses JSON data or returns the original if it's already an object
 */
const safelyParseJSON = (jsonData: any): any => {
  if (!jsonData) return null;
  
  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }
  
  // If it's already an object, return it as is
  return jsonData;
};

/**
 * Transforms raw work order data from Supabase into the application's WorkOrder type
 */
export const transformWorkOrderData = (order: any): WorkOrder => {
  // Safely parse JSON fields if they're strings
  const searchResponse = safelyParseJSON(order.search_response);
  const completionResponse = safelyParseJSON(order.completion_response);
  
  // Create driver object from searchResponse if available
  let driver = null;
  let service_date = null;
  let service_notes = null;
  let lds = null;
  
  if (searchResponse && typeof searchResponse === 'object') {
    // Safely extract driver information
    if (searchResponse.scheduleInformation && typeof searchResponse.scheduleInformation === 'object') {
      driver = { 
        id: searchResponse.scheduleInformation.driverId,
        name: searchResponse.scheduleInformation.driverName 
      };
    }
    
    // Safely extract service information
    if (searchResponse.data && typeof searchResponse.data === 'object') {
      service_date = searchResponse.data.date;
      service_notes = searchResponse.data.notes;
      
      // Extract LDS from customField5 if available
      if (searchResponse.data.customField5) {
        lds = searchResponse.data.customField5;
        // If LDS contains a timestamp, extract just the date part
        if (lds.includes(" ")) {
          lds = lds.split(" ")[0];
        }
      }
    }
  }
  
  // Flag to check if the work order has images
  const has_images = !!(
    completionResponse && 
    typeof completionResponse === 'object' &&
    completionResponse.orders && 
    Array.isArray(completionResponse.orders) &&
    completionResponse.orders[0] && 
    completionResponse.orders[0].data && 
    completionResponse.orders[0].data.form && 
    completionResponse.orders[0].data.form.images && 
    Array.isArray(completionResponse.orders[0].data.form.images) &&
    completionResponse.orders[0].data.form.images.length > 0
  );
  
  // Create a location object with safe property access
  let location = null;
  if (searchResponse && 
      typeof searchResponse === 'object' && 
      searchResponse.data && 
      typeof searchResponse.data === 'object' && 
      searchResponse.data.location) {
    location = searchResponse.data.location;
  }
  
  return {
    id: order.id,
    order_no: order.order_no || 'N/A',
    status: order.status || 'pending_review',
    timestamp: order.timestamp || new Date().toISOString(),
    service_date: service_date,
    service_notes: service_notes,
    tech_notes: completionResponse && 
                typeof completionResponse === 'object' && 
                completionResponse.orders && 
                completionResponse.orders[0] && 
                completionResponse.orders[0].data && 
                completionResponse.orders[0].data.form && 
                completionResponse.orders[0].data.form.note,
    // If notes exists in database use it, otherwise set to empty string
    notes: order.notes || '',
    // Include QC notes from database or empty string
    qc_notes: order.qc_notes || '',
    // Include resolution notes from database or empty string
    resolution_notes: order.resolution_notes || '',
    
    // User attribution fields mapping - add all these fields from database
    // Approved details
    approved_by: order.approved_by || null,
    approved_user: order.approved_user || null,
    approved_at: order.approved_at || null,
    
    // Flagged details
    flagged_by: order.flagged_by || null,
    flagged_user: order.flagged_user || null,
    flagged_at: order.flagged_at || null,
    
    // Resolved details
    resolved_by: order.resolved_by || null,
    resolved_user: order.resolved_user || null,
    resolved_at: order.resolved_at || null,
    
    // Rejected details
    rejected_by: order.rejected_by || null,
    rejected_user: order.rejected_user || null,
    rejected_at: order.rejected_at || null,
    
    // Last action details
    last_action_by: order.last_action_by || null,
    last_action_user: order.last_action_user || null,
    last_action_at: order.last_action_at || null,
    
    // Legacy field
    resolver_id: order.resolver_id || null,
    
    location: location,
    driver: driver,
    // If duration exists in database use it, otherwise set to empty string
    duration: order.duration || '',
    // If lds exists in database use it, otherwise extract from customField5
    lds: lds || order.lds || '',
    has_images: has_images,
    signature_url: completionResponse && 
                  typeof completionResponse === 'object' && 
                  completionResponse.orders && 
                  completionResponse.orders[0] && 
                  completionResponse.orders[0].data && 
                  completionResponse.orders[0].data.form && 
                  completionResponse.orders[0].data.form.signature && 
                  completionResponse.orders[0].data.form.signature.url,
    search_response: searchResponse,
    completion_response: completionResponse
  };
};

/**
 * Extracts the best available date from a work order using consistent logic
 * First tries to use completion date, then falls back to service_date
 * Returns a valid Date object or null if no valid date is available
 */
export const getBestWorkOrderDate = (order: WorkOrder): Date | null => {
  // Try to get the end date from completion data first
  if (order.completion_response?.orders?.[0]?.data?.endTime?.localTime) {
    try {
      const date = new Date(order.completion_response.orders[0].data.endTime.localTime);
      if (!isNaN(date.getTime())) {
        return date;
      }
      // If date parsing fails, continue to fallbacks
    } catch (error) {
      // Continue to fallbacks
    }
  }
  
  // Fall back to service_date if end date is not available or invalid
  if (order.service_date) {
    try {
      const date = new Date(order.service_date);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // Continue to fallbacks
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
      // If all parsing fails, return null
    }
  }
  
  return null;
};
