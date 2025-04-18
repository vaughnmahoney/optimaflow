
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageViewer } from "@/hooks/useImageViewer";
import { TechImageContent } from "./components/TechImageContent";
import { TechMobileImageViewer } from "./components/mobile/TechMobileImageViewer";
import { useIsMobile } from "@/hooks/use-mobile";
import { TechImageViewerFooter } from "./components/TechImageViewerFooter";
import { TechMobileImageHeader } from "./components/mobile/TechMobileImageHeader";
import { TechMobileNotesTab } from "./components/mobile/TechMobileNotesTab";

interface TechImageViewModalProps {
  workOrder: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TechImageViewModal = ({
  workOrder,
  isOpen,
  onClose
}: TechImageViewModalProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("images");
  
  // Get images from the work order's completion_response
  const images = workOrder?.completion_response?.orders?.[0]?.data?.form?.images || [];
  
  const {
    currentImageIndex,
    setCurrentImageIndex,
    isImageExpanded,
    toggleImageExpand
  } = useImageViewer({
    images,
    initialIndex: 0
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Use mobile version for small screens
  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full p-0 h-[90vh] w-[95vw] flex flex-col rounded-lg overflow-hidden">
          <DialogTitle className="sr-only">
            Work Order {workOrder?.order_no} Images
          </DialogTitle>
          
          {workOrder && (
            <>
              <TechMobileImageHeader 
                onClose={onClose}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
              
              {activeTab === "images" ? (
                // Use a fixed container to prevent layout shifts with different image orientations
                <div className="flex-1 flex flex-col overflow-hidden">
                  <TechMobileImageViewer
                    images={images}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    onClose={onClose}
                  />
                </div>
              ) : (
                <TechMobileNotesTab workOrder={workOrder} />
              )}
              
              <TechImageViewerFooter />
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }
  
  // Desktop version
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden bg-white shadow-xl w-[95%] m-0">
        {/* Simple header with just the order number and close button */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold">
            Order #{workOrder?.order_no || 'N/A'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Image content using tech-specific component */}
          {workOrder && (
            <TechImageContent 
              images={images}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              isImageExpanded={isImageExpanded}
              toggleImageExpand={toggleImageExpand}
            />
          )}
        </div>

        <TechImageViewerFooter />
      </DialogContent>
    </Dialog>
  );
};
