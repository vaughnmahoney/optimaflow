
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, AlertCircle, CreditCard, Car, 
  Package2, Clock, Users, Receipt, ExternalLink,
  CalendarDays, LucideIcon
} from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";

interface SidebarNavigationProps {
  isCollapsed: boolean;
  searchTerm: string;
  flaggedWorkOrdersCount?: number;
}

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  badge?: number;
}

export function SidebarNavigation({ 
  isCollapsed, 
  searchTerm,
  flaggedWorkOrdersCount = 0
}: SidebarNavigationProps) {
  const location = useLocation();
  
  // Create navigation items
  const navItems: NavItem[] = [
    { 
      to: "/dashboard", 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      isActive: location.pathname === "/dashboard" || location.pathname === "/" 
    },
    { 
      to: "/work-orders", 
      icon: AlertCircle, 
      label: "Quality Control", 
      isActive: location.pathname.startsWith("/work-orders"),
      badge: flaggedWorkOrdersCount > 0 ? flaggedWorkOrdersCount : undefined
    },
    { 
      to: "/payroll", 
      icon: CreditCard, 
      label: "Payroll", 
      isActive: location.pathname.startsWith("/payroll") 
    },
    { 
      to: "/vehicle-maintenance", 
      icon: Car, 
      label: "Vehicle Maintenance", 
      isActive: location.pathname.startsWith("/vehicle-maintenance") 
    },
    {
      to: "/storage", 
      icon: Package2, 
      label: "Storage Units", 
      isActive: location.pathname.startsWith("/storage") || location.pathname.startsWith("/inventory")
    },
    {
      to: "/attendance", 
      icon: Clock, 
      label: "Attendance", 
      isActive: location.pathname.startsWith("/attendance") || location.pathname.startsWith("/supervisor")
    },
    { 
      to: "/employees", 
      icon: Users, 
      label: "Employees", 
      isActive: location.pathname.startsWith("/employees") || location.pathname.startsWith("/admin") 
    },
    { 
      to: "/receipts", 
      icon: Receipt, 
      label: "Receipts", 
      isActive: location.pathname.startsWith("/receipts") || location.pathname.startsWith("/reports")
    },
    { 
      to: "/integrations", 
      icon: ExternalLink, 
      label: "Integrations", 
      isActive: location.pathname.startsWith("/integrations") || location.pathname.startsWith("/api") 
    },
    { 
      to: "/calendar", 
      icon: CalendarDays, 
      label: "Calendar", 
      isActive: location.pathname.startsWith("/calendar")
    },
  ];

  // Filter navigation items based on search
  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <nav className="flex flex-col gap-1">
      {filteredNavItems.map((item) => (
        <SidebarNavItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          isActive={item.isActive}
          isCollapsed={isCollapsed}
          badge={item.badge}
        />
      ))}
    </nav>
  );
}
