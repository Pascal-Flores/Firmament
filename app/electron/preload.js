//const { getCurrentWindow, process } = require('@electron/remote')
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    importWallpaper : (type, file, name, isActive) => ipcRenderer.send('importWallpaper', type, file, name, isActive),
    //sendPID : () => ipcRenderer.send("wallpaperWindowPID", process.pid)
})