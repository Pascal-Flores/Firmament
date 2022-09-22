const {app, BrowserWindow, webContents, globalShortcut, screen, dialog, Tray, Menu, MenuItem, ipcMain } = require('electron')
const { readFileSync, existsSync, mkdirSync, cpSync, writeFileSync} = require('fs')
const { copySync } = require('fs-extra')
const { default: parse} = require('node-html-parser')
const { homedir } = require('os')
const path = require('path')
const { basename, dirname, extname } = require('path')
const { kill } = require('process')
const { clearInterval } = require('timers')

/**
 * creates a Tray object and sets its menu
 */
 function createTray() {

	tray = new Tray("assets/icon.png")
	tray.setToolTip('This is Firmament toolbox')
	tray.setContextMenu(buildTrayMenu())
}

/**
 * builds the tray's menu
 * @returns {Menu} the created menu
 */
function buildTrayMenu() {

	/**
	 * checks wether the current wallpaper is pinned or not
	 * @returns {bool} true if wallpaper is pinned, false otherwise
	 */
	function isCurrentWallpaperPinned() {
		let result = false
		if (config.pinnedWallpapers.length != 0) {
			config.pinnedWallpapers.forEach(element => {
				if (config.lastLoadedWallpaper.toString() == element.src.toString()) {
					result = true
				}
			})
			return result
		}
		return result

	}

	/**
	 * Creates the pinned wallpaper submenu
	 * @returns {Menu} the submenu
	 */
	function buildPinnedWallpapersSubMenu()  {
		let submenu = new Menu()
		if (config.pinnedWallpapers.length != 0) {
			config.pinnedWallpapers.forEach(element => {
				submenu.append(new MenuItem({
					label : element.name, 
					type : "normal", 
					click : switchWallpaper.bind(this, configDirectory+element.src)
				}))
			})
		}
		else {
			submenu.append(new MenuItem({label : "No wallpaper pinned", enabled : false}))
		}
		return submenu
	}
	
	let pinMenuItem
	if (isCurrentWallpaperPinned()) {
		pinMenuItem = new MenuItem({label : 'Unpin this wallpaper', type : 'normal', click : unpinCurrentWallpaper})
	}
	else {
		pinMenuItem = new MenuItem({label : 'Pin this wallpaper', type : 'normal', click : pinCurrentWallpaper})
	}


	const trayMenu = Menu.buildFromTemplate([
		{ label : 'Firmament', type : 'normal', enabled : false },
		{ type  : 'separator'},
		{ label : 'Change wallpaper', type : 'normal' , click : setWallpaper },
		{ label : 'Import new wallpaper', type : 'normal', click : createWallpaperCreatorWindow },
		pinMenuItem,
		{ label : "Pinned Wallpapers", sublabel : "oui" , submenu : buildPinnedWallpapersSubMenu()},
		{ type  : "separator"},
		{ label : "Preferences", type : 'normal', click : createPreferencesWindow},
		{ label: 'Quit Firmament', type: 'normal', role : "quit" }
	  ])

	  return trayMenu
}

/**
 * refreshes the tray by rebuilding it's menu
 */
function refreshTray() {
	tray.setContextMenu(buildTrayMenu())
}