function displayImages(_imageArray){

    _imageArray.forEach(image => {

        let div = document.createElement("div")
        div.style.display = "flex"
        div.style.flexDirection = "row"
        CONTAINER.appendChild(div)

        let textPart = document.createElement("div")
        div.appendChild(textPart)
        textPart.style.padding = "50px"

        let title = document.createElement("h1")
        title.innerHTML = image.title
        title.style.margin = 0
        title.style.fontSize = "200px"
        title.style.color = "white"
        textPart.appendChild(title)

        let description = document.createElement("p")
        description.innerHTML = image.description
        description.style.margin = 10
        description.style.fontSize = "50px"
        description.style.textAlign = "justify"
        description.style.textJustify = "inter-word"
        description.style.width = "1200px"
        description.style.color = "white"
        textPart.appendChild(description)
        
        let imagePart = document.createElement("div")
        // div.style.display = "flex"
        div.appendChild(imagePart)

        let img = document.createElement("img")
        img.src = image.url
        img.style.height = "100vh"
        // img.style.maxWidth = "100%"
        imagePart.appendChild(img)

    });

}