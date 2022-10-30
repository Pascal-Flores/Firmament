import {app, ipcMain, BrowserWindow, screen, Screen, Display} from "electron";
import { homedir } from 'os'
import { UserConfiguration } from "./modules/UserConfiguration.class";
import { Wallpaper, WallpaperType } from "./modules/Wallpaper.class";
import { WallpaperWindow } from "./modules/WallpaperWindow.class";

process.env.CONFIG_DIRECTORY = `${homedir()}/.firmament`;

function initApp() : void {
    try {
        UserConfiguration.loadUserConfiguration()
        console.log(UserConfiguration.content.currentWallpaper)
    }
    catch (error){
        console.log(`Fin frérot, tu es cringe : ${error}`);
        app.quit();
    }

    let currentWallpaper : Wallpaper = new Wallpaper(UserConfiguration.content['currentWallpaper'], WallpaperType.HTML)
    let mainWallpaper : WallpaperWindow = new WallpaperWindow(screen.getPrimaryDisplay(), currentWallpaper); 
    
}

app.whenReady().then(initApp);