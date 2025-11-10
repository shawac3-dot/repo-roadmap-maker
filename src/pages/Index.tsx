import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { TimeTracking } from "@/components/time/TimeTracking";
import { PayrollSummary } from "@/components/payroll/PayrollSummary";
import { Users, Clock, DollarSign, Server } from "lucide-react";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [activeTab, setActiveTab] = useState("employees");

  const { data: employees } = useQuery({
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Employee Scheduler</h1>
              <p className="text-muted-foreground mt-1">Track time, manage payroll, and schedule employees</p>
            </div>
            <div className="flex items-center gap-4">
              <Card className="px-4 py-2 bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-muted-foreground text-xs">Load Balancer</p>
                    <p className="font-mono font-semibold">10.48.229.48</p>
                  </div>
                </div>
              </Card>
              <Card className="px-4 py-2 bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4 text-info" />
                  <div>
                    <p className="text-muted-foreground text-xs">Cluster IP</p>
                    <p className="font-mono font-semibold">10.48.229.139</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Tracking
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payroll
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <EmployeeList />
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <TimeTracking employees={employees || []} />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <PayrollSummary />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
