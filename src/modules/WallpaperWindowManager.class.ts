import { BrowserWindow, dialog, Display, screen } from "electron";
import { extname } from 'path';
import { convertToObject, OperationCanceledException } from "typescript";
import { getURLFromFile } from "./URLUtils";
import { UserConfiguration } from "./UserConfiguration.class";
import { Wallpaper, WallpaperType } from "./Wallpaper.class";

export class WallpaperWindowManager {

    ////////////
    // public //
    ////////////

    public static getInstance() : WallpaperWindowManager {
        if (WallpaperWindowManager.instance === undefined)
            WallpaperWindowManager.instance = new WallpaperWindowManager();
        
        return WallpaperWindowManager.instance;
    }

    public getWallpaperWindowIds() : number[] {
        return Object.keys(this.wallpaperWindows).map(Number);
    }

    public changeWallpaper() {
        dialog.showOpenDialog({
            title : "Choose wallpaper",
            defaultPath : `${process.env.CONFIG_DIRECTORY}/wallpapers/`,
            properties : ['openFile'], 
            filters : [
                {name : 'WEB', extensions : ['html', 'url']}
    
            ]}).then((promiseResult) => { 
                // and then we switch the wallpaper by giving the new wallpaper file path obtained thanks to the dialog window
                if (promiseResult !== undefined) {
                    if (promiseResult.filePaths.length != 0) {
                        let newWallpaper : Wallpaper;
                        switch (extname(promiseResult.filePaths[0])) {
                            case '.url' : 
                                newWallpaper = new Wallpaper(promiseResult.filePaths[0], WallpaperType.URL);
                                break;
                            case '.html' :
                                newWallpaper = new Wallpaper(promiseResult.filePaths[0], WallpaperType.HTML);
                                break;
                        }
                        WallpaperWindowManager.getInstance().getWallpaperWindowIds().forEach(windowId => {
                            WallpaperWindowManager.getInstance().setWallpaper(windowId, newWallpaper);
                        });

                        UserConfiguration.content.currentWallpaper = promiseResult.filePaths[0];
                    }
                }
            })
    }

    public setWallpaper(windowId : number, wallpaper : Wallpaper) {
        switch (wallpaper.type) {
            case WallpaperType.HTML :
                this.wallpaperWindows[windowId].loadFile(wallpaper.path.toString());   
                break;
            case WallpaperType.URL : 
                console.log(getURLFromFile(wallpaper.path.toString()))
                this.wallpaperWindows[windowId].loadURL(getURLFromFile(wallpaper.path.toString()));
                break;
        }
    }


    /////////////
    // private //
    /////////////

    private static instance : WallpaperWindowManager;
    private wallpaperWindows : BrowserWindow [];

    private constructor() {
        this.wallpaperWindows = [];

        screen.getAllDisplays().forEach(display => this.addWindow(display, new Wallpaper(UserConfiguration.content['currentWallpaper'], WallpaperType.HTML)));
    }

    private addWindow(display : Display, wallpaper ?: Wallpaper) : void {
        this.wallpaperWindows[display.id] = this.createWindow(display);
        //this.wallpaperWindows.push( {id : display.id, window : this.createWindow(display)});

        if (wallpaper)
            this.setWallpaper(display.id, wallpaper);
    }

    private createWindow(display : Display) : BrowserWindow {
        let window = new BrowserWindow({
            show  : false,
            frame : false,
            width : display.size.width,
            height : display.size.height,
            type : "desktop",
            autoHideMenuBar : true,
            backgroundColor : "#000",
            webPreferences : {
                backgroundThrottling : false,
                enableWebSQL : false,
            }
        });
        window.once('ready-to-show', window.show);

        return window;
    }




}
