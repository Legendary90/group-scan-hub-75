# Build Instructions for .exe Programs

## Prerequisites

To build your inventory management software into .exe files, you'll need:

1. **Node.js** (version 16 or higher)
2. **Electron** (for converting web app to desktop)
3. **Electron Builder** (for creating .exe files)

## Step 1: Install Required Dependencies

```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

## Step 2: Add Build Scripts

Add these scripts to your `package.json`:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "electron": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "build:electron": "npm run build && electron-builder",
    "build:exe": "npm run build && electron-builder --win",
    "build:admin": "npm run build:admin-app && electron-builder --config electron-builder-admin.json"
  }
}
```

## Step 3: Create Electron Main Process

Create `electron/main.js`:

```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../public/icon.png') // Add your app icon
  })

  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`
  
  mainWindow.loadURL(startUrl)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
```

## Step 4: Create Electron Builder Config

Create `electron-builder.json`:

```json
{
  "appId": "com.yourcompany.inventory-management",
  "productName": "Inventory Management System",
  "directories": {
    "buildResources": "electron/build"
  },
  "files": [
    "dist/**/*",
    "electron/main.js",
    "node_modules/**/*"
  ],
  "win": {
    "target": "nsis",
    "icon": "public/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

## Step 5: Create Admin Panel Electron Config

Create `electron-builder-admin.json`:

```json
{
  "appId": "com.yourcompany.admin-panel",
  "productName": "Admin Panel",
  "directories": {
    "buildResources": "electron/build"
  },
  "files": [
    "dist-admin/**/*",
    "electron/admin-main.js",
    "node_modules/**/*"
  ],
  "win": {
    "target": "nsis",
    "icon": "public/admin-icon.ico"
  }
}
```

## Step 6: Build Commands

### For Main Application:
```bash
npm run build:exe
```

### For Admin Panel:
```bash
npm run build:admin
```

## Step 7: Distribution

After building, you'll find:
- `dist/` folder with your .exe installer
- The installer will create desktop shortcuts
- Users can install and run offline

## Important Notes

1. **Icons**: Add proper .ico files for Windows
2. **Code Signing**: For production, sign your executables
3. **Auto Updates**: Consider implementing auto-updater
4. **Database**: Ensure Supabase credentials are properly configured
5. **Testing**: Test the .exe on different Windows versions

## Folder Structure After Build

```
project/
├── dist/                    # Built web files
├── electron/
│   ├── main.js             # Main app electron process
│   └── admin-main.js       # Admin panel electron process
├── dist/                   # Electron build output
│   └── Inventory Management Setup.exe
└── package.json
```

## Client Distribution

1. Create installer with both programs
2. Include setup instructions
3. Provide client ID registration process
4. Include support documentation