const { execSync, exec } = require('child_process')
const {app, BrowserWindow, webContents, globalShortcut, screen, dialog, Tray, Menu, MenuItem, ipcMain } = require('electron')
const { readFileSync, existsSync, mkdirSync, cpSync, writeFileSync} = require('fs')
const { copySync } = require('fs-extra')
const { default: parse, Node } = require('node-html-parser')
const { homedir } = require('os')
const path = require('path')
const { basename, dirname, extname } = require('path')
const { kill } = require('process')
const { clearInterval } = require('timers')


/*
                  | |                                   / _(_)      
  __ _ _ __  _ __ | |__   __ _ ___  ___  ___ ___  _ __ | |_ _  __ _ 
 / _` | '_ \| '_ \| '_ \ / _` / __|/ _ \/ __/ _ \| '_ \|  _| |/ _` |
| (_| | |_) | |_) | |_) | (_| \__ \  __/ (_| (_) | | | | | | | (_| |
 \__,_| .__/| .__/|_.__/ \__,_|___/\___|\___\___/|_| |_|_| |_|\__, |
      | |   | |                                                __/ |
      |_|   |_|                                               |___/ 
*/

// disables the possiblity to pause audio/video of the wallpaper through os itself (notification with play/pause option). Done to avoid bloat on the notification panel
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');



/*
      | |     | |         | |               (_)     | |   | |          
  __ _| | ___ | |__   __ _| |_   ____ _ _ __ _  __ _| |__ | | ___  ___ 
 / _` | |/ _ \| '_ \ / _` | \ \ / / _` | '__| |/ _` | '_ \| |/ _ \/ __|
| (_| | | (_) | |_) | (_| | |\ V / (_| | |  | | (_| | |_) | |  __/\__ \
 \__, |_|\___/|_.__/ \__,_|_| \_/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/
  __/ |                                                                
 |___/                                                                 

*/

var config
var configDirectory = homedir()+"/.firmament"

var wallpaperWindow
var wallpaperWindowPID
var tray

var wallpaperWindowInterval


/*
          _           _                                       _   _              __                  _   _                 
         (_)         | |                                     | | (_)            / _|                | | (_)                
__      ___ _ __   __| | _____      _____  ___ _ __ ___  __ _| |_ _  ___  _ __ | |_ _   _ _ __   ___| |_ _  ___  _ __  ___ 
\ \ /\ / / | '_ \ / _` |/ _ \ \ /\ / / __|/ __| '__/ _ \/ _` | __| |/ _ \| '_ \|  _| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
 \ V  V /| | | | | (_| | (_) \ V  V /\__ \ (__| | |  __/ (_| | |_| | (_) | | | | | | |_| | | | | (__| |_| | (_) | | | \__ \
  \_/\_/ |_|_| |_|\__,_|\___/ \_/\_/ |___/\___|_|  \___|\__,_|\__|_|\___/|_| |_|_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
*/

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



/*
               _ _                                                                                         _   
              | | |                                                                                       | |  
__      ____ _| | |_ __   __ _ _ __   ___ _ __ _ __ ___   __ _ _ __   __ _  __ _  ___ _ __ ___   ___ _ __ | |_ 
\ \ /\ / / _` | | | '_ \ / _` | '_ \ / _ \ '__| '_ ` _ \ / _` | '_ \ / _` |/ _` |/ _ \ '_ ` _ \ / _ \ '_ \| __|
 \ V  V / (_| | | | |_) | (_| | |_) |  __/ |  | | | | | | (_| | | | | (_| | (_| |  __/ | | | | |  __/ | | | |_ 
  \_/\_/ \__,_|_|_| .__/ \__,_| .__/ \___|_|  |_| |_| |_|\__,_|_| |_|\__,_|\__, |\___|_| |_| |_|\___|_| |_|\__|
                  | |         | |                                           __/ |                              
                  |_|         |_|                                          |___/                               
*/

/**
 * Loads the wallpaper window with the given html/url file
 * @param {string} pathToWallpaper 
 */
