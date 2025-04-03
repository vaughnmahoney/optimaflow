
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadgeDropdown } from "../../../StatusBadgeDropdown";
import { WorkOrder } from "../../../types";

interface MobileModalHeaderProps {
  workOrder: WorkOrder;
  onClose: () => void;
  filters?: any;
  workOrders?: WorkOrder[];
  onAdvanceToNextOrder?: (nextOrderId: string) => void;
}

export const MobileModalHeader = ({ 
  workOrder, 
  onClose,
  filters,
  workOrders,
  onAdvanceToNextOrder
}: MobileModalHeaderProps) => {
  // Extract the completion status from the appropriate place in the order object
  const getCompletionStatus = (order: WorkOrder): string | undefined => {
    return order.completion_status || 
           (order.completionDetails?.data?.status) ||
           (order.completion_response?.orders?.[0]?.data?.status) ||
           (order.search_response?.scheduleInformation?.status);
  };

  return (
    <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-950 border-b">
      <div className="flex items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Order #{workOrder.order_no}</h2>
            <StatusBadgeDropdown 
              workOrderId={workOrder.id}
              currentStatus={workOrder.status || "pending_review"} 
              completionStatus={getCompletionStatus(workOrder)}
              filters={filters}
              workOrders={workOrders}
              onAdvanceToNextOrder={onAdvanceToNextOrder}
            />
          </div>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose} 
        className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
