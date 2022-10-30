import {app, ipcMain, BrowserWindow, screen, Screen, Display} from "electron";
import { homedir } from 'os'
import { UserConfiguration } from "./modules/UserConfiguration.class";
import { Wallpaper, WallpaperType } from "./modules/Wallpaper.class";
import { WallpaperWindow } from "./modules/WallpaperWindow.class";

process.env.CONFIG_DIRECTORY = `${homedir()}/.firmament`;

function initApp() : void {

    UserConfiguration.sanitizeUserConfigurationDirectory();
    try {
        UserConfiguration.loadUserConfiguration()
    }
    catch {
        console.log(`user configuration could not be loaded at all. Firmament will quit.`);
        app.quit();
    }

    let currentWallpaper : Wallpaper = new Wallpaper(UserConfiguration.content['currentWallpaper'], WallpaperType.HTML);
    let mainWallpaper : WallpaperWindow = new WallpaperWindow(screen.getPrimaryDisplay(), currentWallpaper); 
    
}

app.whenReady().then(initApp);