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
 * creates a desktop BrowserWindow and loads the current/last used (when app starting) wallpapers
 * @returns {BrowserWindow} the created window
 */
 function createWallpaperWindow () {
	let wallpaperWindow = new BrowserWindow({
		show  : false,
		frame : false,
		autoHideMenuBar: true,
		width : screen.getPrimaryDisplay().size.width,
		height : screen.getPrimaryDisplay().size.height,
		type : "desktop",
		autoHideMenuBar : true,
		backgroundColor : "#000",
		webPreferences : {
			preload : path.join(__dirname, 'preload.js'),
			backgroundThrottling : false,
			enableWebSQL : false,
		}
	})
	
	loadWallpaper(wallpaperWindow, configDirectory+config.lastLoadedWallpaper)
	return wallpaperWindow
}

/**
 * creates a BrowserWindow containing a form to import a new wallpaper
 * @returns {BrowserWindow} the created window
 */
function createWallpaperCreatorWindow() {
	let wallpaperCreatorWindow = new BrowserWindow({
		width : 800,
		height : 600,
		icon : "assets/icon.png",
		webPreferences : {
			preload : path.join(__dirname, 'preload.js'),
		}
	})
	wallpaperCreatorWindow.loadFile("app/src/createWallpaper/createWallpaper.html")
	return wallpaperCreatorWindow
}

/**
 * creates a BrowserWindow containing forms to modify the user config
 * @returns {BrowserWindow} the created window
 */
function createPreferencesWindow () {

}