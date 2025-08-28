const { ipcMain, app, BrowserWindow, screen, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { spawn } = require('child_process');

const l = (m) => console.log(m + ' ' + new Date().toISOString().slice(12, 19));
function startWatchdog() {
  const appExe = process.execPath; // Path to the running .exe

  setInterval(() => {
    try {
      if (!mainWindow || mainWindow.isDestroyed()) {
        l('Main window was destroyed. Restarting app...');
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


// require in production to prevent multiple instances, in dev to allow multiple instances for easy testing
// const gotTheLock = app.requestSingleInstanceLock();

// if(!gotTheLock){
//   // if another instance is running quit this one
//     app.quit();
// } else {
//   app.on('second-instance',()=> {
//     if(mainWindow){
//       if(mainWindow.isMinimized()) mainWindow.restore();
//       if(!mainWindow.isVisible()) mainWindow.show();
//       mainWindow.setAlwaysOnTop(true);
//     } else {
//       mainWindow = createWindow();
//     }
//   })
// }

let mainWindow;
let isSmall;

function checkMainWindow(){
  l('checkMainWindow() just triggered');
  if(!mainWindow || mainWindow.isDestroyed()){
    mainWindow = createWindow();
    bigSize()
  } else {
    mainWindow.show();
    if(isSmall){
      smallSize();
    } else{
      bigSize();
    }
  }
    if(!mainWindow.isAlwaysOnTop()) mainWindow.setAlwaysOnTop(true);
}

function smallSize(){
  l('smallSize() just triggered');
  if(isSmall) return;
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
  if(!mainWindow  || mainWindow.isFullScreen()) return;
  l('bigSize() just triggered');
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
     backgroundColor: '#a42121ff',
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
const pathQoute = path.join(app.getAppPath(), 'qoute.json');
const pathTemplate = path.join(app.getPath('userData'),'template.json');
const pathDailyTasks = path.join(app.getPath('userData'), 'daily-tasks.json');
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
    // ,dailyTemplates : [],
    // todayTaskLists : [],
    // tomorrowTaskLists : []

  };

  fs.writeFileSync(pathLog, JSON.stringify(initialLog, null, 2)); // Pretty print with indentation
}

if(!fs.existsSync(pathTemplate)) {
  const initTemplate = {
    "dailyTemplate" : [
       {
    title: 'Solve 2 Math Problems',
    time: 30,
    tags : ['study', 'math'],
    editing: false
  }
    ],
    "weeklyTemplate" : [

    ]
  }
  fs.writeFileSync(pathTemplate, JSON.stringify(initTemplate, null, 2));
}
if(!fs.existsSync(pathDailyTasks)){
  const today = new Date().toISOString().slice(0,10);
  const initDailyTasks = {};
  initDailyTasks[today] = [
  {
    title: 'Solve 2 Math Problems',
    time: 30,
    tags : ['study', 'math'],
    editing: false
  },
  {
    title: 'Revise Biology Diagrams',
    time: 25,
    tags : ['study', 'biology'],
    editing: false
  },
  {
    title: 'Work on IronFocus UI',
    time: 45,
    tags : ['work', 'ui'],
    editing: false
  },
  {
    title: 'Quran Hifz Revision',
    time: 35,
    tags : ['study', 'quran'],
    editing: false
  }
] 
fs.writeFileSync(pathDailyTasks, JSON.stringify(initDailyTasks, null, 2));
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
    l('minimize event triggered');
    e.preventDefault();
    mainWindow.hide();
    setTimeout(()=> {
      checkMainWindow();
    }, 150);
    // mainWindow.setAlwaysOnTop(true);
  });
  mainWindow.on('close', (e)=> {
    l('close event triggered');
    e.preventDefault();
    mainWindow.hide();
    setTimeout(()=> {
      checkMainWindow();
    }, 1000);
  });
  mainWindow.setAlwaysOnTop(true, 'screen-saver'); // or 'modal-panel'
  // mainWindow.setWindowButtonVisibility(false);
  mainWindow.on('blur', () => {
    l('blur event triggered');
    setTimeout(() => {
      if (!mainWindow.isFocused()) {
        if(!mainWindow.isAlwaysOnTop()) mainWindow.setAlwaysOnTop(true, 'screen-saver');
      }
    }, 200);
  });
if (!app.isPackaged) {
  app.setName('Iron-Focus-v2-test');
}

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
    l('hide event triggered');
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

//   setInterval(()=> {
//     checkMainWindow();
//   }, 60 * 1000);


setInterval(() => {
  if(!mainWindow || mainWindow.isDestroyed()){
    checkMainWindow();
  }
  if(!mainWindow.isAlwaysOnTop()){
      mainWindow.setAlwaysOnTop(true);
  }
}, 60 * 1000);
});
// Fullscreen toggle
ipcMain.on('fullScreen', () => {
  bigSize();
});
const loadLogsFromFile = async()=> {
  try {
    const data = await fsp.readFile(pathLog, 'utf-8');
    const parsed = JSON.parse(data);
    return {success : true, logs : parsed.logs, data : parsed, rawData : data};
  
  } catch(err){
    return {success : false, message : err.message};
  }
}
const writeLogsToFile = async (logs)=> {
  try{
    await fsp.writeFile(pathLog,JSON.stringify(logs, null , 2));
    return {success : true}
  } catch(err){
    return {success : false, message : err.message};
  }
}

const readFromFile = async(path)=> {
  try {
    const data = await fsp.readFile(path, 'utf-8');
    const parsed = JSON.parse(data);
    return {success : true, data : parsed , rawData : data};
  
  } catch(err){
    return {success : false, message : err.message};
  }
} 

const writeToFile = async(path, content) => {
     try{
    await fsp.writeFile(path ,JSON.stringify(content, null , 2));
    return {success : true}
  } catch(err){
    return {success : false, message : err.message};
  }
}
ipcMain.handle('load-logs', async()=> {
  return await loadLogsFromFile();
});
ipcMain.handle('load-qoutes', async() => {
  try{
    const data = await fsp.readFile(pathQoute, 'utf-8');
    const qoutes = JSON.parse(data);
    return {success : true, qoutes : qoutes}
  } catch(err){
    return {success : false, message : err.message};
  }
});
ipcMain.handle('update-log', async(_, logs)=> {
  return await writeLogsToFile(logs);
});
ipcMain.handle('export-logs', async ()=> {
  try{
    const logs = await loadLogsFromFile();
    if(!logs.success){
      throw new Error(`hey, SWW when loading logs from file, WM: ${logs.message}`);
    }
    const win = BrowserWindow.getFocusedWindow();
    const {filePath, canceled} = await dialog.showSaveDialog(win,{
      title : 'Export Logs',
      filters : [
        {name : 'JSON',extensions : ['json']}
      ], 
      defaultPath : 'logs.json'
    });
    if(!filePath || canceled){
      throw new Error('User canceled the export');
    }
    const data = {
      exportTime : new Date().toISOString(),
      logs : logs.logs
    }  
    await fsp.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return {success : true, message : 'Logs Exported Successfully'};
  }
     catch(err){
      return {success : false, message : `I don't knw ? heapen, ${err.message}`};
  }
});
ipcMain.handle('write-logs', async(_, logs)=> {
  try{
    await writeLogsToFile({logs: logs});
    return {success : true};
  } catch(err){
    return {success : false, message : err.message};
  }
});
ipcMain.handle('load-templates', async() => {
  return await readFromFile(pathTemplate);
});
ipcMain.handle('write-templates', async(event, templates) => {
  return await writeToFile(pathTemplate,templates);
});

ipcMain.handle('load-daily-tasks', async()=> {
  return await readFromFile(pathDailyTasks);
});
ipcMain.handle('write-daily-tasks', async(_, tasks) => {
  return writeToFile(pathDailyTasks, tasks);
});
ipcMain.on('exitFullScreen', () => {
  smallSize();
});
ipcMain.on('drag-window', (event, x, y) => {
  if (mainWindow) {
    mainWindow.setBounds({ x, y, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height });
  }
});
ipcMain.handle('get-window-position', (event) => {
  if (mainWindow) {
    const bounds = mainWindow.getBounds();
    return { x: bounds.x, y: bounds.y}
  }});
ipcMain.on('quit',()=> {
  app.quit();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();  
});

app.on('before-quit', (e) => {
  e.preventDefault();
});


