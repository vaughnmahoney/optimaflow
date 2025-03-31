import { Card, CardContent } from "@/components/ui/card";
import { Check, Flag, Clock, CheckCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatusFilterCardsProps {
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  statusCounts: {
    approved: number;
    pending_review: number;
    flagged: number;
    resolved: number;
    rejected: number;
    all?: number;
  };
}

export const StatusFilterCards = ({
  statusFilter,
  onStatusFilterChange,
  statusCounts,
}: StatusFilterCardsProps) => {
  const isMobile = useIsMobile();
  
  const statuses = [
    { 
      label: "Approved", 
      value: "approved", 
      icon: Check, 
      color: "bg-green-500",
      ringColor: "ring-green-500",
      hoverColor: "hover:bg-green-600",
      textColor: "text-green-500",
      lightBg: "bg-green-50"
    },
    { 
      label: "Pending Review", 
      value: "pending_review", 
      icon: Clock, 
      color: "bg-yellow-500",
      ringColor: "ring-yellow-500",
      hoverColor: "hover:bg-yellow-600",
      textColor: "text-yellow-500",
      lightBg: "bg-yellow-50"
    },
    { 
      label: "Flagged", 
      value: "flagged", 
      icon: Flag, 
      color: "bg-red-500",
      ringColor: "ring-red-500",
      hoverColor: "hover:bg-red-600",
      textColor: "text-red-500",
      lightBg: "bg-red-50"
    },
    { 
      label: "Resolved", 
      value: "resolved", 
      icon: CheckCheck, 
      color: "bg-blue-500",
      ringColor: "ring-blue-500",
      hoverColor: "hover:bg-blue-600",
      textColor: "text-blue-500",
      lightBg: "bg-blue-50"
    },
    { 
      label: "Rejected", 
      value: "rejected", 
      icon: AlertTriangle, 
      color: "bg-orange-500",
      ringColor: "ring-orange-500",
      hoverColor: "hover:bg-orange-600",
      textColor: "text-orange-500",
      lightBg: "bg-orange-50"
    },
  ];

  if (isMobile) {
    return (
      <div className="mb-4 overflow-x-auto pb-2">
        <div className="flex space-x-2 min-w-max">
          {statuses.map((status) => {
            const isActive = statusFilter === status.value;
            const count = statusCounts[status.value] || 0;
            
            return (
              <button
                key={status.value}
                onClick={() => onStatusFilterChange(
                  statusFilter === status.value ? null : status.value
                )}
                className={cn(
                  "flex items-center space-x-2 py-1.5 px-3 rounded-full transition-all",
                  isActive 
                    ? `${status.color} text-white shadow-md`
                    : `bg-white border border-gray-200 hover:border-gray-300 shadow-sm`
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full",
                  isActive ? "bg-white/20" : status.color
                )}>
                  <status.icon 
                    size={14}
                    className={isActive ? "text-white" : "text-white"} 
                  />
                </div>
                <span className="text-sm font-medium">{status.label}</span>
                {count > 0 && (
                  <span className={cn(
                    "inline-flex items-center justify-center text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[20px]",
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-100 text-gray-700"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 w-full mb-2 sm:mb-4">
      {statuses.map((status) => {
        const isActive = statusFilter === status.value;
        const count = statusCounts[status.value] || 0;
        
        return (
          <Card 
            key={status.value}
            className={cn(
              "cursor-pointer transition-all overflow-hidden group shadow-sm hover:shadow-md",
              isActive 
                ? `ring-2 ring-offset-1 sm:ring-offset-2 ${status.ringColor}` 
                : `hover:translate-y-[-2px] ${status.hoverColor}`
            )}
            onClick={() => onStatusFilterChange(
              statusFilter === status.value ? null : status.value
            )}
          >
            <div 
              className={cn(
                "h-1.5 w-full", 
                status.color
              )}
              aria-hidden="true"
            />
            <CardContent className={cn(
              "p-3 sm:p-4 flex items-center justify-between transition-colors",
              isActive ? `${status.color} text-white` : cn("bg-white", status.lightBg)
            )}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full",
                  isActive ? "bg-white/20" : status.color
                )}>
                  <status.icon 
                    size={isMobile ? 16 : 18} 
                    className={isActive ? "text-white" : "text-white"} 
                  />
                </div>
                <h3 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{status.label}</h3>
              </div>
              
              {/* Count badges */}
              <div className={cn(
                "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-medium shadow-sm",
                isActive ? "bg-white text-gray-800" : `bg-white ${status.textColor} border border-gray-100`
              )}>
                {count}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
