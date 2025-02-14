
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle, Download, X, Calendar, Truck } from "lucide-react";
import { format } from "date-fns";

interface WorkOrderDetailsSidebarProps {
  workOrder: any;
  onClose: () => void;
  onStatusUpdate: (status: string) => void;
  onDownloadAll: () => void;
}

export const WorkOrderDetailsSidebar = ({
  workOrder,
  onClose,
  onStatusUpdate,
  onDownloadAll
}: WorkOrderDetailsSidebarProps) => {
  if (!workOrder) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground hover:bg-success/90';
      case 'flagged':
        return 'bg-danger text-danger-foreground hover:bg-danger/90';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  const getLocationDetails = () => {
    if (!workOrder.location) return { name: 'Not available', address: 'Not available' };
    
    const addressParts = [];
    if (workOrder.location.address) addressParts.push(workOrder.location.address);
    if (workOrder.location.city) addressParts.push(workOrder.location.city);
    if (workOrder.location.state) addressParts.push(workOrder.location.state);
    if (workOrder.location.zipCode) addressParts.push(workOrder.location.zipCode);
    
    return {
      name: workOrder.location.locationName || 'Not available',
      address: addressParts.join(', ') || 'Not available'
    };
  };

  const location = getLocationDetails();
  const completionData = workOrder.completion_data?.data || {};

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "EEEE, MMMM d, yyyy");
    } catch {
      return 'Not available';
    }
  };

  return (
    <div className="w-[300px] border-r bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Work Order #{workOrder.order_id || workOrder.optimoroute_order_number}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
            <Badge 
              className={cn(
                "w-full justify-center py-1",
                getStatusColor(workOrder.qc_status || 'pending_review')
              )}
            >
              {(workOrder.qc_status || 'PENDING REVIEW').toUpperCase().replace(/_/g, ' ')}
            </Badge>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Location Details</h4>
            <div className="space-y-1">
              <div>
                <span className="text-sm">Name: </span>
                <span className="text-sm">{location.name}</span>
              </div>
              <div>
                <span className="text-sm">Address: </span>
                <span className="text-sm">{location.address}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Service Details</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Service Date</p>
                  <p className="text-sm">{formatDate(workOrder.service_date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-sm capitalize">
                    {completionData.status?.toLowerCase() || 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {(workOrder.service_notes || workOrder.description) && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
              <p className="text-sm whitespace-pre-wrap">
                {workOrder.service_notes || workOrder.description}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => onStatusUpdate('approved')}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Mark as Approved
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onStatusUpdate('flagged')}
            >
              <Flag className="mr-2 h-4 w-4 text-red-600" />
              Flag for Review
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={onDownloadAll}
            >
              <Download className="mr-2 h-4 w-4" />
              Download All Images
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
