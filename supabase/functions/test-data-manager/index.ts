import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Employee {
  name: string;
  email: string;
  hourly_rate: number;
  overtime_rate: number;
}

interface TimeEntry {
  employee_id: string;
  clock_in: string;
  clock_out: string;
  notes: string;
}

Deno.serve(async (req) => {
  console.log('Test data manager invoked:', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { action } = await req.json()
    console.log('Action requested:', action)

    if (action === 'generate') {
      // Generate test employees
      const testEmployees: Employee[] = [
        { name: 'Test Employee 1', email: 'test1@example.com', hourly_rate: 25.00, overtime_rate: 37.50 },
        { name: 'Test Employee 2', email: 'test2@example.com', hourly_rate: 30.00, overtime_rate: 45.00 },
        { name: 'Test Employee 3', email: 'test3@example.com', hourly_rate: 20.00, overtime_rate: 30.00 },
      ]

      console.log('Inserting test employees...')
      const { data: employees, error: employeeError } = await supabaseClient
        .from('employees')
        .insert(testEmployees)
        .select()

      if (employeeError) {
        console.error('Error inserting employees:', employeeError)
        throw employeeError
      }

      console.log(`Inserted ${employees.length} test employees`)

      // Generate test time entries for each employee
      const now = new Date()
      const testTimeEntries: TimeEntry[] = employees.flatMap(emp => [
        {
          employee_id: emp.id,
          clock_in: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
          clock_out: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          notes: 'Test shift 1'
        },
        {
          employee_id: emp.id,
          clock_in: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          clock_out: new Date(now.getTime() - 16 * 60 * 60 * 1000).toISOString(),
          notes: 'Test shift 2'
        }
      ])

      console.log('Inserting test time entries...')
      const { data: timeEntries, error: timeError } = await supabaseClient
        .from('time_entries')
        .insert(testTimeEntries)
        .select()

      if (timeError) {
        console.error('Error inserting time entries:', timeError)
        throw timeError
      }

      console.log(`Inserted ${timeEntries.length} test time entries`)

      return new Response(
        JSON.stringify({
          success: true,
          message: `Generated ${employees.length} employees and ${timeEntries.length} time entries`,
          employees: employees.length,
          timeEntries: timeEntries.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (action === 'clear') {
      // Delete test data (emails starting with 'test')
      console.log('Deleting test time entries...')
      
      // First, get test employee IDs
      const { data: testEmployees, error: fetchError } = await supabaseClient
        .from('employees')
        .select('id')
        .like('email', 'test%@example.com')

      if (fetchError) {
        console.error('Error fetching test employees:', fetchError)
        throw fetchError
      }

      const testEmployeeIds = testEmployees.map(emp => emp.id)
      console.log(`Found ${testEmployeeIds.length} test employees`)

      // Delete their time entries
      const { error: timeError } = await supabaseClient
        .from('time_entries')
        .delete()
        .in('employee_id', testEmployeeIds)

      if (timeError) {
        console.error('Error deleting time entries:', timeError)
        throw timeError
      }

      console.log('Deleting test employees...')
      const { error: employeeError } = await supabaseClient
        .from('employees')
        .delete()
        .like('email', 'test%@example.com')

      if (employeeError) {
        console.error('Error deleting employees:', employeeError)
        throw employeeError
      }

      console.log('Test data cleared successfully')

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test data cleared successfully',
          employeesDeleted: testEmployeeIds.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(`Invalid action: ${action}. Use 'generate' or 'clear'`)
    }
  } catch (error) {
    console.error('Error in test-data-manager:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