function loadWallpaper(window, pathToWallpaper) {
	switch (extname(pathToWallpaper)) {
		case ".html":
			window.loadFile(pathToWallpaper)
			break
		case ".url":
			let urlFile = readFileSync(pathToWallpaper, {encoding : "utf-8"})
			window.loadURL(urlFile.substring(urlFile.lastIndexOf('URL')+4))

	}
}
/**
 * opens a dialog window allowing to select a html/url file and then calls switchWallpaper
 */ 
function setWallpaper() {
	// we open the dialog window
	dialog.showOpenDialog({
		title : "Set wallpaper",
		defaultPath : configDirectory+"/wallpapers/",
		properties : ['openFile'], 
		filters : [
			{name : 'WEB', extensions : ['html', 'url']}

		]}).then((promiseResult) => { 
			// and then we switch the wallpaper by giving the new wallpaper file path obtained thanks to the dialog window
			if (promiseResult !== undefined) {
				if (promiseResult.filePaths.length != 0) {
				switchWallpaper(promiseResult.filePaths[0])
				}
			}
		})
}

/**
 * replaces the currently rendered wallpaper by the one corresponding to given path
 * @param {string} pathToWallpaper the wallpaper's path  
 */ 
function switchWallpaper(pathToWallpaper) {
	loadWallpaper(wallpaperWindow, pathToWallpaper)
	config.lastLoadedWallpaper = pathToWallpaper.substring(pathToWallpaper.indexOf('/wallpapers'))
	saveUserConfig()
	refreshTray()
}

/**
 * generates a new wallpaper in the user config wallpaper directory
 * @param {string} fileType 
 * @param {string} filePath 
 * @param {string} wallpaperName 
 * @returns the new wallpaper path
 */
function importWallpaper(fileType, filePath, wallpaperName) {

	// we set the names of folder and file to create in the config directory
	const newFolder = configDirectory+'/wallpapers/'+wallpaperName+'/'
	let newFileName
	if (!fileType.match('URL')){
		newFileName = wallpaperName+extname(filePath)
	}
		
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
	else if (fileType.match("URL")) {
		let urlFile = '[InternetShortcut]\nURL='+filePath
		writeFileSync(newFolder+wallpaperName+".url",urlFile.toString())
		return newFolder+wallpaperName+".url"
	}
	else {
		throw "Something went wrong"
	}

}

/**
 * adds the current wallpaper in the list of pinned wallpapers in the config file and refreshes the tray
 */
function pinCurrentWallpaper() {
	config.pinnedWallpapers.push({
		"name" : config.lastLoadedWallpaper.substring(dirname(config.lastLoadedWallpaper).lastIndexOf('/')+1, config.lastLoadedWallpaper.lastIndexOf('/')), 
		"src" : config.lastLoadedWallpaper})
	saveUserConfig()
	refreshTray()
}

/**
 * removes the current wallpaper from the list of pinned wallpapers in the config file and refreshes the tray
 */
function unpinCurrentWallpaper() {
	config.pinnedWallpapers.splice(config.pinnedWallpapers.findIndex(pin => pin.src.match(config.lastLoadedWallpaper)), 1)
	saveUserConfig()
	refreshTray()
}

/*
| |                                                                             | |  
| |_ _ __ __ _ _   _ _ __ ___   __ _ _ __   __ _  __ _  ___ _ __ ___   ___ _ __ | |_ 
| __| '__/ _` | | | | '_ ` _ \ / _` | '_ \ / _` |/ _` |/ _ \ '_ ` _ \ / _ \ '_ \| __|
| |_| | | (_| | |_| | | | | | | (_| | | | | (_| | (_| |  __/ | | | | |  __/ | | | |_ 
 \__|_|  \__,_|\__, |_| |_| |_|\__,_|_| |_|\__,_|\__, |\___|_| |_| |_|\___|_| |_|\__|
                __/ |                             __/ |                              
               |___/                             |___/                               
*/

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

/*
(_)           
 _ _ __   ___ 
| | '_ \ / __|
| | |_) | (__ 
|_| .__/ \___|
  | |         
  |_|         

*/

