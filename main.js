const { execSync } = require('child_process')
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

	checkWindows()

}

function checkWindows() {
	let wmctrlResult = 	execSync("wmctrl -l -p -G", ).toString()
	let windowinfos = []
	wmctrlResult.toString().split('\n').forEach(window => {
		let temp = []
		window.split(" ").forEach(info => {
			if (info != "") temp.push(info)
		})
		windowinfos.push(temp)
	})
	let newwindowinfos = []
	for (let i = 0; i < windowinfos.length; ++i) {
		let temp = execSync('xwininfo -wm -id '+windowinfos[i][0]).toString()
		console.log(temp)
		if (temp.includes("Hidden")) {
			newwindowinfos.push(windowinfos[i])
		}
	}
	
	newwindowinfos.forEach(element => {console.log(element.toString())})

}
app.whenReady().then(() => {
		
	createWindow() 
} )
