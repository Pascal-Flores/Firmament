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

	doesWallpaperNeedsToBeDeactivated()

}

// returns true or false wether the wallpaper must be paused or not (if it's completely hidden by other windows or not)
function doesWallpaperNeedsToBeDeactivated() {

	// wmctrl get all windows managed by the system desktop manager
	let wmctrlResult = 	execSync("wmctrl -l -p -G", ).toString()
	let windowinfos = []

	// we build the windowinfos array that stores windows informations, as the following :
	// each element of windowinfos is an array of window infos, like this :
	// windowid, z-order (0 for normal, -1 for desktop), window int id, x position, y position, width, height, name
	wmctrlResult.toString().split('\n').forEach(window => {
		let temp = []
		if (window != "") {
			let info = window.split(" ").filter(x => x !== '');
			for (let infoindex = 0; temp.length <= 6; ++infoindex) {
				if (info[infoindex] != "") temp.push(info[infoindex])
			}
			temp[7] = info.slice(7, info.length-1).join(' ')
			// for (let nameindex = 7; nameindex < info.length; ++nameindex ) {
			// 	if (info[nameindex] != "" ) {
			// 		temp[7] += info[nameindex]
			// 	} 
			// }
			console.log(temp.toString())
			windowinfos.push(temp)
		}
	})

	let notHiddenWindows = []
	let maximizedWindows = []  
	
	// now we check for maximized windows and hidden windows (if windows are maximized, we can return true as the wallpaper is totally hidden by any maximized window)
	for (let i = 0; i < windowinfos.length; ++i) {
		let temp = execSync('xwininfo -wm -id '+windowinfos[i][0]).toString()
		//console.log(temp)
		if (temp.includes("Hidden")) {
			notHiddenWindows.push(windowinfos[i])
		}
	}
	//notHiddenWindows.forEach(element => {console.log(element.toString())})

}
app.whenReady().then(() => {
		
	createWindow() 
} )
