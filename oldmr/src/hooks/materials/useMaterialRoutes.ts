
import { useState } from 'react';
import { getRoutes, GetRoutesParams, DriverRoute } from '@/services/optimoroute/getRoutesService';
import { getOrderDetails, OrderDetail } from '@/services/optimoroute/getOrderDetailService';
import { useMRStore, MaterialItem } from '@/hooks/materials/useMRStore';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { BatchProcessingStats } from '@/components/bulk-orders/types';

export interface RouteMaterialsResponse {
  isLoading: boolean;
  routes: DriverRoute[];
  orderDetails: OrderDetail[];
  rawRoutesResponse: any; // Added to store raw API response
  rawOrderDetailsResponse: any; // Added to store raw API response
  batchStats: BatchProcessingStats | null;
  fetchRouteMaterials: (params: GetRoutesParams) => Promise<void>;
  reset: () => void;
}

// Parse material requirements from order notes
const parseMaterialsFromNotes = (notes: string, orderNo: string, driverSerial?: string): MaterialItem[] => {
  if (!notes) return [];
  
  // Parse format like "(0) COOLER, (15) FREEZER, (2) G2063B, (2) G2563B"
  const materialsPattern = /\((\d+)\)\s*([^,(]+)(?:,|$)/g;
  const materials: MaterialItem[] = [];
  
  let match;
  while ((match = materialsPattern.exec(notes)) !== null) {
    const quantity = parseInt(match[1], 10);
    const type = match[2].trim();
    
    if (quantity > 0 && type) {
      materials.push({
        id: uuidv4(),
        type,
        quantity,
        workOrderId: orderNo,
        driverSerial
      });
    }
  }
  
  return materials;
};

export const useMaterialRoutes = (): RouteMaterialsResponse => {
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<DriverRoute[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [rawRoutesResponse, setRawRoutesResponse] = useState<any>(null);
  const [rawOrderDetailsResponse, setRawOrderDetailsResponse] = useState<any>(null);
  const [batchStats, setBatchStats] = useState<BatchProcessingStats | null>(null);
  const { setMaterialsData, setRawNotes, setTechnicianName, clearData } = useMRStore();

  const fetchRouteMaterials = async (params: GetRoutesParams) => {
    setIsLoading(true);
    setBatchStats(null);
    
    try {
      // Step 1: Get routes for the selected date
      const routesResponse = await getRoutes(params);
      
      // Store the raw response for debugging
      setRawRoutesResponse(routesResponse);
      
      if (!routesResponse.success || !routesResponse.routes?.length) {
        toast.error(routesResponse.error || "No routes found for the selected date");
        setIsLoading(false);
        return;
      }
      
      setRoutes(routesResponse.routes);
      
      // Step 2: Collect all order numbers from the routes
      const orderNumbers = routesResponse.routes
        .flatMap(route => route.stops)
        .map(stop => stop.orderNo)
        .filter(orderNo => orderNo !== "-");
      
      if (!orderNumbers.length) {
        toast.warning("No valid order numbers found in routes");
        setIsLoading(false);
        return;
      }
      
      console.log(`Collected ${orderNumbers.length} order numbers from routes`);
      
      // Step 3: Get order details for all order numbers (now with parallel batch processing)
      const orderDetailsResponse = await getOrderDetails(orderNumbers);
      
      // Store the raw response for debugging
      setRawOrderDetailsResponse(orderDetailsResponse);
      
      // Update batch stats for UI
      if (orderDetailsResponse.batchStats) {
        setBatchStats({
          totalBatches: orderDetailsResponse.batchStats.totalBatches,
          completedBatches: orderDetailsResponse.batchStats.completedBatches,
          successfulBatches: orderDetailsResponse.batchStats.successfulBatches,
          failedBatches: orderDetailsResponse.batchStats.failedBatches,
          totalOrdersProcessed: orderDetailsResponse.batchStats.totalOrdersProcessed || 0,
          errors: orderDetailsResponse.batchStats.errors || []
        });
        
        // Log batch statistics if available
        console.log(`Batch processing stats: ${orderDetailsResponse.batchStats.successfulBatches}/${orderDetailsResponse.batchStats.totalBatches} batches successful`);
        
        // Show toast with batch processing info
        if (orderDetailsResponse.batchStats.failedBatches > 0) {
          toast.warning(`Processed ${orderDetailsResponse.batchStats.successfulBatches} of ${orderDetailsResponse.batchStats.totalBatches} batches successfully (${orderDetailsResponse.batchStats.failedBatches} failed)`);
        } else {
          toast.success(`Processed all ${orderDetailsResponse.batchStats.totalBatches} batches successfully`);
        }
      }
      
      if (!orderDetailsResponse.success || !orderDetailsResponse.orders?.length) {
        toast.error(orderDetailsResponse.error || "Failed to fetch order details");
        setIsLoading(false);
        return;
      }
      
      setOrderDetails(orderDetailsResponse.orders);
      
      // Step 4: Extract material requirements from order notes
      const materials: MaterialItem[] = [];
      const notes: string[] = [];
      
      // Create a map of orderNo to driverSerial for associating materials with drivers
      const orderToDriverMap: Record<string, string> = {};
      routesResponse.routes.forEach(route => {
        route.stops.forEach(stop => {
          if (stop.orderNo !== "-") {
            orderToDriverMap[stop.orderNo] = route.driverSerial;
          }
        });
      });
      
      orderDetailsResponse.orders.forEach(order => {
        if (order.data?.notes) {
          notes.push(`${order.data.orderNo}: ${order.data.notes}`);
          
          // Get the driver serial for this order
          const driverSerial = orderToDriverMap[order.data.orderNo];
          
          // Parse materials and associate them with the driver
          materials.push(...parseMaterialsFromNotes(order.data.notes, order.data.orderNo, driverSerial));
        }
      });
      
      // Step 5: Update the MR store with the materials data
      setMaterialsData(materials);
      setRawNotes(notes);
      
      // Set technician name based on driver if available
      if (routesResponse.routes.length === 1) {
        setTechnicianName(routesResponse.routes[0].driverName);
      } else if (routesResponse.routes.length > 1) {
        setTechnicianName('Multiple Drivers');
      }
      
      toast.success(`Found ${materials.length} material items across ${orderDetailsResponse.orders.length} orders`);
      
    } catch (error) {
      console.error("Error in fetchRouteMaterials:", error);
      toast.error("An error occurred while fetching materials");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setRoutes([]);
    setOrderDetails([]);
    setRawRoutesResponse(null);
    setRawOrderDetailsResponse(null);
    setBatchStats(null);
    clearData();
  };

  return {
    isLoading,
    routes,
    orderDetails,
    rawRoutesResponse,
    rawOrderDetailsResponse,
    batchStats,
    fetchRouteMaterials,
    reset
  };
};
