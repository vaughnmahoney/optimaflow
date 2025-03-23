
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { ModalHeader } from "./components/ModalHeader";
import { ModalContent } from "./components/ModalContent";
import { ModalFooter } from "./components/ModalFooter";
import { NavigationControls } from "./components/NavigationControls";
import { getStatusBorderColor } from "./utils/modalUtils";
import { useWorkOrderNavigation } from "@/hooks/useWorkOrderNavigation";
import { OrderDetailsTab } from "./tabs/OrderDetailsTab";
import { NotesTab } from "./tabs/NotesTab";
import { SignatureTab } from "./tabs/SignatureTab";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { PenLine, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ImageViewModalProps {
  workOrder: WorkOrder | null;
  workOrders: WorkOrder[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onNavigate: (index: number) => void;
  onDownloadAll?: () => void;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
}

export const ImageViewModal = ({
  workOrder,
  workOrders,
  currentIndex,
  isOpen,
  onClose,
  onStatusUpdate,
  onNavigate,
  onDownloadAll,
  onResolveFlag,
}: ImageViewModalProps) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isQcNotesOpen, setIsQcNotesOpen] = useState(false);
  const [isResolutionNotesOpen, setIsResolutionNotesOpen] = useState(false);
  const [qcNotes, setQcNotes] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const isMobile = useIsMobile();
  
  // Refs for scroll-based tab tracking
  const detailsSectionRef = useRef<HTMLDivElement>(null);
  const notesSectionRef = useRef<HTMLDivElement>(null);
  const signatureSectionRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  
  const {
    currentWorkOrder,
    currentIndex: navIndex,
    currentImageIndex,
    setCurrentImageIndex,
    handlePreviousOrder,
    handleNextOrder,
    handleSetOrder
  } = useWorkOrderNavigation({
    workOrders,
    initialWorkOrderId: workOrder?.id || null,
    isOpen,
    onClose
  });
  
  useEffect(() => {
    if (currentWorkOrder) {
      setQcNotes(currentWorkOrder.qc_notes || "");
      setResolutionNotes(currentWorkOrder.resolution_notes || "");
    }
  }, [currentWorkOrder]);
  
  if (!currentWorkOrder) return null;

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  const completionData = currentWorkOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
  const statusBorderColor = getStatusBorderColor(currentWorkOrder.status || "pending_review");

  const handleNavigate = (index: number) => {
    handleSetOrder(index);
    onNavigate(index);
  };
  
  // Function to handle scrolling to tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case "details":
        detailsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "notes":
        notesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "signature":
        signatureSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
    }
  };
  
  const handleSaveQcNotes = () => {
    if (currentWorkOrder.id && onStatusUpdate) {
      // Save QC notes logic would go here
      console.log("Saving QC notes:", qcNotes);
      setIsQcNotesOpen(false);
    }
  };
  
  const handleSaveResolutionNotes = () => {
    if (currentWorkOrder.id && onResolveFlag) {
      onResolveFlag(currentWorkOrder.id, resolutionNotes);
      setIsResolutionNotesOpen(false);
    }
  };
  
  // Set up scroll observation to update active tab
  useEffect(() => {
    if (!isOpen || !contentScrollRef.current) return;
    
    const options = {
      root: contentScrollRef.current,
      rootMargin: "-50px 0px",
      threshold: 0.1
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === "details-section") {
            setActiveTab("details");
          } else if (id === "notes-section") {
            setActiveTab("notes");
          } else if (id === "signature-section") {
            setActiveTab("signature");
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    
    if (detailsSectionRef.current) observer.observe(detailsSectionRef.current);
    if (notesSectionRef.current) observer.observe(notesSectionRef.current);
    if (signatureSectionRef.current) observer.observe(signatureSectionRef.current);

    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`max-w-6xl p-0 ${isMobile ? 'h-[95vh]' : 'h-[90vh]'} flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor}`}>
          <ModalHeader workOrder={currentWorkOrder} onClose={onClose} />
          
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left side - Image viewer (60% width on desktop, full width on mobile) */}
            <div className={`${isMobile ? 'w-full h-1/2' : 'w-[60%] h-full'} overflow-hidden`}>
              <ModalContent
                workOrder={currentWorkOrder}
                images={images}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
                isImageExpanded={isImageExpanded}
                toggleImageExpand={toggleImageExpand}
              />
            </div>
            
            {/* Right side - Information (40% width on desktop, full width on mobile) */}
            <div className={`${isMobile ? 'w-full h-1/2' : 'w-[40%] h-full'} border-l`}>
              <div className="h-full flex flex-col">
                {/* Horizontal tabs */}
                <div className="flex border-b">
                  <div 
                    className={`px-3 md:px-6 py-3 font-medium cursor-pointer text-sm md:text-base ${activeTab === 'details' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('details')}
                  >
                    Order Details
                  </div>
                  <div 
                    className={`px-3 md:px-6 py-3 font-medium cursor-pointer text-sm md:text-base ${activeTab === 'notes' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('notes')}
                  >
                    Notes
                  </div>
                  <div 
                    className={`px-3 md:px-6 py-3 font-medium cursor-pointer text-sm md:text-base ${activeTab === 'signature' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('signature')}
                  >
                    Signature
                  </div>
                </div>
                
                {/* Tab content with scroll observation */}
                <ScrollArea className="flex-1 overflow-auto" ref={contentScrollRef}>
                  <div className="space-y-4 pt-4">
                    {/* Order Details Section */}
                    <div id="details-section" ref={detailsSectionRef} className="px-4 pb-6 scroll-m-12">
                      <OrderDetailsTab workOrder={currentWorkOrder} />
                    </div>
                    
                    {/* Notes Section */}
                    <div id="notes-section" ref={notesSectionRef} className="px-4 pb-6 scroll-m-12">
                      <NotesTab workOrder={currentWorkOrder} />
                    </div>
                    
                    {/* Signature Section */}
                    <div id="signature-section" ref={signatureSectionRef} className="px-4 pb-6 scroll-m-12">
                      <SignatureTab workOrder={currentWorkOrder} />
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          
          <div className="border-t p-4 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setIsQcNotesOpen(true)}
                className="flex items-center gap-1"
              >
                <PenLine className="h-4 w-4" />
                Edit QC Notes
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setIsResolutionNotesOpen(true)}
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                Edit Resolution Notes
              </Button>
            </div>
            
            <ModalFooter 
              workOrderId={currentWorkOrder.id} 
              onStatusUpdate={onStatusUpdate} 
              onDownloadAll={onDownloadAll}
              hasImages={images.length > 0}
              status={currentWorkOrder.status}
              onResolveFlag={onResolveFlag}
              workOrder={currentWorkOrder}
            />
          </div>
          
          <NavigationControls 
            currentIndex={navIndex}
            totalOrders={workOrders.length}
            onPreviousOrder={handlePreviousOrder}
            onNextOrder={handleNextOrder}
          />
        </DialogContent>
      </Dialog>
      
      {/* QC Notes Sheet */}
      <Sheet open={isQcNotesOpen} onOpenChange={setIsQcNotesOpen}>
        <SheetContent className="w-full md:max-w-md">
          <SheetHeader>
            <SheetTitle>QC Notes</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <textarea
              className="w-full h-40 p-2 border rounded-md"
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              placeholder="Enter QC notes here..."
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveQcNotes}>Save Notes</Button>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Resolution Notes Sheet */}
      <Sheet open={isResolutionNotesOpen} onOpenChange={setIsResolutionNotesOpen}>
        <SheetContent className="w-full md:max-w-md">
          <SheetHeader>
            <SheetTitle>Resolution Notes</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <textarea
              className="w-full h-40 p-2 border rounded-md"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Enter resolution notes here..."
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveResolutionNotes}>Save Notes</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
