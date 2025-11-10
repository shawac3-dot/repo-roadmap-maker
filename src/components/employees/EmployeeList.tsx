import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { EmployeeForm } from "./EmployeeForm";
import { EmployeeCard } from "./EmployeeCard";
import { useToast } from "@/hooks/use-toast";

export const EmployeeList = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Employee deleted",
        description: "The employee has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete employee.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>Manage your workforce and payroll rates</CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingEmployee(null);
                setIsFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading employees...</p>
          ) : employees && employees.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No employees added yet</p>
              <Button
                onClick={() => {
                  setEditingEmployee(null);
                  setIsFormOpen(true);
                }}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Employee
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        employee={editingEmployee}
        onSuccess={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }}
      />
    </div>
  );
};
