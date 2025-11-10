import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any;
  onSuccess: () => void;
}

export const EmployeeForm = ({ open, onOpenChange, employee, onSuccess }: EmployeeFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: employee || {
      name: "",
      email: "",
      hourly_rate: "",
      overtime_rate: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (employee) {
        const { error } = await supabase
          .from("employees")
          .update(data)
          .eq("id", employee.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employees").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: employee ? "Employee updated" : "Employee added",
        description: `Employee has been ${employee ? "updated" : "added"} successfully.`,
      });
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save employee.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate({
      ...data,
      hourly_rate: parseFloat(data.hourly_rate),
      overtime_rate: parseFloat(data.overtime_rate),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {employee
              ? "Update employee information and pay rates."
              : "Add a new employee to the system with their pay rates."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{String(errors.name.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{String(errors.email.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                {...register("hourly_rate", {
                  required: "Hourly rate is required",
                  min: { value: 0, message: "Rate must be positive" },
                })}
                placeholder="25.00"
              />
              {errors.hourly_rate && (
                <p className="text-sm text-destructive">{String(errors.hourly_rate.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtime_rate">Overtime Rate ($)</Label>
              <Input
                id="overtime_rate"
                type="number"
                step="0.01"
                {...register("overtime_rate", {
                  required: "Overtime rate is required",
                  min: { value: 0, message: "Rate must be positive" },
                })}
                placeholder="37.50"
              />
              {errors.overtime_rate && (
                <p className="text-sm text-destructive">{String(errors.overtime_rate.message)}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : employee ? "Update" : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