ipcMain.on("importWallpaper", (event, fileType, filePath, wallpaperName, isActive) => {
	let newWallpaper = importWallpaper(fileType, filePath, wallpaperName)

	if (isActive) {
		switchWallpaper(newWallpaper)
	}
})

ipcMain.on("wallpaperWindowPID", (event, pid) => {
	wallpaperWindow = pid
	console.log(pid)
})


// A refaire --> marche pas + pas adapté au multi screen
// /**
//  * Checks if the wallpaper window is currently completely hidden behind any system window
//  * @returns {bool} true if the window is hidden, false otherwise
//  */
// function doesWallpaperNeedsToBeDeactivated() {

// 	let wmctrlResult
// 	// wmctrl get all windows managed by the system desktop manager
// 	try {
// 		exec("wmctrl -l -p -G", ).then((result) => {
// 			let windowinfos = []

// 			/* 
// 			we build the windowinfos array that stores windows informations, as the following :
// 			each element of windowinfos is an array of window infos, like this :
// 			windowid, z-order (0 for normal, -1 for desktop), window int id, x position, y position, width, height, name
// 			*/
// 			// we iterate over every non empty line from wmctrl result
// 			result.toString().split('\n').filter(x =>x !== '').forEach(window => {
		
// 				let temp = []
// 				// we split the string in an array of non empty strings
// 				let info = window.split(" ").filter(x => x !== '');
	
// 				// we put the 7 first elements of the info array into the temp array
// 				for (let infoindex = 0; temp.length <= 6; ++infoindex) {
// 					temp.push(info[infoindex])
// 				}

// 				// we concatenate the last elements of the info array, which correspond to the name of the window
// 				temp[7] = info.slice(8, info.length).join(' ')

// 				// we remove the windows that are Firmament itself
// 				if (temp[7] != "Firmament") {
// 					windowinfos.push(temp)
// 				}
// 			})

// 			let notHiddenWindows = []
// 			let maximizedWindows = []
	
// 			// now we check for maximized windows and hidden windows
// 			for (let i = 0; i < windowinfos.length; ++i) {
// 				let temp
			
// 				/*
// 				xwininfo gives informations about a precise window given with -id, 
// 				and the -wm option gives window anager related informations about the window manager (type of window, position, etc...)
// 				*/
// 				try {
// 					exec('xwininfo -wm -id '+windowinfos[i][0]).then((result) => {
// 						if (!result.includes("Hidden")) {
// 							notHiddenWindows.push(windowinfos[i])
// 							if (temp.includes("Maximized Horz") && temp.includes("Maximized Vert")) {
// 								maximizedWindows.push(windowinfos[i])
// 							}
// 						}
// 					})
// 				}
// 				catch{
					
// 				}
// 			}
// 			if (maximizedWindows.length != 0) {
// 				return true
// 			}
// 			else {	
// 				return false
// 			}
// 		})
// 	}
// 	catch {
// 		return true
// 	}
// }




/*
                                       _       
                                       | |      
  __ _ _ __  _ __   _____   _____ _ __ | |_ ___ 
 / _` | '_ \| '_ \ / _ \ \ / / _ \ '_ \| __/ __|
| (_| | |_) | |_) |  __/\ V /  __/ | | | |_\__ \
 \__,_| .__/| .__/ \___| \_/ \___|_| |_|\__|___/
      | |   | |                                 
      |_|   |_|                                 

*/

