
/**
 * Types related to filtering functionality
 */
export interface WorkOrderFilters {
  status: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  driver: string | null;
  location: string | null;
  orderNo: string | null;
  searchQuery?: string; // Keeping for backward compatibility but will deprecate
}

export interface ColumnFilterProps {
  column: string;
  value: any;
  onChange: (value: any) => void;
  onClear: () => void;
}
