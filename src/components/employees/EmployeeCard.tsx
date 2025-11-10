import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, DollarSign } from "lucide-react";

interface EmployeeCardProps {
  employee: {
    id: string;
    name: string;
    email: string;
    hourly_rate: number;
    overtime_rate: number;
  };
  onEdit: (employee: any) => void;
  onDelete: (id: string) => void;
}

export const EmployeeCard = ({ employee, onEdit, onDelete }: EmployeeCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{employee.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Mail className="h-3 w-3" />
              {employee.email}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <DollarSign className="h-3 w-3" />
              ${employee.hourly_rate}/hr
            </Badge>
            <Badge variant="outline" className="gap-1">
              OT: ${employee.overtime_rate}/hr
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(employee)}
          className="flex-1 gap-2"
        >
          <Edit className="h-3 w-3" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(employee.id)}
          className="flex-1 gap-2"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