app.whenReady().then(() => {
	loadUserConfig()

	createTray()

	wallpaperWindow = createWallpaperWindow()
	wallpaperWindow.once('ready-to-show', () => {
		wallpaperWindow.show()
		wallpaperWindowPID = wallpaperWindow.webContents.getOSProcessId()
	}) 


	

	globalShortcut.register(config.shortcuts.import, () => {
		createWallpaperCreatorWindow()
	})

	globalShortcut.register(config.shortcuts.choose, () => {
		setWallpaper()
	})

	globalShortcut.register(config.shortcuts.quit, () => {
		app.quit()
	})

	globalShortcut.register(config.shortcuts.nextPinnedWallpaper, () => {
		checkUserPinsIntegrity()

		if (config.pinnedWallpapers.length != 0) {
			let indexOfPinnedWallpaper = 0
			config.pinnedWallpapers.forEach(pinnedWallpaper => {
				if (pinnedWallpaper.src.match(config.lastLoadedWallpaper)) {
					indexOfPinnedWallpaper = config.pinnedWallpapers.indexOf(pinnedWallpaper)
				}
			})
	
			if (indexOfPinnedWallpaper == config.pinnedWallpapers.length-1) {
				switchWallpaper(configDirectory+config.pinnedWallpapers[0].src)
	
			}
			else {
				switchWallpaper(configDirectory+config.pinnedWallpapers[indexOfPinnedWallpaper+1].src)
			}
		}
		
	})

	globalShortcut.register(config.shortcuts.prevPinnedWallpaper, () => {
		checkUserPinsIntegrity()

		if (config.pinnedWallpapers.length != 0) {
			let indexOfPinnedWallpaper = 0
			config.pinnedWallpapers.forEach(pinnedWallpaper => {
				if (pinnedWallpaper.src.match(config.lastLoadedWallpaper)) {
					indexOfPinnedWallpaper = config.pinnedWallpapers.indexOf(pinnedWallpaper)
				}
			})
	
			if (indexOfPinnedWallpaper == 0) {
				switchWallpaper(configDirectory+config.pinnedWallpapers[config.pinnedWallpapers.length-1].src)
			}
			else {
				switchWallpaper(configDirectory+config.pinnedWallpapers[indexOfPinnedWallpaper-1].src)
			}
		}
		
	})
} )

app.on('will-quit', () => {
	saveUserConfig()
	clearInterval(wallpaperWindowInterval)
})



/*
                 __ _       
                 / _(_)      
  ___ ___  _ __ | |_ _  __ _ 
 / __/ _ \| '_ \|  _| |/ _` |
| (_| (_) | | | | | | | (_| |
 \___\___/|_| |_|_| |_|\__, |
                        __/ |
                       |___/ 
*/

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
	checkUserFilesIntegrity()
	
	config = JSON.parse(readFileSync(configDirectory+"/config.json", {encoding : 'utf-8'}))
	if (!existsSync(configDirectory+config.lastLoadedWallpaper)) {
		config.lastLoadedWallpaper = '/wallpapers/default/default_wallpaper.html'
	}
	checkUserShortcutsIntegrity()
	checkUserPinsIntegrity()
}

function saveUserConfig() {
	writeFileSync(configDirectory+"/config.json", JSON.stringify(config, null, 4), "utf-8",)
}

/*
           _          
          (_)         
 _ __ ___  _ ___  ___ 
| '_ ` _ \| / __|/ __|
| | | | | | \__ \ (__ 
|_| |_| |_|_|___/\___|              
*/

const keyCodes = /^([0-9A-Z)!@#$%^&*(:+<_>?~{|}";=,\-./`[\\\]']|F1*[1-9]|F10|F2[0-4]|Plus|Space|Tab|Capslock|Numlock|Backspace|Delete|Insert|Return|Enter|Up|Down|Left|Right|Home|End|PageUp|PageDown|Escape|Esc|VolumeUp|VolumeDown|VolumeMute|MediaNextTrack|MediaPreviousTrack|MediaStop|MediaPlayPause|PrintScreen|num[0-9]|numdec|numadd|numsub|nummult|numdiv)$/;
const modifiers = /^(Command|Cmd|Control|Ctrl|CommandOrControl|CmdOrCtrl|Alt|Option|AltGr|Shift|Super)$/
function isAccelerator(maybeAccelerator) {
	if (maybeAccelerator.charAt(0) == '+' || maybeAccelerator.charAt(maybeAccelerator.length-1) == '+')
		return false

	let splitAccelerator = maybeAccelerator.split('+')
	let result = true
	if (!modifiers.test(splitAccelerator[0])){
		return false
	}
	splitAccelerator.forEach(element => {
		 if (!(keyCodes.test(element) || modifiers.test(element)))
		 	result = false
	})

	return result
 }
