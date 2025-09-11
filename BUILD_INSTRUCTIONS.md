# Complete Setup Instructions for Inventory Management System

## Overview
This is a complete inventory management system with client authentication, subscription management, and full admin control. The system is designed to be deployed once and managed entirely through the admin panel.

## 🚀 Quick Setup Guide

### 1. Database Setup (Supabase)

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be fully initialized

2. **Run the SQL Schema**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the entire contents of `database_schema.sql`
   - Click "Run" to execute the schema

3. **Get Your Credentials**
   - Go to Settings > API
   - Copy your:
     - Project URL (`VITE_SUPABASE_URL`)
     - Anon/Public key (`VITE_SUPABASE_ANON_KEY`)

### 2. Environment Configuration

Create a `.env` file in your project root:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the development server (for testing)
npm run dev
```

### 4. Deploy the Application

Deploy the built application to your preferred hosting service:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your repository
- **Traditional hosting**: Upload the `dist` folder contents

## 🔧 System Features

### Client Management
- **Automatic Registration**: Clients register with company name as username
- **Auto-generated Client IDs**: System generates unique IDs for each client
- **Subscription Management**: 30-day cycles with automatic expiration
- **Access Control**: Independent start/stop functionality

### Monthly System
- **Automatic Month Transitions**: Leftover purchases move to next month
- **12-Month Cycles**: After 12 months, data archives and starts fresh
- **Monthly Expenses**: Track expenses by month with previous month display
- **Profit/Loss Tracking**: Automatic calculations replacing pending payments

### Admin Panel Features
- **Client Overview**: View all registered clients
- **Subscription Control**: Start/stop subscriptions independently
- **Access Management**: Control client access separately from subscriptions
- **Credential Management**: Edit client usernames and passwords
- **Real-time Stats**: Active/inactive clients and expiring subscriptions

### Authentication Flow
- **Client Registration**: Company name becomes username
- **Automatic Login**: Use company name and password
- **Subscription Validation**: Automatic access control based on subscription status
- **Expiration Handling**: Custom expiration screen when subscription ends

## 📋 Admin Panel Usage

### Accessing Admin Panel
- URL: `yourapp.com/admin`
- No authentication required (implement if needed)

### Managing Clients
1. **View All Clients**: See complete client list with status
2. **Start/Stop Subscriptions**: 
   - Green button = Start (sets 30-day cycle from current date)
   - Red button = Stop (immediate suspension)
3. **Access Control**: 
   - Play button = Grant access
   - Stop button = Block access (independent of subscription)
4. **Edit Credentials**: Change username/password for clients
5. **Delete Clients**: Permanent removal (with confirmation)

### Subscription Management
- **Automatic Expiration**: Database handles subscription end dates
- **Manual Control**: Override automatic expiration from admin panel
- **Renewal Process**: Starting subscription creates new 30-day cycle from current date

## 🎯 Client User Experience

### Registration Process
1. Client enters company name (becomes username)
2. Sets password
3. Provides contact information
4. System generates unique client ID
5. Company appears in admin panel immediately

### Login Process
1. Use company name as username
2. Enter password
3. System validates subscription and access status
4. Grants access to main application or shows expiration message

### Application Access
- **Active Subscription + Access**: Full application access
- **Expired Subscription**: "Subscription Expired" message
- **Stopped Access**: "Subscription Expired" message
- **Manual Restart**: Access restored when admin starts subscription

## 🔄 Monthly Data Management

### Automatic Processes
- **Month Transition**: Leftover purchases automatically move to next month
- **Year Archive**: After 12 months, previous year data archives to history
- **Fresh Start**: New year begins with clean monthly data
- **Expense Tracking**: Previous month expenses display for reference

### Remove Functionality
- All entries (sales, purchases, expenses) have remove buttons
- Immediate deletion with confirmation
- No database interference with admin controls

## 🛠 Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** component library
- **React Query** for data management

### Backend
- **Supabase** for database and authentication
- **Row Level Security** for data isolation
- **Automatic triggers** for subscription management
- **PostgreSQL** with custom functions

### Security Features
- **Client Data Isolation**: RLS ensures clients only see their data
- **Admin Override**: Admin can access all client data
- **Subscription Validation**: Multiple layers of access control
- **Automatic Expiration**: Database-level subscription management

## 🚨 Important Notes

### Database Management
- **One-Time Setup**: Database schema runs once, no further SQL needed
- **Admin Control**: Everything managed through web interface
- **No Direct Access**: Never need to access database directly
- **Automatic Maintenance**: System handles data archiving and cleanup

### Client Onboarding
1. Send client the application URL
2. Client registers with company name
3. Client appears in your admin panel
4. You control their subscription from admin panel
5. Client uses company name + password to login

### Subscription Workflow
1. **New Client**: 30-day subscription starts automatically
2. **Expiration**: System stops access on end date
3. **Manual Renewal**: You start new 30-day cycle from admin panel
4. **Payment Processing**: Handle payments offline, control access online

## 📞 Support and Maintenance

### Regular Tasks
- Monitor client subscriptions from admin panel
- Manually renew subscriptions after payment
- Review client activity and usage
- Manage access for non-payment situations

### Troubleshooting
- Check Supabase connection status in admin panel
- Verify environment variables are set correctly
- Ensure database schema was executed completely
- Monitor browser console for any JavaScript errors

### Scaling
- System supports unlimited clients
- Automatic data archiving prevents database bloat
- Performance optimized for monthly data cycles
- Admin panel handles large client lists efficiently

## ✅ Final Checklist

- [ ] Supabase project created and configured
- [ ] Database schema executed successfully
- [ ] Environment variables set correctly
- [ ] Application built and deployed
- [ ] Admin panel accessible at `/admin`
- [ ] Test client registration and login
- [ ] Verify subscription controls work
- [ ] Confirm automatic expiration functions

Your inventory management system is now ready for production use! 🎉