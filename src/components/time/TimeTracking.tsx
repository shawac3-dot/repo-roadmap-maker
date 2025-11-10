import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TimeEntryList } from "./TimeEntryList";
import { format } from "date-fns";

interface TimeTrackingProps {
  employees: any[];
}

export const TimeTracking = ({ employees }: TimeTrackingProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeEntry } = useQuery({
    queryKey: ["activeEntry", selectedEmployee],
    queryFn: async () => {
      if (!selectedEmployee) return null;
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("employee_id", selectedEmployee)
        .is("clock_out", null)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!selectedEmployee,
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("time_entries").insert([
        {
          employee_id: selectedEmployee,
          clock_in: new Date().toISOString(),
          notes: notes || null,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeEntry"] });
      queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      toast({
        title: "Clocked In",
        description: `Successfully clocked in at ${format(new Date(), "h:mm a")}`,
      });
      setNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clock in.",
        variant: "destructive",
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      if (!activeEntry) return;
      const { error } = await supabase
        .from("time_entries")
        .update({ clock_out: new Date().toISOString() })
        .eq("id", activeEntry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeEntry"] });
      queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      toast({
        title: "Clocked Out",
        description: `Successfully clocked out at ${format(new Date(), "h:mm a")}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clock out.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Clock
          </CardTitle>
          <CardDescription>Track employee work hours and clock in/out times</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Employee</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this shift..."
                  rows={3}
                />
              </div>

              {activeEntry ? (
                <div className="space-y-4">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-success-foreground">Currently Clocked In</p>
                    <p className="text-2xl font-bold mt-1">
                      {format(new Date(activeEntry.clock_in), "h:mm a")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(activeEntry.clock_in), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <Button
                    onClick={() => clockOutMutation.mutate()}
                    disabled={clockOutMutation.isPending}
                    variant="destructive"
                    className="w-full gap-2"
                    size="lg"
                  >
                    <LogOut className="h-5 w-5" />
                    Clock Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => clockInMutation.mutate()}
                  disabled={clockInMutation.isPending}
                  className="w-full gap-2"
                  size="lg"
                >
                  <LogIn className="h-5 w-5" />
                  Clock In
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedEmployee && <TimeEntryList employeeId={selectedEmployee} />}
    </div>
  );
};
