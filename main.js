const { ipcMain, app, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { spawn } = require('child_process');
const { eventNames } = require('process');
const { json } = require('stream/consumers');

function startWatchdog() {
  const appExe = process.execPath; // Path to the running .exe

  setInterval(() => {
    try {
      if (!mainWindow || mainWindow.isDestroyed()) {
        console.log('Main window was destroyed. Restarting app...');
        spawn(appExe, [], {
          detached: true,
          stdio: 'ignore'
        }).unref();
        app.quit(); // Exit the current broken instance
      }
    } catch (err) {
      console.error('Error in watchdog:', err);
    }
  }, 60 * 1000); // Every 1 minute
}

startWatchdog();


let mainWindow;
let isSmall;

function checkMainWindow(){
  if(!mainWindow || mainWindow.isDestroyed()){
    mainWindow = createWindow();
    bigSize()
  } else {
    mainWindow.show();
    if(isSmall){
      smallSize();
    } else{
      //bigSize();
    }
    mainWindow.setAlwaysOnTop(true);
  }
}

function smallSize(){
  mainWindow.setResizable(true);
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setBounds({
    x: width - 250,
    y: height - 380,
    width: 250,
    height: 140,
  });
  isSmall = true;
  mainWindow.setResizable(false);
}
function bigSize(){
  mainWindow.setResizable(true);
  mainWindow.setFullScreen(true);
  mainWindow.setResizable(false);
  isSmall = false;

}
function createWindow(){
  const win = new BrowserWindow({
    width: 250,
    height: 133,
    frame: false,
    titleBarStyle: 'hidden',
    opacity: 0.9,
    skipTaskbar: true,
    alwaysOnTop: true,
    resizable: false,
    closable: false,
    icon : 'assets/IronFocus.ico',
    focusable: true,
    transparent: true,
    //  maximizable: true,
    // minimizable : false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadFile('index.html');
  return win;
}

const pathLog = path.join(app.getPath('userData'), 'logs.json');
if (!fs.existsSync(pathLog)) {
  const initialLog = {
    logs: [
      {
        title: "hey, bro",
        success: 10,
        description: "it means Log is working",
        givenTime: 10,
        extraAlocatedTime: 0,
        timestamp: new Date().toISOString() // Use current timestamp
      }
    ]
  };

  fs.writeFileSync(pathLog, JSON.stringify(initialLog, null, 2)); // Pretty print with indentation
}
app.whenReady().then(() => {
  mainWindow = createWindow();

  // mainWindow.loadFile('index.html');

  // ✅ Trigger fullscreen once content is loaded and focused
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.focus(); // Needed on some systems
    bigSize();
  });
  
  mainWindow.on('minimize', (e) => {
    e.preventDefault();
    mainWindow.hide();
    setTimeout(()=> {
      checkMainWindow();
    }, 1000);
    // mainWindow.setAlwaysOnTop(true);
  });
  mainWindow.on('close', (e)=> {
    e.preventDefault();
    mainWindow.hide();
    setTimeout(()=> {
      checkMainWindow();
    }, 1000);
  });
  // mainWindow.on('blur', () => {
  //   mainWindow.focus();
  //   mainWindow.setAlwaysOnTop(true, 'screen-saver');
  // });
  mainWindow.setAlwaysOnTop(true, 'screen-saver'); // or 'modal-panel'
  mainWindow.setWindowButtonVisibility(false);
  mainWindow.on('blur', () => {
    setTimeout(() => {
      if (!mainWindow.isFocused()) {
        mainWindow.focus();
      }
    }, 200);
  });

  // ipcMain.on('move-window', (event, x,y) => {
  //   mainWindow.setBounds({...mainWindow.getBounds(), x,y});
  // });
  // ipcMain.handle('get-bounds', () => {
  //   return mainWindow.getBounds;
  // })
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
    path: app.getPath('exe'),
    args: ['--silent']
  });
  
  mainWindow.on('hide', () => {
    console.log('Window hidden, showing again...');
    setTimeout(() => {
      // if (!mainWindow.isVisible()) {
      //   mainWindow.show();
      //   smallSize();
      //   mainWindow.setAlwaysOnTop(true);
      //   mainWindow.focus();
      // }
      checkMainWindow();
    }, 500); // short delay to prevent rapid flickering
  });

  setInterval(()=> {
    checkMainWindow();
  }, 60 * 1000);
});

// Fullscreen toggle
ipcMain.on('fullScreen', () => {
  bigSize();
});
ipcMain.handle('load-logs', async()=> {
  try {
    const data = await fsp.readFile(pathLog, 'utf-8');
    const parsed = JSON.parse(data);
    return {success : true, logs : parsed.logs, data : parsed, rawData : data};
  
  } catch(err){
    return {success : false, message : err.message};
  }
})

ipcMain.handle('update-log', async(event, logs)=> {
  try{
    await fsp.writeFile(pathLog,JSON.stringify(logs, null , 2));
    return {success : true}
  } catch(err){
    return {success : false, message : err.message};
  }
});
ipcMain.on('exitFullScreen', () => {
  smallSize();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();  
});

app.on('before-quit', (e) => {
  e.preventDefault();
});


