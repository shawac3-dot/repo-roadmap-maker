import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";
import { differenceInHours, startOfMonth, endOfMonth } from "date-fns";

export const PayrollSummary = () => {
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ["payrollSummary"],
    queryFn: async () => {
      const startDate = startOfMonth(new Date()).toISOString();
      const endDate = endOfMonth(new Date()).toISOString();

      const { data: entries, error: entriesError } = await supabase
        .from("time_entries")
        .select("*, employees(*)")
        .gte("clock_in", startDate)
        .lte("clock_in", endDate)
        .not("clock_out", "is", null);

      if (entriesError) throw entriesError;

      const { data: employees, error: employeesError } = await supabase
        .from("employees")
        .select("*");

      if (employeesError) throw employeesError;

      // Calculate payroll
      const employeePayroll = employees.map((emp) => {
        const empEntries = entries.filter((e: any) => e.employee_id === emp.id);
        let totalHours = 0;
        let regularHours = 0;
        let overtimeHours = 0;

        empEntries.forEach((entry: any) => {
          const hours = differenceInHours(
            new Date(entry.clock_out),
            new Date(entry.clock_in)
          );
          totalHours += hours;
          
          // Assuming 40 hours per week is regular time
          if (regularHours < 40) {
            const remaining = 40 - regularHours;
            regularHours += Math.min(hours, remaining);
            if (hours > remaining) {
              overtimeHours += hours - remaining;
            }
          } else {
            overtimeHours += hours;
          }
        });

        const regularPay = regularHours * emp.hourly_rate;
        const overtimePay = overtimeHours * emp.overtime_rate;
        const totalPay = regularPay + overtimePay;

        return {
          ...emp,
          totalHours,
          regularHours,
          overtimeHours,
          regularPay,
          overtimePay,
          totalPay,
        };
      });

      const totalPayroll = employeePayroll.reduce((sum, emp) => sum + emp.totalPay, 0);
      const totalHours = employeePayroll.reduce((sum, emp) => sum + emp.totalHours, 0);
      const totalOvertime = employeePayroll.reduce((sum, emp) => sum + emp.overtimeHours, 0);

      return {
        employeePayroll,
        totalPayroll,
        totalHours,
        totalOvertime,
        employeeCount: employees.length,
      };
    },
  });

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading payroll data...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payrollData?.totalPayroll.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollData?.totalHours || 0}h</div>
            <p className="text-xs text-muted-foreground mt-1">Regular & overtime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollData?.totalOvertime || 0}h</div>
            <p className="text-xs text-muted-foreground mt-1">Above 40h/week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollData?.employeeCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active staff</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Payroll Breakdown</CardTitle>
          <CardDescription>Detailed pay information for each employee this month</CardDescription>
        </CardHeader>
        <CardContent>
          {payrollData?.employeePayroll && payrollData.employeePayroll.length > 0 ? (
            <div className="space-y-4">
              {payrollData.employeePayroll.map((emp: any) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{emp.name}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Regular: {emp.regularHours}h @ ${emp.hourly_rate}/h</span>
                      <span>OT: {emp.overtimeHours}h @ ${emp.overtime_rate}/h</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${emp.totalPay.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{emp.totalHours}h total</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No payroll data for this month</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
