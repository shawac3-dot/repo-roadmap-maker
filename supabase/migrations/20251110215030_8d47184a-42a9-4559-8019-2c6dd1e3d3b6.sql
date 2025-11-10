-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  overtime_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employees (public read for demo purposes)
CREATE POLICY "Anyone can view employees" 
ON public.employees 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update employees" 
ON public.employees 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete employees" 
ON public.employees 
FOR DELETE 
USING (true);

-- Create time_entries table
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clock_out TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for time_entries
CREATE POLICY "Anyone can view time entries" 
ON public.time_entries 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create time entries" 
ON public.time_entries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update time entries" 
ON public.time_entries 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete time entries" 
ON public.time_entries 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
BEFORE UPDATE ON public.time_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_time_entries_employee_id ON public.time_entries(employee_id);
CREATE INDEX idx_time_entries_clock_in ON public.time_entries(clock_in DESC);