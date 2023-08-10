var webbViewer = SAGE2_App.extend({
    // The init function will be called during application creation
    // The signature must include the data parameter which will be passed to the parent through SAGE2Init()
    init: function(data) {

        // Create the application with a div node
        this.SAGE2Init("div", data);

        // `this.element` is created and assigned based on the above SAGE2Init.
        // In this case, this.element is a div
        var container = this.element

        // Assign the div node an id.
        // `this.id` is a unique identifier created for this instance of the app
        this.element.id = "div" + this.id;

        this.element.style.background = "white";

        const images = [
            {
                title: "Heading",
                description: "Description",
                url: "https://placehold.co/600x400/png"
            },
            {
                title: "Heading2",
                description: "Description2",
                url: "https://placehold.co/500x450/png"
            },
        ]

        container.style.display = "flex"

        images.forEach(image => {
            let div = document.createElement("div")
            div.style.display = "flex"
            div.style.flexDirection = "row"
            container.appendChild(div)

            let textPart = document.createElement("div")
            div.appendChild(textPart)

            let title = document.createElement("h1")
            title.innerHTML = image.title
            textPart.appendChild(title)

            let description = document.createElement("p")
            description.innerHTML = image.description
            textPart.appendChild(description)
            
            let imagePart = document.createElement("div")
            div.appendChild(imagePart)

            let img = document.createElement("img")
            img.src = image.url
            img.style.height = "100%"
            img.style.maxWidth = "100%"
            imagePart.appendChild(img)
        });
    },
});