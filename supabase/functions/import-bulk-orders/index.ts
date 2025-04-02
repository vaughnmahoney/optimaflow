
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// Create a Supabase client with the admin role
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orders } = await req.json();
    
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No valid orders provided',
          imported: 0,
          duplicates: 0,
          errors: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${orders.length} orders for import...`);
    
    // Track results
    const results = {
      success: false,
      total: orders.length,
      imported: 0,
      duplicates: 0,
      errors: 0,
      errorDetails: []
    };

    // Process orders - since client is now batching, we don't need to batch here anymore
    // but we'll keep processing one at a time to avoid overwhelming the database
    for (const order of orders) {
      try {
        // Extract unique identifier (order_no) from various possible locations
        const orderNo = order.order_no || 
                      order.data?.orderNo || 
                      (order.searchResponse && order.searchResponse.data?.orderNo) ||
                      (order.completionDetails && order.completionDetails.orderNo) || 
                      'unknown';
        
        // Check if order already exists by order_no
        const { data: existingOrders, error: checkError } = await adminClient
          .from('work_orders')
          .select('id')
          .eq('order_no', orderNo)
          .maybeSingle();
        
        if (checkError) {
          throw new Error(`Error checking for existing order: ${checkError.message}`);
        }
        
        // If order already exists, count as duplicate and skip
        if (existingOrders) {
          results.duplicates++;
          continue;
        }
        
        // Extract service date
        const serviceDate = extractServiceDate(order);
        
        // Extract driver name
        const driverName = extractDriverName(order);
        
        // Extract location name
        const locationName = extractLocationName(order);
        
        // Extract end time
        const endTime = extractEndTime(order);
        
        // Transform order to match work_orders table schema
        const workOrder = {
          order_no: orderNo,
          status: 'pending_review', // Default status for imported orders
          timestamp: new Date().toISOString(),
          service_date: serviceDate,
          driver_name: driverName,
          location_name: locationName,
          end_time: endTime,
          search_response: order.search_response || order, // Store original search data
          completion_response: order.completion_response || order.completionDetails || null // Store completion data if available
        };
        
        // Insert the order into the database
        const { error: insertError } = await adminClient
          .from('work_orders')
          .insert(workOrder);
        
        if (insertError) {
          throw new Error(`Error inserting order: ${insertError.message}`);
        }
        
        results.imported++;
        
      } catch (orderError) {
        console.error(`Error processing order:`, orderError);
        results.errors++;
        results.errorDetails.push(orderError.message);
      }
    }
    
    results.success = results.errors === 0;
    
    console.log(`Import complete. Results:`, results);
    
    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Error in import-bulk-orders:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        imported: 0,
        duplicates: 0,
        errors: 1,
        errorDetails: [error.message]
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to extract service date from order data
function extractServiceDate(order: any): string | null {
  // Try different paths to find the service date
  if (order.service_date) {
    return order.service_date;
  }
  
  if (order.data?.date) {
    return order.data.date;
  }
  
  if (order.searchResponse?.data?.date) {
    return order.searchResponse.data.date;
  }
  
  return null;
}

// Helper function to extract driver name from order data
function extractDriverName(order: any): string {
  // Try different paths to find the driver name
  if (order.driver_name) {
    return order.driver_name;
  }
  
  if (order.driver?.name) {
    return order.driver.name;
  }
  
  if (order.scheduleInformation?.driverName) {
    return order.scheduleInformation.driverName;
  }
  
  if (order.searchResponse?.scheduleInformation?.driverName) {
    return order.searchResponse.scheduleInformation.driverName;
  }
  
  if (order.searchResponse?.data?.driver?.name) {
    return order.searchResponse.data.driver.name;
  }
  
  return "Unknown Driver";
}

// Helper function to extract location name from order data
function extractLocationName(order: any): string {
  // Try different paths to find the location name
  if (order.location_name) {
    return order.location_name;
  }
  
  if (order.location?.name) {
    return order.location.name;
  }
  
  if (order.location?.locationName) {
    return order.location.locationName;
  }
  
  if (order.searchResponse?.data?.location?.name) {
    return order.searchResponse.data.location.name;
  }
  
  if (order.searchResponse?.data?.location?.locationName) {
    return order.searchResponse.data.location.locationName;
  }
  
  return "Unknown Location";
}

// Helper function to extract end time from order data
function extractEndTime(order: any): string | null {
  // Try different paths to find the end time
  if (order.end_time) {
    return order.end_time;
  }
  
  // Try completion details endTime
  if (order.completionDetails?.data?.endTime?.utcTime) {
    return order.completionDetails.data.endTime.utcTime;
  }
  
  if (order.completionDetails?.data?.endTime?.localTime) {
    return order.completionDetails.data.endTime.localTime;
  }
  
  // Try completion_response in array format
  if (order.completion_response?.orders?.[0]?.data?.endTime?.utcTime) {
    return order.completion_response.orders[0].data.endTime.utcTime;
  }
  
  if (order.completion_response?.orders?.[0]?.data?.endTime?.localTime) {
    return order.completion_response.orders[0].data.endTime.localTime;
  }
  
  return null;
}
