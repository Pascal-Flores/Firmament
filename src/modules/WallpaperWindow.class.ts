import { BrowserWindow, Display } from "electron";
import { getURLFromFile } from "./URLUtils";

import { Wallpaper, WallpaperType } from "./Wallpaper.class";

export class WallpaperWindow extends BrowserWindow {

    public constructor(windowDisplay : Display, wallpaper ?: Wallpaper) {
        super ({
            show  : true,
            frame : false,
            width : windowDisplay.size.width,
            height : windowDisplay.size.height,
            type : "desktop",
            autoHideMenuBar : true,
            backgroundColor : "#000",
            webPreferences : {
                backgroundThrottling : false,
                enableWebSQL : false,
            }
        });

        if (wallpaper)
            this.setWallpaper(wallpaper);
        
        this.once('ready-to-show', this.show);
    }

    public setWallpaper (wallpaper : Wallpaper) : void {
        switch (wallpaper.type) {
            case WallpaperType.HTML :
                this.loadFile(wallpaper.path.toString());
                break;
            case WallpaperType.URL : 
                this.loadURL(getURLFromFile(wallpaper.path.toString()));
                break;
        }
    }

}