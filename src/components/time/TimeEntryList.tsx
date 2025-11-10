import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { Clock } from "lucide-react";

interface TimeEntryListProps {
  employeeId: string;
}

export const TimeEntryList = ({ employeeId }: TimeEntryListProps) => {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["timeEntries", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*, employees(name)")
        .eq("employee_id", employeeId)
        .order("clock_in", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const calculateDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return "In Progress";
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const hours = differenceInHours(end, start);
    const minutes = differenceInMinutes(end, start) % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Time Entries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Loading entries...</p>
        ) : entries && entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{format(new Date(entry.clock_in), "MMMM d, yyyy")}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>In: {format(new Date(entry.clock_in), "h:mm a")}</span>
                    {entry.clock_out && (
                      <span>Out: {format(new Date(entry.clock_out), "h:mm a")}</span>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground italic">{entry.notes}</p>
                  )}
                </div>
                <Badge variant={entry.clock_out ? "secondary" : "default"}>
                  {calculateDuration(entry.clock_in, entry.clock_out)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No time entries yet</p>
        )}
      </CardContent>
    </Card>
  );
};
