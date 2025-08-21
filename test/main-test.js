const { ipcMain, app, BrowserWindow, screen, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { spawn } = require('child_process');

const l = (m) => console.log(m + ' ' + new Date().toISOString().slice(12, 19));