# Database Setup Instructions

## Supabase Database Schema

Your inventory management system uses Supabase as the backend database. Here's how to set it up:

### 1. Database Tables Created

The system creates the following tables:

- **clients**: Manages subscription and client information
- **sales_entries**: Records all sales transactions
- **purchase_entries**: Monthly purchase tracking 
- **monthly_expenses**: Monthly expense tracking
- **expense_entries**: General expenses
- **profit_loss**: Automatic profit/loss calculations
- **inventory_items**: Product inventory management
- **groups**: Project/group management
- **group_items**: Items within each group
- **documents**: Generated invoices/challans

### 2. Key Features

**Monthly System**: 
- Purchases and expenses are tracked monthly (Month 1-12)
- Automatically cycles yearly (Month 1-12, then repeats)
- Each month maintains separate records

**Profit/Loss Tracking**:
- Automatically calculates from sales and expenses
- Real-time updates in the Banking tab
- Visual indicators for profit (green) vs loss (red)

**Subscription Management**:
- Each client has unique client_id
- Subscription status: ACTIVE/INACTIVE/SUSPENDED
- Admin panel controls access

### 3. Admin Panel Functions

The admin panel (`/admin`) allows you to:
- Add new clients with unique client IDs
- Activate/deactivate subscriptions
- View all client statuses
- Manage subscription renewals

### 4. Client Access

Clients use their unique client_id to access the system. The software checks subscription status on startup and enables/disables features accordingly.

### 5. Database Migration

If you need to run the database migration manually, execute the SQL commands in the Supabase SQL editor:

```sql
-- The complete schema is available in the migration file
-- Tables will be created with proper RLS policies
-- All necessary indexes and constraints included
```

### 6. Environment Variables

Make sure these are set in your Supabase project:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public key

### 7. Security

- Row Level Security (RLS) is enabled on all tables
- Clients can only access their own data
- Admin functions require proper authentication