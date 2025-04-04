
import { User } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

export function UserDisplay() {
  const { session } = useAuth();
  const isMobile = useIsMobile();
  
  // Extract username from email (removing @example.com part for usernames like "admin@example.com")
  const email = session?.user?.email || "";
  const username = email.split('@')[0] || "User";
  
  // Get first letter of username for avatar fallback
  const firstLetter = username.charAt(0).toUpperCase();
  
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/10 text-primary">
          {firstLetter}
        </AvatarFallback>
      </Avatar>
      {!isMobile && (
        <span className="text-sm font-medium">
          {username}
        </span>
      )}
    </div>
  );
}
