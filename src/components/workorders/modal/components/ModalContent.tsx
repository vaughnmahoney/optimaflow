
import React from "react";
import { WorkOrder } from "@/components/workorders/types";
import { ImageViewer } from "./ImageViewer";
import { ImageThumbnails } from "./ImageThumbnails";
import { QuickInfo } from "./QuickInfo";
import { OrderDetails } from "./OrderDetails";

interface ModalContentProps {
  workOrder: WorkOrder;
  images: Array<{ url: string; type?: string; name?: string }>;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
  onSaveQcNotes?: (workOrderId: string, notes: string) => Promise<void>;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  workOrder,
  images,
  currentImageIndex,
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand,
  onSaveQcNotes
}) => {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left side - Image viewer with vertical thumbnails */}
      <div className={`flex flex-row ${isImageExpanded ? 'w-full' : 'w-3/5'} border-r`}>
        {/* Vertical thumbnail strip - Only show when not expanded */}
        {!isImageExpanded && (
          <ImageThumbnails 
            images={images} 
            currentImageIndex={currentImageIndex} 
            setCurrentImageIndex={setCurrentImageIndex} 
          />
        )}
        
        {/* Main image container */}
        <div className="flex-1 relative flex">
          <ImageViewer 
            images={images}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            isImageExpanded={isImageExpanded}
            toggleImageExpand={toggleImageExpand}
          />
        </div>
      </div>
      
      {/* Right side - Details panel */}
      {!isImageExpanded && (
        <div className="w-2/5 flex flex-col overflow-hidden">
          {/* Quick info section */}
          <QuickInfo workOrder={workOrder} />
          
          {/* Tabs for Details, Notes, Signature */}
          <OrderDetails 
            workOrder={workOrder} 
            onSaveQcNotes={onSaveQcNotes}
          />
        </div>
      )}
    </div>
  );
};
