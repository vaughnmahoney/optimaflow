
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageViewDialog } from "./ImageViewDialog";
import { WorkOrderTable } from "./WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useState, useEffect } from "react";
import { WorkOrderListProps } from "./types";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const WorkOrderList = ({ 
  workOrders, 
  isLoading,
  onSearchChange,
  onStatusFilterChange,
  onStatusUpdate,
  searchQuery,
  statusFilter
}: WorkOrderListProps) => {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [optimoSearch, setOptimoSearch] = useState("");

  useEffect(() => {
    const handleOpenWorkOrder = (event: CustomEvent<string>) => {
      setSelectedWorkOrderId(event.detail);
    };

    window.addEventListener('openWorkOrder', handleOpenWorkOrder as EventListener);
    return () => {
      window.removeEventListener('openWorkOrder', handleOpenWorkOrder as EventListener);
    };
  }, []);

  const handleOptimoSearch = async () => {
    if (!optimoSearch.trim()) return;
    
    try {
      const response = await fetch(`https://api.optimoroute.com/v1/search_orders?key=${optimoSearch}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orders: [{ orderNo: optimoSearch }],
          includeOrderData: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to search OptimoRoute');
      }

      const data = await response.json();
      if (data.success) {
        // Clear the search input
        setOptimoSearch("");
        // Trigger a refresh of the work orders
        onSearchChange("");
      }
    } catch (error) {
      console.error('OptimoRoute search error:', error);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search local orders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Import OptimoRoute order #"
            value={optimoSearch}
            onChange={(e) => setOptimoSearch(e.target.value)}
            className="w-64"
          />
          <Button 
            variant="secondary"
            onClick={handleOptimoSearch}
            disabled={!optimoSearch.trim()}
          >
            <Search className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>

        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => onStatusFilterChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <WorkOrderTable 
        workOrders={workOrders}
        onStatusUpdate={onStatusUpdate}
        onImageView={setSelectedWorkOrderId}
      />

      <ImageViewDialog 
        workOrderId={selectedWorkOrderId} 
        onClose={() => setSelectedWorkOrderId(null)}
        onStatusUpdate={onStatusUpdate}
        workOrders={workOrders}
      />
    </div>
  );
};
