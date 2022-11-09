import {app, ipcMain, BrowserWindow, screen, Screen, Display, globalShortcut} from "electron";
import { homedir } from 'os';
import { resolve, dirname } from 'path';
import { TrayManager } from "./modules/TrayManager.class";
import { UserConfiguration } from "./modules/UserConfiguration.class";
import { WallpaperWindowManager } from "./modules/WallpaperWindowManager.class";

process.env.CONFIG_DIRECTORY = `${homedir()}/.firmament`;

function initApp() : void {

    loadConfiguration();
    let wallpaperWindowsManager = WallpaperWindowManager.getInstance();

    let trayManager = TrayManager.getInstance();
    trayManager.buildMenu();
    



    globalShortcut.register(UserConfiguration.content.shortcuts.quit, app.quit);

    
}

function exitApp() : void {
    UserConfiguration.saveUserConfiguration();
}


app.whenReady().then(initApp);

app.on('will-quit', exitApp);

function loadConfiguration() : void {

    UserConfiguration.sanitizeConfigurationDirectory();
    
    try {
        UserConfiguration.loadUserConfiguration()
    }
    catch {
        console.log(`user configuration could not be loaded at all. Firmament will quit.`);
        app.quit();
    }

    UserConfiguration.sanitizeCurrentWallpaper();
    UserConfiguration.sanitizeShortcuts();
    UserConfiguration.sanitizePinnedWallpapers();

    console.log(JSON.stringify(UserConfiguration.content, null, 4));
}