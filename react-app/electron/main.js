const { app, BrowserWindow, BaseWindow } = require('electron');
const path = require('path');

function createWindow () {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // ToDo During development
    win.loadURL('http://localhost:3000');

    // ToDo For production build (after build)
    // win.loadURL(`file://${path.join(__dirname, 'build/index.html')}`);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});