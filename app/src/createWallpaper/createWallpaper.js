function sendRequest() {
    let fileType = document.querySelector('input[name="fileType"]:checked').value
    console.log(fileType)
    let filePath = document.getElementById("filePath").files[0].path
    let name = document.getElementById("name").value
    let isActive = document.getElementById("setAsCurrentWallpaper").checked

    test = window.electron.importWallpaper(fileType, filePath, name, isActive)
}

function changeFilePath (value) {
    let wallpaperPath = document.getElementById("wallpaperPath")
    if (wallpaperPath.style.display = "none") {
        wallpaperPath.style.display = "flex"
    }
    if (wallpaperPath.innerHTML != "") {
        wallpaperPath.innerHTML = ""
    }
    let label = document.createElement("label")
    label.setAttribute("for", "filePath")
    let input = document.createElement("input")
    input.setAttribute("id", "filePath")
    input.setAttribute("name", "filePath")
    input.setAttribute("required", true)
    input.setAttribute("form", "import")
    switch (value) {
        case "image":
            label.textContent = "Choose an image :"
            input.setAttribute("type", "file")
            input.setAttribute("accept", "image/*")

            wallpaperPath.append(label)
            wallpaperPath.append(input)
            break
        case "video":
            label.textContent = "Choose a video :"
            input.setAttribute("type", "file")
            input.setAttribute("accept", "video/*")

            wallpaperPath.append(label)
            wallpaperPath.append(input)
            break
        case "HTML":
            label.textContent = "Choose an html file :"
            input.setAttribute("type", "file")
            input.setAttribute("accept", ".html")

            wallpaperPath.append(label)
            wallpaperPath.append(input)
            break
        case "URL":
            label.textContent = "Enter the website's URL :"
            input.setAttribute("type", "text")

            wallpaperPath.append(label)
            wallpaperPath.append(input)
            break
    }
}