# Infrastructure Configuration

This employee scheduler is built using the infrastructure details from the reference repository with Lovable Cloud backend.

## Network Configuration

### Load Balancer
- **IP Address**: `10.48.229.48`
- **Purpose**: Distributes traffic across production deployments
- **Protocol**: TCP/HTTP on port 80

### Cluster IP
- **IP Address**: `10.48.229.139`
- **Purpose**: Development environment access
- **Protocol**: TCP/HTTP on port 80

### NFS Storage
- **Server**: `10.48.228.25`
- **Path**: `/srv/nfs/shawac3`
- **Storage**: 1Gi persistent volume
- **Access Mode**: ReadWriteMany

### Container Registry
- **Image**: `cithit/shawac3:latest`
- **Registry**: Docker Hub
- **Pull Secret**: `roseaw-dockerhub`

## Backend Architecture

### Lovable Cloud (Supabase)
- **Database**: PostgreSQL with real-time capabilities
- **Authentication**: Built-in auth system
- **Storage**: File storage for documents
- **Edge Functions**: Serverless backend logic

### Database Tables

#### employees
- `id`: UUID (primary key)
- `name`: TEXT (not null)
- `email`: TEXT (unique, not null)
- `hourly_rate`: DECIMAL(10,2) (default 0)
- `overtime_rate`: DECIMAL(10,2) (default 0)
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

#### time_entries
- `id`: UUID (primary key)
- `employee_id`: UUID (foreign key to employees)
- `clock_in`: TIMESTAMP WITH TIME ZONE
- `clock_out`: TIMESTAMP WITH TIME ZONE (nullable)
- `notes`: TEXT (nullable)
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

## Deployment Configuration

### Development Deployment (deployment-dev.yaml)
```yaml
# Uses ClusterIP for internal access
# Connected to NFS for data persistence
# Single replica for development
```

### Production Deployment (deployment-prod.yaml)
```yaml
# Uses LoadBalancer for external access
# Connected to NFS for data persistence
# Scalable replicas for production load
```

## Security

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Public read/write access for demo purposes
- Can be restricted to authenticated users if needed

### Data Integrity
- Foreign key constraints ensure referential integrity
- Automatic timestamp updates via database triggers
- Indexed columns for optimal query performance

## Monitoring

### Available Metrics
- Total employees in system
- Active time entries
- Payroll calculations per period
- Overtime hours tracking

### Database Indexes
- `idx_time_entries_employee_id`: Fast employee lookups
- `idx_time_entries_clock_in`: Chronological sorting
