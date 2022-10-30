import {app, ipcMain, BrowserWindow, screen, Screen, Display} from "electron";
import { Wallpaper, WallpaperType } from "./modules/Wallpaper.class";
import { WallpaperWindow } from "./modules/WallpaperWindow.class";

function initApp() : void {
    let mainWallpaper : WallpaperWindow = new WallpaperWindow(screen.getPrimaryDisplay(), new Wallpaper('/home/pascal/.firmament/wallpapers/default/default_wallpaper.html', WallpaperType.HTML)); 
    
}

app.whenReady().then(initApp);