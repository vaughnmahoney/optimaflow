import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrder } from "../../types";
interface NotesTabProps {
  workOrder: WorkOrder;
}
export const NotesTab = ({
  workOrder
}: NotesTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  return <ScrollArea className="flex-1">
      <div className="p-6 space-y-6 py-[4px] px-0">
        <Card className="p-4 py-[16px]">
          <h3 className="font-medium mb-2">Tech Notes</h3>
          <p className="text-sm whitespace-pre-wrap">
            {completionData?.form?.note || 'No tech notes available'}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Service Notes</h3>
          <p className="text-sm whitespace-pre-wrap">
            {workOrder.service_notes || 'No service notes available'}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Additional Notes</h3>
          <p className="text-sm whitespace-pre-wrap">
            {workOrder.notes || 'No additional notes available'}
          </p>
        </Card>
      </div>
    </ScrollArea>;
};