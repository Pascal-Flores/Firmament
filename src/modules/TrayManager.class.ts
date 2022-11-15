import { Menu, MenuItem, Tray } from "electron";
import { isEqual } from 'lodash';
import { UserConfiguration } from "./UserConfiguration.class";
import { WallpaperWindowManager } from "./WallpaperWindowManager.class";

export class TrayManager {

    ////////////
    // public //
    ////////////

    public static getInstance() : TrayManager {
        if (!TrayManager.instance)
            TrayManager.instance = new TrayManager('assets/icon.png');
        
        return TrayManager.instance;
    }

    public buildMenu() : void{

        let pinMenuItem;
        if (this.isCurrentWallpaperPinned()) {
            pinMenuItem = new MenuItem({label : 'Unpin this wallpaper', type : 'normal', click : UserConfiguration.unpinCurrentWallpaper})
        }
        else {
            pinMenuItem = new MenuItem({label : 'Pin this wallpaper', type : 'normal', click : UserConfiguration.pinCurrentWallpaper})
        }

        let trayMenu : Menu = Menu.buildFromTemplate([
            { label : 'Firmament', type : 'normal', enabled : false },
            { type  : 'separator'},
            { label : 'Change wallpaper', type : 'normal' , click : () => {WallpaperWindowManager.getInstance().changeWallpaper()}},
            { label : 'Import new wallpaper', type : 'normal', /*click : createWallpaperCreatorWindow*/ },
            pinMenuItem,
            { label : "Pinned Wallpapers", sublabel : "oui" , submenu : this.buildPinnedWallpapersSubmenu()},
            { type  : "separator"},
            // { label : "Preferences", type : 'normal', click : createPreferencesWindow},
            { label: 'Quit Firmament', type: 'normal', role : "quit" }]
        );

        this.tray.setContextMenu(trayMenu);
    }


    /////////////
    // private //
    /////////////

    private static instance : TrayManager;
    private tray : Tray;

    private constructor(image : string | Electron.NativeImage) {
        this.tray = new Tray(image);
    }

    private buildPinnedWallpapersSubmenu() : Menu {
        let config = UserConfiguration.content
        let submenu = new Menu()
		if (config.pinnedWallpapers.length != 0) {
			config.pinnedWallpapers.forEach(wallpaper => {
				submenu.append(new MenuItem({
					label : wallpaper.name, 
					type : "normal", 
					click : () => {WallpaperWindowManager.getInstance().setWallpaper(wallpaper);}
				}));
			})
		}
		else {
			submenu.append(new MenuItem({label : "No wallpaper pinned", enabled : false}));
		}
		return submenu;
    }

    /**
	 * checks wether the current wallpaper is pinned or not
	 * @returns {bool} true if wallpaper is pinned, false otherwise
	 */
	public isCurrentWallpaperPinned() : boolean {
        let config = UserConfiguration.content;

        if (config.pinnedWallpapers.findIndex(wallpaper => isEqual(wallpaper, config.currentWallpaper)) == -1)
            return false;
        else 
            return true;
	}
}