
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Group } from "@/types/groups";

export const useAttendanceCounts = (groups: Group[], date: string) => {
  return useQuery({
    queryKey: ['attendance-counts', date],
    queryFn: async () => {
      const { data: counts, error } = await supabase
        .from('group_attendance_counts')
        .select('group_id, total_count, completed_count')
        .eq('date', date);

      if (error) {
        console.error('Error fetching attendance counts:', error);
        throw error;
      }

      const groupCounts: Record<string, { completed: number; total: number }> = {};
      
      // Initialize counts for all groups
      groups.forEach(group => {
        groupCounts[group.id] = { completed: 0, total: 0 };
      });

      // Update counts from the database
      counts?.forEach(count => {
        if (count.group_id && groupCounts[count.group_id]) {
          groupCounts[count.group_id] = {
            completed: count.completed_count || 0,
            total: count.total_count || 0,
          };
        }
      });

      return groupCounts;
    },
  });
};
