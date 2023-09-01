var webbViewer = SAGE2_App.extend({
    // The init function will be called during application creation
    // The signature must include the data parameter which will be passed to the parent through SAGE2Init()
    init: function(data) {

        // Create the application with a div node
        this.SAGE2Init("div", data);

        // `this.element` is created and assigned based on the above SAGE2Init.
        // In this case, this.element is a div

        // Assign the div node an id.
        // `this.id` is a unique identifier created for this instance of the app
        this.element.id = "div" + this.id;

        var imageDirectory = "local_images/"

        var container = this.element
        this.element.classList.add("container")

        const images = [
            {
                title: "Heading",
                description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                url: "https://cdn.discordapp.com/attachments/1134060514994028594/1139348534957707264/53072881464_d0a95851f1_k.jpg",
                // url: `${imageDirectory}1.jpg`,
                width: 2048,
                height: 1193
                // url: "https://live.staticflickr.com/65535/53104943445_3da1b9392b_o_d.png"
            },
            {
                title: "Heading2",
                description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                url: "https://cdn.discordapp.com/attachments/1134060514994028594/1139348535406506137/53104943445_9398264921_k.jpg",
                // url: `${imageDirectory}2.jpg`,
                width: 2015,
                height: 2048
                // url: "https://live.staticflickr.com/65535/53068407159_0d8983cdb3_o_d.jpg"
            },
            {
                title: "Heading3",
                description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                url: "https://cdn.discordapp.com/attachments/1134060514994028594/1139348535838511254/53040527259_e8567a9d02_k.jpg",
                // url: `${imageDirectory}3.jpg`,
                width: 2048,
                height: 1918
                // url: "https://live.staticflickr.com/65535/53072881464_4275f02ec5_o_d.png"
            },
            {
                title: "Heading4",
                description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                url: "https://cdn.discordapp.com/attachments/1134060514994028594/1139348974659186699/53068407159_dde8245cfe_k.jpg",
                // url: `${imageDirectory}4.jpg`,
                width: 2048,
                height: 1152
                // url: "https://live.staticflickr.com/65535/53040527259_5682c6bcf0_o_d.png"
            },
            {
                title: "Heading5",
                description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                url: "https://cdn.discordapp.com/attachments/716936586180165682/1146979943486586972/The_Sixth_Doctor_Regenerates_Time_and_the_Rani_Doctor_Who_-_YouTube_-_0_05.jpeg",
                width: 1402,
                height: 1080
            }
        ]  

        // Get window width/height https://stackoverflow.com/a/8876069
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        const columns = 20
        const columnWidth = vw / columns
        const viewerAspectRatio = vw / vh
        console.log({
            viewerAspectRatio: viewerAspectRatio,
            columnWidth: columnWidth
        })

        function createShowcase(image, numOfColumns) {
            let div = document.createElement("div")
            div.classList.add("showcase")
            container.appendChild(div)

            let textPart = document.createElement("div")
            textPart.classList.add("text-part")
            div.appendChild(textPart)
            

            let title = document.createElement("h1")
            title.classList.add("title")
            title.innerHTML = `${numOfColumns} ${image.title}`
            textPart.appendChild(title)

            let description = document.createElement("p")
            description.classList.add("description")
            description.innerHTML = image.description
            textPart.appendChild(description)
            
            let imagePart = document.createElement("div")
            imagePart.classList.add("image-part")

            // let img = document.createElement("img")
            // img.classList.add("img")
            imagePart.style.backgroundImage = `url(${image.url})`
            // imagePart.appendChild(img)

            imagePart.style.width = `calc(${numOfColumns} * 5vw)`

            // imagePart.style.width = `calc(${aspectRatio} * 100vh)`

            div.appendChild(imagePart)
        }

        // let imageCounter = 0;

        function getShowcaseWidth(imageCols) {
            return numOfRequiredColumns + 1
        }

        function renderDisplay() {
            let columnsUsed = 0
            for (let i = 0; i < images.length; i++) {
                const image = images[i]

                // Calculate what the width should be to fit into column widths

                let imageAspectRatio = image.width / image.height

                let rescaledImageWidth = imageAspectRatio * vh

                let numOfColumns = Math.ceil(rescaledImageWidth / columnWidth)
                let numOfRequiredColumns = numOfColumns + 1 // Image + Text

                // let imageContainerWidth = numOfColumns

                // if (columnsUsed + numOfRequiredColumns > columns) continue

                columnsUsed += numOfRequiredColumns
                createShowcase(image, numOfColumns)
            }
        }
        
        renderDisplay()
    },
    resize: function(date) {
        this.refresh(date)
    },
    quit: function() {
		// Make sure to delete stuff (timers, ...)
	},
});