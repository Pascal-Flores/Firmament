// const { execSync, exec } = require('child_process')
const {app, BrowserWindow, webContents, globalShortcut, screen, dialog, Tray, Menu, MenuItem, ipcMain } = require('electron')
const { readFileSync, existsSync, mkdirSync, cpSync, writeFileSync} = require('fs')
const { copySync } = require('fs-extra')
const { default: parse} = require('node-html-parser')
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



/*
| |                                                                             | |  
| |_ _ __ __ _ _   _ _ __ ___   __ _ _ __   __ _  __ _  ___ _ __ ___   ___ _ __ | |_ 
| __| '__/ _` | | | | '_ ` _ \ / _` | '_ \ / _` |/ _` |/ _ \ '_ ` _ \ / _ \ '_ \| __|
| |_| | | (_| | |_| | | | | | | (_| | | | | (_| | (_| |  __/ | | | | |  __/ | | | |_ 
 \__|_|  \__,_|\__, |_| |_| |_|\__,_|_| |_|\__,_|\__, |\___|_| |_| |_|\___|_| |_|\__|
                __/ |                             __/ |                              
               |___/                             |___/                               
*/



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
