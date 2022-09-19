const { execSync } = require('child_process')
const { info } = require('console')
const {app, BrowserWindow, globalShortcut, screen, ipcRenderer, dialog, Tray, Menu, MenuItem, ipcMain } = require('electron')
const { readFileSync, existsSync, mkdir, cp, close, mkdirSync, cpSync, openSync, readFile, writeFileSync} = require('fs')
const { copySync } = require('fs-extra')
const { default: parse, Node } = require('node-html-parser')
const { readSync } = require('original-fs')
const { homedir } = require('os')
const path = require('path')
const { basename, dirname, extname } = require('path')

// disables the possiblity to pause audio/video of the wallpaper through os itself (notification with play/pause option). Done to avoid bloat on the notification panel
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

// contains the user config of Firmament
var config
var configDirectory = homedir()+"/.firmament"

var wallpaperWindow
var tray

function createWallpaperWindow () {
	let wallpaperWindow = new BrowserWindow({
		frame : false,
		autoHideMenuBar: true,
		width : screen.getPrimaryDisplay().size.width,
		height : screen.getPrimaryDisplay().size.height,
		type : "desktop",
		autoHideMenuBar : true,
		webPreferences : {
			preload : path.join(__dirname, 'preload.js'),
			backgroundThrottling : false,
			enableWebSQL : false,
		}
	})
	wallpaperWindow.loadFile(configDirectory+config.lastLoadedWallpaper)
	return wallpaperWindow
}

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

function createPreferencesWindow () {

}

ipcMain.on("importWallpaper", (event, fileType, filePath, wallpaperName, isActive) => {
	let newWallpaper = importWallpaper(fileType, filePath, wallpaperName)

	if (isActive) {
		switchWallpaper(newWallpaper)
	}
})

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

function setWallpaper() {
	dialog.showOpenDialog({
		title : "Set wallpaper",
		defaultPath : configDirectory+"/wallpapers/",
		properties : ['openFile'], 
		filters : [
			{name : 'HTML', extensions : ['html']}
		]}).then((promiseResult) => {
			if (promiseResult !== undefined) {
				if (promiseResult.filePaths.length != 0) {
				switchWallpaper(promiseResult.filePaths[0])
				}
			}
		})
}

function switchWallpaper(pathToWallpaper) {
	wallpaperWindow.loadFile(pathToWallpaper)
	config.lastLoadedWallpaper = pathToWallpaper.substring(pathToWallpaper.indexOf('/wallpapers'))
	saveConfig()
	refreshTray()
}


function importWallpaper(fileType, filePath, wallpaperName) {
	console.log(fileType)
	const newFolder = configDirectory+'/wallpapers/'+wallpaperName+'/'
	const newFileName = wallpaperName+extname(filePath)

	try {
		mkdirSync(newFolder)
	}
	catch {
		throw "Folder already exists"
	}

	if (fileType.match("image") || fileType.match("video")) {

		cpSync(filePath, newFolder+newFileName)
		cpSync('assets/default_wallpaper.css', newFolder+wallpaperName+".css")

		let htmlFile = readFileSync('assets/default_wallpaper.html')
		let htmlContent = parse(htmlFile.toString("utf-8"))
		htmlContent.querySelector('link').setAttribute("href", wallpaperName+".css")

		if (fileType.match("image")) {
			htmlContent.querySelector('body').set_content('<img src="'+newFileName+'" />')
		}
		else {
			htmlContent.querySelector('body').set_content('<video autoplay loop><source src="'+newFileName+'"></video>')
		}

		writeFileSync(newFolder+wallpaperName+'.html', htmlContent.toString())

		return newFolder+wallpaperName+".html"
	}
	else if (fileType.match("HTML")) {
		copySync(dirname(filePath), newFolder)

		return newFolder+basename(filePath)
	}
	else if (fileType.mactch("URL")) {
		let urlFile = '[InternetShortcut]\nURL='+filePath
		writeFileSync(newFolder+wallpaperName+".url",urlFile.toString())

		return newFolder+wallpaperName+".url"
	}
	else {
		throw "Something went wrong"
	}

}

function openPreferences() {

}
function saveConfig() {
	writeFileSync(configDirectory+"/config.json", JSON.stringify(config, null, 4), "utf-8",)
}

function pinCurrentWallpaper() {
	config.pinnedWallpapers.push({
		"name" : config.lastLoadedWallpaper.substring(dirname(config.lastLoadedWallpaper).lastIndexOf('/')+1, config.lastLoadedWallpaper.lastIndexOf('/')), 
		"src" : config.lastLoadedWallpaper})
	saveConfig()
	refreshTray()
}

function unpinCurrentWallpaper() {
	config.pinnedWallpapers.splice(config.pinnedWallpapers.findIndex(pin => pin.src.match(config.lastLoadedWallpaper)), 1)
	saveConfig()
	refreshTray()
}
function buildTrayMenu() {

	function isCurrentWallpaperPinned() {
		let result = false
		if (config.pinnedWallpapers.length != 0) {
			config.pinnedWallpapers.forEach(element => {
				if (config.lastLoadedWallpaper.toString().match(element.src.toString())) {
					result = true
				}
			})
			return result
		}
		return result

	}

	let pinMenuItem
	if (isCurrentWallpaperPinned()) {
		pinMenuItem = new MenuItem({label : 'Unpin this wallpaper', type : 'normal', click : unpinCurrentWallpaper})
	}
	else {
		pinMenuItem = new MenuItem({label : 'Pin this wallpaper', type : 'normal', click : pinCurrentWallpaper})
	}

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

	const trayMenu = Menu.buildFromTemplate([
		{ label : 'Firmament', type : 'normal', enabled : false },
		{ type  : 'separator'},
		{ label : 'Change wallpaper', type : 'normal' , click : setWallpaper },
		{ label : 'Import new wallpaper', type : 'normal', click : createWallpaperCreatorWindow },
		pinMenuItem,
		{ label : "Pinned Wallpapers", sublabel : "oui" , submenu : buildPinnedWallpapersSubMenu()},
		{ type  : "separator"},
		{ label : "Preferences", type : 'normal', click : openPreferences},
		{ label: 'Quit Firmament', type: 'normal', role : "quit" }
	  ])

	  return trayMenu
}

function createTray() {

	tray = new Tray("assets/icon.png")
	tray.setToolTip('This is Firmament toolbox')
	tray.setContextMenu(buildTrayMenu())
}

function refreshTray() {
	tray.setContextMenu(buildTrayMenu())
}

app.whenReady().then(() => {
	loadUserConfig()

	createTray()

	wallpaperWindow = createWallpaperWindow() 


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
		
	})

	globalShortcut.register(config.shortcuts.quit, () => {
		app.quit()
	})
} )



app.on('will-quit', () => {
	writeFileSync(configDirectory+"/config.json", JSON.stringify(config, null, 4), "utf-8",)
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