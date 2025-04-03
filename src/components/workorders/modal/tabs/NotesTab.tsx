
import { Card } from "@/components/ui/card";
import { WorkOrder } from "@/components/workorders/types";
import { Package, FileText, ClipboardCheck } from "lucide-react";

interface NotesTabProps {
  workOrder: WorkOrder;
}

export const NotesTab = ({ workOrder }: NotesTabProps) => {
  const completionData = workOrder.completion_response?.orders?.[0]?.data;
  const searchData = workOrder.search_response?.data;
  
  return (
    <div className="p-4 space-y-3">
      {/* Tech Notes card */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-700">Tech Notes</h4>
          </div>
          <div className="pl-6 mt-1">
            {completionData?.form?.note ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">{completionData.form.note}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">No tech notes available</p>
            )}
          </div>
        </div>
      </Card>

      {/* Service Notes card */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-700">Service Notes</h4>
          </div>
          <div className="pl-6 mt-1">
            {workOrder.service_notes ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">{workOrder.service_notes}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">No service notes available</p>
            )}
          </div>
        </div>
      </Card>

      {/* Additional Notes card */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-700">Additional Notes</h4>
          </div>
          <div className="pl-6 mt-1">
            {searchData?.customField1 ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">{searchData.customField1}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">No additional notes available</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
