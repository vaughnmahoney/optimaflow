import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase client with service role (for DB insert permission)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Type definition for our reports table
interface ReportEntry {
  id?: string;            // Will be auto-generated by Supabase
  org_id: string;         // Organization ID
  order_no: string | null;
  status: string;         // Status in our system
  optimoroute_status: string | null; // Status from OptimoRoute
  scheduled_time: string | null;
  end_time: string | null;
  cust_name: string | null;
  cust_group: string | null;
  tech_name: string | null;
  region: string | null;
  fetched_at: string;     // When we fetched this data
}

serve(async (_req) => {
  // 1. Fetch routes for today from OptimoRoute API
  const today = new Date().toISOString().slice(0, 10);  // YYYY-MM-DD
  const now = new Date().toISOString();  // Current timestamp for fetched_at
  const apiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
  
  // Default organization ID - in a real implementation, you might
  // fetch different data for different organizations
  const orgId = Deno.env.get('DEFAULT_ORG_ID') || 'default';
  
  const routesUrl = `https://api.optimoroute.com/v1/get_routes?key=${apiKey}&date=${today}`;
  
  try {
    const response = await fetch(routesUrl);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API reported unsuccessful operation');
    }
    
    // 2. Transform API data into our reports table structure
    const reportsPayload: ReportEntry[] = [];
    
    // First, collect all order numbers to query work_orders table in batch
    const orderNumbers: string[] = [];
    
    for (const route of data.routes || []) {
      for (const stop of route.stops) {
        if (!stop.id || stop.orderNo === "-") continue; // Skip non-order stops
        
        // Only add valid order numbers
        const orderNo = stop.orderNo !== "-" ? stop.orderNo : null;
        if (orderNo) orderNumbers.push(orderNo);
      }
    }

    // Helper function to fetch completion details
    async function getCompletionDetails(orderNumbers: string[], apiKey: string): Promise<any> {
      if (orderNumbers.length === 0) return { orders: [], success: true };
      
      const completionUrl = `https://api.optimoroute.com/v1/get_completion_details?key=${apiKey}`;
      const orders = orderNumbers.map(orderNo => ({ orderNo }));

      try {
        console.log(`Fetching completion details for ${orders.length} orders`);
        
        const response = await fetch(completionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orders })
        });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          console.error('API reported unsuccessful operation:', data);
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching completion details:", error);
        return { orders: [], success: false, error: error.message };
      }
    }

    // Fetch completion details for all order numbers in batches (max 500 per API call)
    const completionDetailsMap = new Map();
    
    // Process in batches of 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < orderNumbers.length; i += BATCH_SIZE) {
      const batch = orderNumbers.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i/BATCH_SIZE + 1}, size: ${batch.length}`);
      
      const completionDetails = await getCompletionDetails(batch, apiKey);
      
      if (completionDetails && completionDetails.orders) {
        for (const order of completionDetails.orders) {
          if (order.success && order.data) {
            completionDetailsMap.set(order.orderNo || order.id, order.data);
          }
        }
      }
      
      // Add a small delay between batches to avoid rate limiting
      if (orderNumbers.length > BATCH_SIZE && i + BATCH_SIZE < orderNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Now process routes and stops with status information
    for (const route of data.routes || []) {
      const driverId = route.driverSerial || null;
      const techName = route.driverName || null;
      const region = null; // Could be determined from route data if available
      
      for (const stop of route.stops) {
        // Skip non-order stops like start/end points
        if (!stop.id || stop.orderNo === "-") continue;
        const custName = stop.locationName || null;
        
        // Extract customer group from customer name
        // Examples: "Dollar General #1234" -> "Dollar General"
        //           "Menards #5678" -> "Menards"
        let custGroup = null;
        if (custName && custName.includes('#')) {
          // Split at the '#' and take the first part, trimming any whitespace
          custGroup = custName.split('#')[0].trim();
        }
        
        // Get status and end_time from completion details if available, otherwise use defaults
        const orderNo = stop.orderNo !== "-" ? stop.orderNo : null;
        const completionDetail = completionDetailsMap.get(orderNo);
        const status = completionDetail ? completionDetail.status : "Scheduled";
        const endTime = completionDetail && completionDetail.endTime ? completionDetail.endTime.utcTime : null;
        
        reportsPayload.push({
          org_id: orgId,
          order_no: orderNo,
          status: status, // Status from completion details
          optimoroute_status: "Planned", // Default status from OptimoRoute for planned stops
          scheduled_time: stop.scheduledAtDt || null,
          end_time: endTime, 
          cust_name: custName,
          cust_group: custGroup,
          tech_name: techName,
          region: region,
          fetched_at: now
        });
      }
    }
    
    // 3. Upsert into the reports table
    if (reportsPayload.length === 0) {
      return new Response("No reports to update", { status: 200 });
    }
    
    const { error } = await supabase
      .from('reports')
      .upsert(reportsPayload, { 
        onConflict: 'order_no',
        ignoreDuplicates: false 
      });
      
    if (error) {
      console.error("Upsert error:", error);
      return new Response(`Error updating reports: ${error.message}`, { status: 500 });
    }
    
    return new Response(`Successfully updated ${reportsPayload.length} reports`, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching or processing OptimoRoute data:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});
