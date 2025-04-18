
import React from "react";
import { ImageType } from "../../types/image";
import { ImageViewer } from "./ImageViewer";
import { ImageThumbnails } from "./ImageThumbnails";
import { ImageEmptyState } from "./ImageEmptyState";

interface ImageContentProps {
  workOrderId: string;
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
}

export function ImageContent({ 
  workOrderId,
  images, 
  currentImageIndex, 
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand 
}: ImageContentProps) {
  if (images.length === 0) {
    return <ImageEmptyState />;
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <ImageThumbnails
        images={images}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
      />
      
      <div className="relative flex-1 h-full">
        <ImageViewer 
          workOrderId={workOrderId}
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
      </div>
    </div>
  );
}
