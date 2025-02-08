const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = import('electron-is-dev');

//前后端通信
import('./ipcHandlers/ipcHandlers.js').then((ipcHandlers) => {
}).catch((err) => {
    console.error('Failed to load ipcHandlers:', err);
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false 
        }
    });
    const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'index.html')}`;
    win.loadURL(startUrl);
}

app.on('ready', createWindow);
