# Employee Scheduler

A comprehensive employee scheduling and payroll management system with time tracking capabilities. Built with React, TypeScript, and Lovable Cloud (Supabase backend).

## Features

### 👥 Employee Management
- Add, edit, and delete employees
- Track employee details (name, email)
- Set individual hourly rates and overtime rates
- Unique email validation

### ⏰ Time Tracking
- Clock in/out functionality for employees
- Optional shift notes
- View recent time entries per employee
- Calculate work duration automatically
- Prevent duplicate clock-ins

### 💰 Payroll Management
- Automatic calculation of regular and overtime hours
- Overtime tracking (hours over 40/week)
- Monthly payroll summaries
- Individual employee payroll breakdowns
- Real-time rate calculations

### 🖥️ Infrastructure Integration
- **Load Balancer IP**: `10.48.229.48` (Production)
- **Cluster IP**: `10.48.229.139` (Development)
- **NFS Storage**: `10.48.228.25:/srv/nfs/shawac3`
- **Container Image**: `cithit/shawac3:latest`

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL with Row Level Security
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form
- **Build Tool**: Vite
- **Deployment**: Kubernetes with NFS persistence

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Access to Lovable Cloud

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Database Setup

The database is automatically configured through Lovable Cloud with the following tables:

- **employees**: Store employee information and pay rates
- **time_entries**: Track clock-in/out times and work sessions

Row Level Security (RLS) is enabled on all tables for data protection.

## Usage

### Adding Employees

1. Navigate to the **Employees** tab
2. Click **Add Employee**
3. Fill in:
   - Full Name
   - Email Address
   - Hourly Rate ($/hour)
   - Overtime Rate ($/hour for hours over 40/week)
4. Click **Add Employee** to save

### Tracking Time

1. Go to the **Time Tracking** tab
2. Select an employee from the dropdown
3. Add optional notes about the shift
4. Click **Clock In** to start tracking
5. Click **Clock Out** when the shift ends

### Viewing Payroll

1. Navigate to the **Payroll** tab
2. View summary cards showing:
   - Total payroll for current month
   - Total hours worked
   - Overtime hours
   - Employee count
3. Scroll down for individual employee payroll breakdowns

## Infrastructure Details

See [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) for complete infrastructure configuration including:
- Network topology
- Database schema
- Deployment configurations
- Security policies

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing criteria including:
- Functional tests for all features
- Performance benchmarks
- Data integrity validation
- Integration testing workflows
- Security test cases

### Quick Test Checklist

- [ ] Add employee with valid data
- [ ] Edit employee information
- [ ] Delete employee
- [ ] Clock in for employee
- [ ] Clock out for employee
- [ ] View time entry history
- [ ] Check payroll calculations
- [ ] Verify overtime calculation (>40 hours)
- [ ] Test with multiple employees
- [ ] Validate infrastructure IPs display correctly

## Project Structure

```
src/
├── components/
│   ├── employees/       # Employee management components
│   │   ├── EmployeeList.tsx
│   │   ├── EmployeeCard.tsx
│   │   └── EmployeeForm.tsx
│   ├── time/           # Time tracking components
│   │   ├── TimeTracking.tsx
│   │   └── TimeEntryList.tsx
│   ├── payroll/        # Payroll components
│   │   └── PayrollSummary.tsx
│   └── ui/             # shadcn UI components
├── pages/
│   ├── Index.tsx       # Main application page
│   └── NotFound.tsx    # 404 page
├── integrations/
│   └── supabase/       # Auto-generated Supabase client
└── hooks/              # Custom React hooks
```

## Deployment

### Development Environment
Accessible via Cluster IP: `10.48.229.139`

### Production Environment
Accessible via Load Balancer IP: `10.48.229.48`

### Kubernetes Deployment
Uses the deployment configurations from the reference repository:
- `deployment-dev.yaml` for development
- `deployment-prod.yaml` for production

Both deployments use NFS for data persistence ensuring data survives pod restarts.

## API Documentation

### Employees Table
```typescript
interface Employee {
  id: string;           // UUID
  name: string;         // Full name
  email: string;        // Unique email
  hourly_rate: number;  // Regular hourly rate
  overtime_rate: number; // Overtime hourly rate
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}
```

### Time Entries Table
```typescript
interface TimeEntry {
  id: string;          // UUID
  employee_id: string; // Foreign key to employees
  clock_in: string;    // ISO timestamp
  clock_out: string | null; // ISO timestamp or null
  notes: string | null; // Optional shift notes
  created_at: string;  // ISO timestamp
  updated_at: string;  // ISO timestamp
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (see TESTING.md)
5. Submit a pull request

## Support

For issues or questions:
- Check [TESTING.md](./TESTING.md) for troubleshooting
- Review [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) for configuration details
- Open an issue in the repository

## License

This project is built with Lovable and follows standard open-source practices.

## Acknowledgments

Based on infrastructure from the CIT 225 Lab 4-2 project at Miami University, extended with modern web technologies and comprehensive employee scheduling features.
