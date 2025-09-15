# InviX - Professional Inventory Management System

A comprehensive inventory and accounting management system built with React, TypeScript, and Supabase. Features multi-client architecture, financial management, document generation, and scanner integration capabilities.

## 🚀 Features

### 🔐 **Multi-Client Authentication**
- Client registration and login system
- Secure admin panel with dedicated authentication
- Subscription management with automatic expiration
- Data isolation between clients

### 💰 **Financial Management**
- **Sales Tracking**: Record sales with payment status tracking
- **Purchase Management**: Monthly purchase tracking (1-12 months)
- **Expense Management**: Monthly and general expense tracking
- **Profit/Loss Reports**: Automatic calculation and visualization
- **Balance Sheets**: Comprehensive asset and liability management
- **Banking Module**: Cash flow and bank balance tracking
- **Tax Management**: Sales tax, income tax, export rebates, customs duty

### 📦 **Inventory Management**
- Product tracking with stock levels
- Search and filter capabilities
- Real-time inventory updates
- Multi-client inventory isolation

### 📄 **Document Generation**
- **Professional Invoices**: Complete invoice generation with taxes
- **Delivery Challans**: Transport details, goods description, batch numbers
- **Balance Sheets**: Auto-generated financial statements
- **Print/Export Ready**: Professional formatting for business use

### 🗂️ **Projects & Groups**
- Group/project management system
- QR code generation framework
- ESP32 scanner integration ready
- Real-time tracking capabilities

### 📊 **History & Reports**
- Complete project archive system
- Excel/CSV export functionality
- Historical data analytics
- Search and filter capabilities

## 🛠 **Technology Stack**

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, RLS)
- **State Management**: React Context, TanStack Query
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Package Manager**: npm/yarn

## 📋 **Prerequisites**

Before setting up the project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Supabase account** (free tier available)
- **Git** for version control

## 🔧 **Installation & Setup**

### 1. **Clone the Repository**
```bash
git clone <your-repository-url>
cd invix-inventory-system
```

### 2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

### 3. **Supabase Setup**

#### A. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Wait for the project to be fully provisioned
4. Note down your **Project URL** and **Anon Key**

#### B. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### C. Database Schema Setup
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the complete schema from `database_schema.sql`
4. This will create all tables, policies, functions, and triggers

### 4. **Admin Account Setup**
The system comes with a pre-configured admin account:
- **Username**: `admin`
- **Password**: `invixop32#*@`
- **Access URL**: `http://localhost:5173/secure-admin`

### 5. **Run the Development Server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🏗️ **Project Structure**

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AccountsModule.tsx
│   ├── InventoryModule.tsx
│   ├── DocumentsModule.tsx
│   ├── GroupsModule.tsx
│   ├── HistoryModule.tsx
│   ├── Dashboard.tsx
│   ├── LoginForm.tsx
│   ├── AdminLogin.tsx
│   └── SubscriptionExpired.tsx
├── contexts/           # React context providers
│   ├── AuthContext.tsx
│   └── AdminAuthContext.tsx
├── pages/              # Main page components
│   ├── Index.tsx
│   ├── AdminPanel.tsx
│   └── NotFound.tsx
├── lib/                # Utility libraries
│   ├── auth.ts
│   ├── supabase.ts
│   └── utils.ts
├── integrations/       # External service integrations
│   └── supabase/
└── hooks/              # Custom React hooks
```

## 🎯 **Usage Guide**

### **Client Access**
1. Navigate to the main application
2. Register a new company account or login with existing credentials
3. Access all inventory and financial management features
4. Generate documents, manage inventory, and track finances

### **Admin Access**
1. Navigate to `/secure-admin`
2. Login with admin credentials:
   - Username: `admin`
   - Password: `invixop32#*@`
3. Manage client accounts, subscriptions, and system settings

### **Key Features Usage**

#### **Financial Management**
- Navigate to **Accounts** tab
- Add sales, purchases, and expenses
- View automatic profit/loss calculations
- Generate balance sheets and financial reports

#### **Inventory Tracking**
- Use **Inventory** tab to manage products
- Add items with stock levels
- Track inventory movements
- Monitor stock levels

#### **Document Generation**
- Access **Documents** tab
- Create professional invoices and challans
- Auto-generate balance sheets
- Export documents for printing

## 🔒 **Security Features**

- **Row Level Security (RLS)**: Database-level data isolation
- **Admin Authentication**: Secure admin panel access
- **Session Management**: Secure session handling
- **Data Validation**: Input sanitization and validation
- **Subscription Control**: Automatic access management

## 🚀 **Deployment**

### **Production Environment Variables**
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### **Build for Production**
```bash
npm run build
# or
yarn build
```

### **Deploy Options**
- **Netlify**: Connect your Git repository
- **Vercel**: Import project from Git
- **Railway**: Deploy with automatic builds
- **Self-hosted**: Deploy `dist/` folder to your server

## 📚 **Database Schema**

The system uses a comprehensive PostgreSQL schema with:

### **Core Tables**
- `clients` - Client accounts and subscription management
- `admin_users` - Admin authentication
- `sales_entries` - Sales transaction records
- `purchase_entries` - Purchase records by month
- `monthly_expenses` - Monthly expense tracking
- `expense_entries` - General expense records
- `inventory_items` - Product inventory
- `groups` - Project/group management
- `documents` - Generated documents
- `profit_loss` - Calculated financial summaries

### **Security**
- Row Level Security (RLS) enabled on all tables
- Client data isolation
- Admin-only access controls
- Automatic profit/loss calculations via triggers

## 🔧 **Customization**

### **Adding New Features**
1. Create components in `src/components/`
2. Add routes in `src/App.tsx`
3. Update database schema if needed
4. Add proper RLS policies

### **Styling**
- Uses Tailwind CSS with custom design tokens
- Theme configuration in `tailwind.config.ts`
- CSS variables in `src/index.css`

### **Database Modifications**
1. Create migration SQL files
2. Test in development environment
3. Apply to production Supabase project
4. Update TypeScript types if needed

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Supabase Connection Issues**
- Verify environment variables are correct
- Check Supabase project status
- Ensure database schema is properly set up

#### **Admin Access Issues**
- Verify admin credentials: `admin` / `invixop32#*@`
- Check database for admin_users table
- Clear browser localStorage if needed

#### **Build Issues**
- Clear `node_modules` and reinstall dependencies
- Check for TypeScript errors
- Verify all environment variables are set

### **Getting Help**
- Check browser console for errors
- Verify Supabase logs in dashboard
- Ensure all dependencies are installed
- Review network requests for API errors

## 📄 **License**

This project is proprietary software. All rights reserved.

## 🤝 **Support**

For technical support or questions about setup:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Verify all setup steps have been completed
4. Check browser console for error messages

---

**System is now ready for production use with secure admin access at `/secure-admin`**