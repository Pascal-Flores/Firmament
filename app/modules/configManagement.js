const {app, BrowserWindow, webContents, globalShortcut, screen, dialog, Tray, Menu, MenuItem, ipcMain } = require('electron')
const { readFileSync, existsSync, mkdirSync, cpSync, writeFileSync} = require('fs')
const { copySync } = require('fs-extra')
const { default: parse} = require('node-html-parser')
const { homedir } = require('os')
const path = require('path')
const { basename, dirname, extname } = require('path')
const { kill } = require('process')
const { clearInterval } = require('timers')

function checkUserFilesIntegrity() {
	if (!existsSync(configDirectory)) 					
		mkdirSync(configDirectory)
	if (!existsSync(configDirectory+"/wallpapers/")) 	
		mkdirSync(configDirectory+"/wallpapers/")
	if (!existsSync(configDirectory+"/wallpapers/default/"))	
		mkdirSync(configDirectory+"/wallpapers/default/")
	if (!existsSync(configDirectory+"/wallpapers/default/default_wallpaper.html"))	
		cpSync("assets/default_wallpaper.html", configDirectory+"/wallpapers/default/default_wallpaper.html")
	if (!existsSync(configDirectory+"/wallpapers/default/default_wallpaper.mp4"))	
		cpSync("assets/default_wallpaper.mp4", configDirectory+"/wallpapers/default/default_wallpaper.mp4")
	if (!existsSync(configDirectory+"/wallpapers/default/default_wallpaper.css"))	
		cpSync("assets/default_wallpaper.css", configDirectory+"/wallpapers/default/default_wallpaper.css")
	if (!existsSync(configDirectory+"/config.json"))	
		cpSync("assets/default_config.json", configDirectory+"/config.json")
}

function checkUserShortcutsIntegrity() {
	if(!isAccelerator(config.shortcuts.import))
		config.shortcuts.import = "Super+F+I"
	if(!isAccelerator(config.shortcuts.choose))
		config.shortcuts.choose = "Super+F+C"
	if(!isAccelerator(config.shortcuts.quit))
		config.shortcuts.quit = "Super+F+Q"
	if(!isAccelerator(config.shortcuts.nextPinnedWallpaper))
		config.shortcuts.nextPinnedWallpaper = "Super+F+Right"
	if(!isAccelerator(config.shortcuts.prevPinnedWallpaper))
		config.shortcuts.prevPinnedWallpaper = "Super+F+Left"

	saveUserConfig()
}

function checkUserPinsIntegrity() {
	for(let pinnedWallpaperIndex = 0; pinnedWallpaperIndex < config.pinnedWallpapers.length; ++pinnedWallpaperIndex) {
		if (!existsSync(configDirectory+config.pinnedWallpapers[pinnedWallpaperIndex].src)){
			config.pinnedWallpapers.splice(pinnedWallpaperIndex, 1)
			--pinnedWallpaperIndex
		}
	}
	saveUserConfig()
}

function loadUserConfig() {
	return JSON.parse(readFileSync(configDirectory+"/config.json", {encoding : 'utf-8'}))
}

/**
 * checks, modifies, and saves the config if corrupted/invalid data is detected
 * @param {Object} the config as a JSON object 
 */
function checkUserConfig(config) {
	if (!existsSync(configDirectory+config.lastLoadedWallpaper)) {
		config.lastLoadedWallpaper = '/wallpapers/default/default_wallpaper.html'
	}
	checkUserFilesIntegrity()
	checkUserShortcutsIntegrity()
	checkUserPinsIntegrity()
}

function saveUserConfig() {
	writeFileSync(configDirectory+"/config.json", JSON.stringify(config, null, 4), "utf-8",)
}