const {app, BrowserWindow, globalShortcut, screen } = require('electron')

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
}


app.whenReady().then(() => {
		
	createWindow() 
} )
