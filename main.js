const { execSync } = require('child_process')
const { info } = require('console')
const {app, BrowserWindow, globalShortcut, screen, ipcRenderer } = require('electron')

const createWindow = () => {
	const backgroundWindow = new BrowserWindow({
		frame : false,
		width : screen.getPrimaryDisplay().size.width,
		height : screen.getPrimaryDisplay().size.height,
		type : "desktop",
		webPreferences : {
			backgroundThrottling : false,
			enableWebSQL : false,
		}
	})
	backgroundWindow.loadFile('index page/index.html')
	console.log("loaded html")

	console.log(doesWallpaperNeedsToBeDeactivated())

}

// returns true or false wether the wallpaper must be paused or not (if it's completely hidden by other windows or not)
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
app.whenReady().then(() => {
		
	createWindow() 
} )
