const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
 importWallpaper : (file, name, isActive) => ipcRenderer.send("importWallpaper", file, name, isActive)
})