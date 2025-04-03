
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkOrder } from "@/components/workorders/types";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { StatusBadge } from "@/components/workorders/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { PaginationIndicator } from "./PaginationIndicator";

interface WorkOrderTableProps {
  workOrders: WorkOrder[] | undefined;
  isLoading: boolean;
  onStatusUpdate: (workOrderId: string, newStatus: string, options?: any) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  statusCounts: { [key: string]: number };
  sortField: string;
  sortDirection: string;
  onSort: (field: string, direction: string) => void;
  pagination: any;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onColumnFilterChange: (columnId: string, value: string) => void;
  clearColumnFilter: (columnId: string) => void;
  clearAllFilters: () => void;
  onResolveFlag: (workOrderId: string, resolution: string, options?: any) => void;
}

export function WorkOrderTable({
  workOrders,
  isLoading,
  onStatusUpdate,
  onImageView,
  onDelete,
  statusCounts,
  sortField,
  sortDirection,
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  onColumnFilterChange,
  clearColumnFilter,
  clearAllFilters,
  onResolveFlag
}: WorkOrderTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<WorkOrder>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "order_no",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            Order #
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="w-[80px]">{row.getValue("order_no")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          completionStatus={row.original.completion_status}
          workOrderId={row.original.id}
          onStatusUpdate={onStatusUpdate}
          onResolveFlag={onResolveFlag}
        />
      ),
    },
    {
      accessorKey: "search_response.scheduleInformation.address",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            Address
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        // Use optional chaining to safely access possibly undefined properties
        const address = row.original.search_response?.scheduleInformation?.address ||
                      row.original.location?.address;
        return <div className="max-w-[200px] truncate">{address || "N/A"}</div>;
      },
    },
    {
      accessorKey: "search_response.scheduleInformation.city",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => {
                column.toggleSorting(column.getIsSorted() === "asc");
              }}
            >
              City
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        // Use optional chaining to safely access possibly undefined properties
        const city = row.original.search_response?.scheduleInformation?.city ||
                   row.original.location?.city;
        return <div className="max-w-[100px] truncate">{city || "N/A"}</div>;
      },
    },
    {
      accessorKey: "search_response.scheduleInformation.state",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => {
                column.toggleSorting(column.getIsSorted() === "asc");
              }}
            >
              State
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        // Use optional chaining to safely access possibly undefined properties
        const state = row.original.search_response?.scheduleInformation?.state ||
                    row.original.location?.state;
        return <div>{state || "N/A"}</div>;
      },
    },
    {
      accessorKey: "search_response.scheduleInformation.zip",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => {
                column.toggleSorting(column.getIsSorted() === "asc");
              }}
            >
              Zip
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        // Use optional chaining to safely access possibly undefined properties
        const zip = row.original.search_response?.scheduleInformation?.zip ||
                  row.original.location?.zip;
        return <div>{zip || "N/A"}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const workOrder = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onImageView(workOrder.id)}
                >
                  View Images
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(workOrder.id)}
                  className="text-red-500"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: workOrders || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter order numbers..."
          value={(table.getColumn("order_no")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("order_no")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          variant="ghost"
          onClick={() => clearAllFilters()}
          className="ml-2"
        >
          Clear Filters
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuItem
                    key={column.id}
                    className="flex items-center"
                    onClick={() => {
                      column.toggleVisibility();
                    }}
                  >
                    <Checkbox
                      checked={column.getIsVisible()}
                      className="mr-2"
                    />
                    {column.id}
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <tr>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Loading..." : "No results."}
                </TableCell>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
      <PaginationIndicator
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </div>
  );
}
