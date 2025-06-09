const { ipcMain, app, BrowserWindow, screen } = require('electron');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 250,
    height: 133,
    frame: false,
    opacity: 1,
    skipTaskbar: false,
    alwaysOnTop: true,
    resizable: false,
    closable: false,
    focusable: true,
    transparent: true,
     maximizable: true,
    minimizable : false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  // ✅ Trigger fullscreen once content is loaded and focused
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.focus(); // Needed on some systems
    mainWindow.setResizable(true);
    mainWindow.setFullScreen(true);
    mainWindow.setResizable(false);
  });
  mainWindow.on('minimize', (e) => {
    e.preventDefault();
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true);
  });
  // mainWindow.on('blur', () => {
  //   mainWindow.focus();
  //   mainWindow.setAlwaysOnTop(true, 'screen-saver');
  // });
  mainWindow.setAlwaysOnTop(true, 'screen-saver'); // or 'modal-panel'
  // mainWindow.on('blur', () => {
  //   setTimeout(() => {
  //     if (!mainWindow.isFocused()) {
  //       mainWindow.focus();
  //     }
  //   }, 200);
  // });
  // ipcMain.on('move-window', (event, x,y) => {
  //   mainWindow.setBounds({...mainWindow.getBounds(), x,y});
  // });
  // ipcMain.handle('get-bounds', () => {
  //   return mainWindow.getBounds;
  // })
  
});

// Fullscreen toggle
ipcMain.on('fullScreen', () => {
  mainWindow.setResizable(true);
  mainWindow.setFullScreen(true);
  mainWindow.setResizable(false);
});

ipcMain.on('exitFullScreen', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow.setResizable(true);
  mainWindow.setFullScreen(false);
  mainWindow.setBounds({
    x: width - 250,
    y: height - 380,
    width: 250,
    height: 140,
  });
  mainWindow.setResizable(false);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
