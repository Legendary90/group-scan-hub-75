# InviX - Build & Deployment Instructions

## 🚀 **Quick Start Guide**

### **Prerequisites Checklist**
- [ ] Node.js v18 or higher installed
- [ ] Git installed and configured
- [ ] Supabase account created
- [ ] Code editor (VS Code recommended)

## 🔧 **Development Setup**

### **1. Project Setup**
```bash
# Clone the repository
git clone <your-repository-url>
cd invix-inventory-system

# Install dependencies
npm install

# Verify installation
npm run dev --dry-run
```

### **2. Environment Configuration**

Create `.env.local` file in project root:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Development flags
VITE_DEV_MODE=true
VITE_DEBUG_LOGS=true
```

**⚠️ Important**: Never commit `.env.local` to version control

### **3. Supabase Setup Process**

#### **A. Create Supabase Project**
1. Visit [https://supabase.com](https://supabase.com)
2. Sign up/login to your account
3. Click "New Project"
4. Choose organization and set project details:
   - **Name**: `invix-inventory`
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your users
5. Wait 2-3 minutes for project provisioning

#### **B. Configure Project Settings**
1. Go to **Settings** → **General**
2. Copy **Project URL** and **API Keys**
3. Note down the **Project Reference ID**

#### **C. Database Schema Installation**
1. Navigate to **SQL Editor** in Supabase dashboard
2. Create new query
3. Copy entire content from `database_schema.sql`
4. Execute the query (this may take 1-2 minutes)
5. Verify tables are created in **Table Editor**

#### **D. Verify Admin Account**
```sql
-- Check admin account was created
SELECT * FROM admin_users WHERE username = 'admin';

-- Should return:
-- username: admin
-- password_hash: invixop32#*@
-- is_active: true
```

### **4. Development Server**
```bash
# Start development server
npm run dev

# Server will start at http://localhost:5173
# Admin panel: http://localhost:5173/secure-admin
```

## 🏗️ **Build Process**

### **Development Build**
```bash
# Run with hot reload
npm run dev

# Run with network access
npm run dev -- --host

# Run with specific port
npm run dev -- --port 3000
```

### **Production Build**
```bash
# Create optimized build
npm run build

# Preview production build locally
npm run preview

# Build with analysis
npm run build -- --analyze
```

### **Build Output Structure**
```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Main JavaScript bundle
│   ├── index-[hash].css    # Compiled CSS
│   └── [other-assets]      # Images, fonts, etc.
├── robots.txt              # SEO configuration
└── [other-static-files]    # Public assets
```

## 📦 **Deployment Options**

### **Option 1: Netlify (Recommended)**

#### **Automatic Deployment**
1. Push code to GitHub repository
2. Connect Netlify to your repository
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy automatically on git push

#### **Manual Deployment**
```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### **Option 2: Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod

# Or use Vercel GitHub integration
```

### **Option 3: Self-Hosted Server**
```bash
# Build the project
npm run build

# Copy dist/ folder to your server
# Configure your web server (nginx/apache) to serve static files
# Ensure all routes redirect to index.html for React Router
```

#### **Nginx Configuration Example**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/your/dist;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### **Option 4: Docker Deployment**

#### **Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **Build and Run**
```bash
# Build Docker image
docker build -t invix-app .

# Run container
docker run -p 80:80 invix-app
```

## 🔐 **Production Environment Setup**

### **Environment Variables**
```env
# Production Supabase (create separate project)
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Security (optional)
VITE_ADMIN_SESSION_TIMEOUT=3600
VITE_CLIENT_SESSION_TIMEOUT=86400
```

### **Security Checklist**
- [ ] Use production Supabase project
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS in Supabase
- [ ] Set up domain restrictions
- [ ] Enable rate limiting
- [ ] Configure backup schedules
- [ ] Set up monitoring and alerts

### **Supabase Production Configuration**
1. **Authentication Settings**:
   - Disable email confirmation for faster testing
   - Configure email templates
   - Set up custom domains

2. **Database Security**:
   - Review RLS policies
   - Set up database backups
   - Configure connection limits

3. **API Settings**:
   - Configure rate limiting
   - Set up CORS origins
   - Enable request logging

## 🧪 **Testing**

### **Development Testing**
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### **Production Testing Checklist**
- [ ] Client registration works
- [ ] Client login/logout functions
- [ ] Admin panel accessible at `/secure-admin`
- [ ] Financial calculations are accurate
- [ ] Document generation works
- [ ] Data isolation between clients
- [ ] Subscription management functions
- [ ] All forms validate properly
- [ ] Mobile responsiveness

### **Admin Login Test**
```
URL: http://your-domain.com/secure-admin
Username: admin
Password: invixop32#*@
```

## 🐛 **Troubleshooting Build Issues**

### **Common Build Problems**

#### **Node.js Version Issues**
```bash
# Check Node version
node --version  # Should be 18+

# Update Node.js using nvm
nvm install 18
nvm use 18
```

#### **Dependency Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **TypeScript Errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update TypeScript types
npm update @types/*
```

#### **Vite Build Issues**
```bash
# Clear Vite cache
rm -rf .vite

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### **Supabase Connection Issues**

#### **Check Environment Variables**
```bash
# Verify variables are loaded
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### **Test Supabase Connection**
```javascript
// Add to a test file
import { supabase } from './src/integrations/supabase/client';

supabase.from('clients').select('*').limit(1).then(console.log);
```

#### **Database Schema Issues**
1. Verify all tables exist in Supabase Table Editor
2. Check RLS policies are enabled
3. Confirm functions are created in Database → Functions
4. Test admin authentication manually

## 📊 **Performance Optimization**

### **Build Optimization**
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for unused dependencies
npx depcheck

# Optimize images
npm install -g imagemin-cli
imagemin src/assets/*.{jpg,png} --out-dir=src/assets/optimized
```

### **Production Performance Checklist**
- [ ] Enable gzip compression on server
- [ ] Configure CDN for static assets
- [ ] Set up proper caching headers
- [ ] Optimize images and fonts
- [ ] Minimize JavaScript bundles
- [ ] Enable lazy loading for components

## 📝 **Deployment Verification**

### **Post-Deployment Checklist**
1. **Functionality Tests**:
   - [ ] Homepage loads correctly
   - [ ] Client registration works
   - [ ] Admin panel authentication
   - [ ] Database operations function
   - [ ] Document generation works

2. **Performance Tests**:
   - [ ] Page load times < 3 seconds
   - [ ] Mobile responsiveness
   - [ ] Cross-browser compatibility
   - [ ] API response times acceptable

3. **Security Tests**:
   - [ ] HTTPS enforced
   - [ ] Admin panel secure
   - [ ] Data isolation verified
   - [ ] Input validation working

---

**Your InviX system is now ready for production use!**

**Admin Access**: `https://your-domain.com/secure-admin`
- Username: `admin`  
- Password: `invixop32#*@`