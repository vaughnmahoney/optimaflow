
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationState } from "../types";

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination = ({ 
  pagination,
  onPageChange,
  onPageSizeChange
}: PaginationProps) => {
  const { page, pageSize, total } = pagination;
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
  // Ensure current page isn't beyond total pages (can happen when filters reduce total)
  const currentPage = Math.min(page, totalPages);
  if (currentPage !== page) {
    // If current page was adjusted, notify parent
    setTimeout(() => onPageChange(currentPage), 0);
  }
  
  // Calculate displayed page range
  const firstItem = total > 0 ? Math.min((currentPage - 1) * pageSize + 1, total) : 0;
  const lastItem = Math.min(currentPage * pageSize, total);
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-2 border-t">
      <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
        Showing <span className="font-medium">{total > 0 ? firstItem : 0}</span> to{" "}
        <span className="font-medium">{lastItem}</span> of{" "}
        <span className="font-medium">{total}</span> orders
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">Page</span>
            <span className="text-sm font-medium">{currentPage}</span>
            <span className="text-sm text-muted-foreground">of {totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
