# Database Setup Instructions

## Complete SQL Schema

Run the following SQL in your Supabase SQL editor to set up the complete database:

**File: `database_schema.sql` contains the complete schema with:**

1. **Client authentication system** with username/password
2. **Subscription management** with auto-expiration
3. **Monthly accounting system** (purchases by month 1-12)
4. **Profit/Loss tracking** with automatic calculations  
5. **Inventory management** (without low stock alerts)
6. **Document generation** support (invoices, challans, balance sheets)
7. **Row-level security** for data isolation
8. **Admin controls** for subscription management

## Key Features Implemented

### Authentication System
- Clients register with username/password
- Auto-generated client IDs (CLI_XXXXXXXX)
- Subscription status tracking (ACTIVE/INACTIVE/SUSPENDED)
- Access control (admin can start/stop access independently)

### Monthly System
- Purchases tracked by month number (1-12)
- Auto-renewal every month
- Previous month data preserved
- Yearly cycle (months 1-12, then repeats)

### Subscription Management
- Subscription end dates with proper handling (e.g., 28 Sep - 28 Oct)
- If subscription ends on 31st but month has 30 days, expires on 1st
- Admin panel controls (start/stop/suspend)
- Automatic expiration when date arrives
- Manual control overrides automatic system

### Accounts System
- **Sales**: All sales entries with payment status
- **Purchases**: Monthly purchases (Month 1-12 dropdown)
- **Monthly Expenses**: Separate from general expenses
- **Expenses**: General business expenses  
- **Profit/Loss**: Auto-calculated from sales and expenses
- **Assets**: Current and fixed assets tracking
- **Banking**: Cash flow and bank balance management
- **Taxes**: Tax compliance and reporting

### Document Generation
- **Invoices**: Complete invoice with seller/buyer details
- **Challans**: Delivery challans with all required fields:
  - Challan number, date
  - Sender details (supplier/exporter)
  - Receiver details (buyer/importer)  
  - Goods description, batch/lot numbers
  - Quantity, weight, units
  - Transport details (truck number, driver name, courier)
  - Signature areas for sender & receiver
- **Balance Sheets**: Assets, liabilities, equity

### Admin Panel Features
- View all clients with status
- Generate new client IDs
- Start/stop subscriptions
- Rename clients
- Control access independently of subscription
- Monitor subscription expiration
- Search and filter clients

## Database Tables Created

1. `clients` - Authentication and subscription management
2. `sales_entries` - Sales records
3. `purchase_entries` - Monthly purchases (by month 1-12)  
4. `monthly_expenses` - Monthly expense tracking
5. `expense_entries` - General expenses
6. `profit_loss` - Auto-calculated profit/loss by month
7. `inventory_items` - Inventory without low stock alerts
8. `groups` - Project/group management (for scanner features)
9. `group_items` - Items within groups
10. `documents` - Generated documents storage
11. `challans` - Detailed challan information

## Row Level Security (RLS)

- All tables have RLS enabled
- Clients can only access their own data
- Admin has full access to all data
- Service functions bypass RLS for system operations

## Automatic Functions

1. **Profit/Loss Calculation**: Auto-updates when sales/expenses change
2. **Subscription Expiration**: Daily check for expired subscriptions  
3. **Client ID Generation**: Automatic unique ID creation

## Setup Instructions

1. **Create Supabase Project**
2. **Run the SQL Schema** from `database_schema.sql`
3. **Set Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Build and Deploy** the application

The system is now ready with full authentication, subscription management, accounting, and document generation capabilities.