const { execSync } = require('child_process')
const { info } = require('console')
const {app, BrowserWindow, globalShortcut, screen, ipcRenderer, dialog } = require('electron')
const { readFileSync, existsSync, mkdir, cp, close, mkdirSync, cpSync, openSync, readFile, writeFileSync} = require('fs')
const { readSync } = require('original-fs')
const { homedir } = require('os')

app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

var config
var configDirectory = homedir()+"/.firmament"

var wallpaperWindow 
const createWindow = () => {
	wallpaperWindow = new BrowserWindow({
		frame : false,
		autoHideMenuBar: true,
		width : screen.getPrimaryDisplay().size.width,
		height : screen.getPrimaryDisplay().size.height,
		type : "desktop",
		webPreferences : {
			backgroundThrottling : false,
			enableWebSQL : false,
		}
	})
	wallpaperWindow.loadFile(configDirectory+config.lastLoadedWallpaper)

	console.log("loaded html")

	console.log(doesWallpaperNeedsToBeDeactivated())

}

function doesWallpaperNeedsToBeDeactivated() {

	// wmctrl get all windows managed by the system desktop manager
	let wmctrlResult = 	execSync("wmctrl -l -p -G", ).toString()
	let windowinfos = []

	/* 
	we build the windowinfos array that stores windows informations, as the following :
	each element of windowinfos is an array of window infos, like this :
	windowid, z-order (0 for normal, -1 for desktop), window int id, x position, y position, width, height, name
	*/
	// we iterate over every non empty line from wmctrl result
	wmctrlResult.toString().split('\n').filter(x =>x !== '').forEach(window => {
		
		let temp = []
		// we split the string in an array of non empty strings
		let info = window.split(" ").filter(x => x !== '');
	
		// we put the 7 first elements of the info array into the temp array
		for (let infoindex = 0; temp.length <= 6; ++infoindex) {
			temp.push(info[infoindex])
		}

		// we concatenate the last elements of the info array, which correspond to the name of the window
		temp[7] = info.slice(8, info.length).join(' ')

		// we remove the windows that are Firmament itself
		if (temp[7] != "Firmament") {
			windowinfos.push(temp)
		}
	})

	let notHiddenWindows = []
	let maximizedWindows = []
	
	// now we check for maximized windows and hidden windows
	for (let i = 0; i < windowinfos.length; ++i) {
		
		/*
		xwininfo gives informations about a precise window given with -id, 
		and the -wm option gives window anager related informations about the window manager (type of window, position, etc...)
		*/
		let temp = execSync('xwininfo -wm -id '+windowinfos[i][0]).toString()

		if (!temp.includes("Hidden")) {
			notHiddenWindows.push(windowinfos[i])
			if (temp.includes("Maximized Horz") && temp.includes("Maximized Vert")) {
				maximizedWindows.push(windowinfos[i])
			}
		}
	}
	
	if (maximizedWindows.length != 0) return true
	else {
			
		return false
	}
}

function setWallpaper(pathToWallpaper) {
	if (pathToWallpaper !== undefined) {
		if (pathToWallpaper.filePaths.length != 0) {
			wallpaperWindow.loadFile(pathToWallpaper.filePaths[0])
			config.lastLoadedWallpaper = pathToWallpaper.filePaths[0].substring(pathToWallpaper.filePaths[0].indexOf('/wallpapers'))
		}
	}
}

app.whenReady().then(() => {
	loadUserConfig()

	createWindow() 

	globalShortcut.register(config.shortcuts.import, () => {
		dialog.showOpenDialog({
			title : "Import new wallpaper",
			defaultPath : homedir(),
			properties : ['openFile'], 
			filters : [
				{name : 'Images', extensions : ['gif']},
				{name : 'Movies', extensions : ['mp4', 'mkv', 'avi', 'mov']},
				{name : 'HTML', extensions : ['html']}
			]}).then((path) => importWallpaper(path))
	})

	globalShortcut.register(config.shortcuts.choose, () => {
		dialog.showOpenDialog({
			title : "Set wallpaper",
			defaultPath : configDirectory+"/wallpapers/",
			properties : ['openFile'], 
			filters : [
				{name : 'HTML', extensions : ['html']}
			]}).then((path) => setWallpaper(path))
	})

	globalShortcut.register(config.shortcuts.quit, () => {
		app.quit()
	})
} )



app.on('will-quit', () => {
	writeFileSync(configDirectory+"/config.json", JSON.stringify(config), "utf-8")
})

function checkConfigIntegrity() {
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

function loadUserConfig() {
	checkConfigIntegrity()
	
	config = JSON.parse(readFileSync(configDirectory+"/config.json", {encoding : 'utf-8'}))
}
