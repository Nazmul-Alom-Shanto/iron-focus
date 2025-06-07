const { app, BrowserWindow, screen } = require('electron');

let mainWindow;

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize; // Get the screen dimensions

  mainWindow = new BrowserWindow({
   
    frame: false,
    skipTaskbar: true, // Hide from taskbar
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true, // Optional, depending on your HTML/JS requirements
    },
  });

  // Set the window position and size
  mainWindow.setBounds({
    x: width - 320, // Screen width - window width
    y: height - 380, // Top of the screen
    width: 320,
    height: 180,
  });
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Prevent all shortcuts, except basic typing keys
    if (input.control || input.meta || input.alt || input.key === 'F5') {
      event.preventDefault();
    }
  });
  // Load your HTML file
  mainWindow.loadFile('index.html');

  // Open dev tools (optional for debugging)
  // mainWindow.webContents.openDevTools();

  // Re-create the window on macOS when the app is re-activated
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
