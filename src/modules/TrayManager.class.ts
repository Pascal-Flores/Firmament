import { Menu, MenuItem, Tray } from "electron";
import { PathLike } from "original-fs";
import { UserConfiguration } from "./UserConfiguration.class";
import { WallpaperWindowManager } from "./WallpaperWindowManager.class";

export class TrayManager {
    public tray : Tray;

    public constructor(image : string | Electron.NativeImage) {
        this.tray = new Tray(image);
    }

    public buildMenu() : void{

        let pinMenuItem
        if (this.isCurrentWallpaperPinned()) {
            pinMenuItem = new MenuItem({label : 'Unpin this wallpaper', type : 'normal', /*click : /*unpinCurrentWallpaper*/})
        }
        else {
            pinMenuItem = new MenuItem({label : 'Pin this wallpaper', type : 'normal', /*click : pinCurrentWallpaper*/})
        }

        let trayMenu : Menu = Menu.buildFromTemplate([
            { label : 'Firmament', type : 'normal', enabled : false },
            { type  : 'separator'},
            { label : 'Change wallpaper', type : 'normal' , click : WallpaperWindowManager.getInstance().changeWallpaper},
            { label : 'Import new wallpaper', type : 'normal', /*click : createWallpaperCreatorWindow*/ },
            pinMenuItem,
            { label : "Pinned Wallpapers", sublabel : "oui" , submenu : this.buildPinnedWallpapersSubmenu()},
            { type  : "separator"},
            // { label : "Preferences", type : 'normal', click : createPreferencesWindow},
            { label: 'Quit Firmament', type: 'normal', role : "quit" }]
        );

        this.tray.setContextMenu(trayMenu);
    }

    private buildPinnedWallpapersSubmenu() : Menu {
        let config = UserConfiguration.content
        let submenu = new Menu()
		if (config.pinnedWallpapers.length != 0) {
			config.pinnedWallpapers.forEach(element => {
				submenu.append(new MenuItem({
					label : element.name, 
					type : "normal", 
					/*click : /*switchWallpaper.bind(this, configDirectory+element.src)*/
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
	private isCurrentWallpaperPinned() {
        let config = UserConfiguration.content
		let result = false
		if (config.pinnedWallpapers.length != 0) {
			config.pinnedWallpapers.forEach(element => {
				if (config.currentWallpaper.toString() == element.src.toString()) {
					result = true
				}
			})
			return result
		}
		return result

	}
}