module.exports = {
  appId: 'com.invix.app',
  productName: 'InviX',
  directories: {
    output: 'dist-electron'
  },
  files: [
    'dist/**/*',
    'electron/**/*',
    'assets/**/*'
  ],
  extraMetadata: {
    main: 'electron/main.js'
  },
  win: {
    target: 'nsis',
    icon: 'assets/icon.png',
    artifactName: '${productName}.${ext}'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    artifactName: '${productName} Setup.${ext}',
    shortcutName: 'InviX',
    uninstallDisplayName: 'InviX - Inventory Management System',
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  mac: {
    target: 'dmg',
    icon: 'assets/icon.png'
  },
  linux: {
    target: 'AppImage',
    icon: 'assets/icon.png'
  }
};