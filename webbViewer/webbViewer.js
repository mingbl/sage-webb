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

        container.style.background = "black";

        const images = [
            {
                title: "Heading",
                description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                url: "https://live.staticflickr.com/65535/53104943445_3da1b9392b_o_d.png"
            },
            {
                title: "Heading2",
                description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                url: "https://live.staticflickr.com/65535/53068407159_0d8983cdb3_o_d.jpg"
            },
            {
                title: "Heading3",
                description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                url: "https://live.staticflickr.com/65535/53072881464_4275f02ec5_o_d.png"
            },
            {
                title: "Heading4",
                description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                url: "https://live.staticflickr.com/65535/53040527259_5682c6bcf0_o_d.png"
            },             
        ]

        container.style.display = "flex"
        // container.style.justifyContent = "space-around"
        container.style.flexDirection = "row"

        images.forEach(image => {
            let div = document.createElement("div")
            div.style.display = "flex"
            div.style.flexDirection = "row"
            container.appendChild(div)

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
    },
});