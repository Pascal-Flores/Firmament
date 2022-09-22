const {BrowserWindow, dialog} = require('electron')
const { readFileSync, mkdirSync, cpSync, writeFileSync} = require('fs')
const { copySync } = require('fs-extra')
const { basename, dirname, extname } = require('path')
const { default: parse} = require('node-html-parser')



/**
 * Loads the wallpaper window with the given html/url file
 * @param {BrowserWindow} window
 * @param {string} pathToWallpaper 
 */
 function loadWallpaper(window, pathToWallpaper) {
	// we check for the file extension of the file
	switch (extname(pathToWallpaper)) {
		case ".html":
			window.loadFile(pathToWallpaper)
			break
		case ".url":
			let urlFile = readFileSync(pathToWallpaper, {encoding : "utf-8"})
			window.loadURL(urlFile.substring(urlFile.lastIndexOf('URL')+4))
			break
	}
}

/**
 * opens a dialog window allowing to select a html/url file and then switches the wallpaper for the specified window
 * @param {BrowserWindow} window
 */ 
function setWallpaper(window) {
	// we open the dialog window
	dialog.showOpenDialog({
		title : "Set wallpaper",
		defaultPath : configDirectory+"/wallpapers/",
		properties : ['openFile'], 
		filters : [
			{name : 'WEB', extensions : ['html', 'url']}
		]
	}).then((promiseResult) => { 
		// and then we switch the wallpaper by giving the new wallpaper file path obtained thanks to the dialog window
		if (promiseResult !== undefined)	
			if (promiseResult.filePaths.length != 0)
				switchWallpaper(window, promiseResult.filePaths[0])
	})
}

/**
 * replaces the currently rendered wallpaper by the one corresponding to given path
 * @param {BrowserWindow} window
 * @param {string} pathToWallpaper the wallpaper's path  
 */ 
function switchWallpaper(window, pathToWallpaper) {
	loadWallpaper(window, pathToWallpaper)
	
	// we update the config to save the last loaded wallpaper
	config.lastLoadedWallpaper = pathToWallpaper.substring(pathToWallpaper.indexOf('/wallpapers'))
	saveUserConfig()
	
	refreshTray()
}

/**
 * generates a new wallpaper in the user config wallpaper directory
 * @param {string} fileType 
 * @param {string} filePath 
 * @param {string} wallpaperName 
 * @returns {string} the new wallpaper path
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

	if (fileType.match("image") || fileType.match("video"))
		return createMediaWallpaper(fileType, filePath, wallpaperName)
	else if (fileType.match("HTML")) 
		return createHTMLWallpaper(filePath, wallpaperName)
	else if (fileType.match("URL"))
		return createURLWallpaper(filePath, wallpaperName)
	else 
		throw "Something went wrong"
}

/**
 * Gives the full path of the new wallpaper folder 
 * @param {string} wallpaperName 
 * @returns {string} the full path of the new wallpaper folder 
 */
function wallpaperFolderPath(wallpaperName) {
	return configDirectory+'/wallpapers/'+wallpaperName+'/'
}

/**
 * copies the file located at filepath in the user .firmament/wallpapers/wallpaperName/ directory, and generates an html and css files used to display the wallpaper
 * @param {string} filePath 
 * @param {string} wallpaperName 
 * @returns {string} the path of the generated html file
 */
function createMediaWallpaper(fileType, filePath, wallpaperName) {

	// we copy the media file in the new wallpaper folder
	cpSync(filePath, wallpaperFolderPath(wallpaperName)+newFileName)
	//we copy the default wallpaper css file and rename it for the new wallpaper
	cpSync('assets/default_wallpaper.css', wallpaperFolderPath(wallpaperName)+wallpaperName+".css")

	// we open a copy of the default wallpaper html file and modify the path of the css stylesheet
	let htmlFile = readFileSync('assets/default_wallpaper.html')
	let htmlContent = parse(htmlFile.toString("utf-8"))
	htmlContent.querySelector('link').setAttribute("href", wallpaperName+".css")

	// depending on the media type, we insert an img or a video tag in the html file copy
	if (fileType.match("image")) {
		htmlContent.querySelector('body').set_content('<img src="'+newFileName+'" />')
	}
	else {
		htmlContent.querySelector('body').set_content('<video autoplay loop><source src="'+newFileName+'"></video>')
	}

	// we write the html copy in the new wallpaper folder
	writeFileSync(wallpaperFolderPath(wallpaperName)+wallpaperName+'.html', htmlContent.toString())

	return newFolder+wallpaperName+".html"
}

/**
 * copies the entire folder in which the filepath is located in the user .firmament/wallpapers/wallpaperName/ directory
 * @param {string} filePath 
 * @param {string} wallpaperName 
 * @returns {string} the path of the copied html file
 */
function createHTMLWallpaper(filePath, wallpaperName) {
	copySync(dirname(filePath), wallpaperFolderPath(wallpaperName))
	return newFolder+basename(filePath)
}

/**
 * writes the given URL in a new .url file located in the user .firmament/wallpapers/wallpaperName/ directory
 * @param {string} URL 
 * @param {string} wallpaperName 
 * @returns {string} the path of the new .url file
 */
function createURLWallpaper(URL, wallpaperName) {
	// we create a .url file containing the given URL
	writeFileSync(wallpaperFolderPath(wallpaperName)+wallpaperName+".url",'[InternetShortcut]\nURL='+URL)
	return wallpaperFolderPath(wallpaperName)+wallpaperName+".url"
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

export {}