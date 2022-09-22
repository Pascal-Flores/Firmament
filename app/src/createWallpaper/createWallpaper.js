function sendRequest() {
    
    let fileType, filePath, name, isActive
    
    document.querySelectorAll(".error").forEach(element => {
        element.remove()
    })

    if (document.querySelector('input[name="fileType"]:checked') == null) {
        document.querySelector('#wallpaperTypes').appendChild(createErrorLabel("You need to select a file type"))
        return
    }
    fileType = document.querySelector('input[name="fileType"]:checked').value

    if (fileType == "URL") {
        filePath = document.querySelector("#filePath").value
        if (filePath.length == 0) {
            document.querySelector('#wallpaperPath').appendChild(createErrorLabel("Please specify a URL"))
            return
        }
        else {
            if(!(filePath.includes('http://') && filePath.includes('https://'))) {
                filePath = 'http://' + document.querySelector("#filePath").value
            }
            else {
                filePath = document.querySelector("#filePath").value
            }
        } 
    }
    else {
        if (document.querySelector('#filePath').files.length == 0){
            document.querySelector('#wallpaperPath').appendChild(createErrorLabel("Please select a file"))
            return
        }
        else {
            filePath = document.querySelector("#filePath").files[0].path
        }
    }

    name = document.querySelector("#name").value
    if(name.length == 0) {
        document.querySelector('#wallpaperName').appendChild(createErrorLabel("Please give a name to your wallpaper"))
        return
    }
    
    isActive = document.querySelector("#setAsCurrentWallpaper").checked


    test = window.electron.importWallpaper(fileType, filePath, name, isActive)
}


function createErrorLabel(text) {
    let errorNode = document.createElement("label")
    errorNode.setAttribute("class", "error")
    errorNode.style.color = "red"
    errorNode.textContent = text
    return errorNode
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