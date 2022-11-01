import {app, ipcMain, BrowserWindow, screen, Screen, Display, globalShortcut} from "electron";
import { homedir } from 'os'
import { UserConfiguration } from "./modules/UserConfiguration.class";
import { Wallpaper, WallpaperType } from "./modules/Wallpaper.class";
import { WallpaperWindow } from "./modules/WallpaperWindow.class";

process.env.CONFIG_DIRECTORY = `${homedir()}/.firmament`;

function initApp() : void {

    loadConfiguration();

    let currentWallpaper : Wallpaper = new Wallpaper(UserConfiguration.content['currentWallpaper'], WallpaperType.HTML);
    let mainWallpaper : WallpaperWindow = new WallpaperWindow(screen.getPrimaryDisplay(), currentWallpaper); 

    globalShortcut.register(UserConfiguration.content.shortcuts.quit, app.quit);

    
}

function exitApp() : void {
    UserConfiguration.saveUserConfiguration();
}


app.whenReady().then(initApp);

app.on('will-quit', exitApp);

function loadConfiguration() : void {

    UserConfiguration.sanitizeUserConfigurationDirectory();
    
    try {
        UserConfiguration.loadUserConfiguration()
    }
    catch {
        console.log(`user configuration could not be loaded at all. Firmament will quit.`);
        app.quit();
    }

    UserConfiguration.sanitizeUserConfigurationShortcuts();

    console.log(JSON.stringify(UserConfiguration.content, null, 4));
}