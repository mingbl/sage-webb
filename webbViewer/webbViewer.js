// import images from "./webbViewer/local_images/images.json"

var webbViewer = SAGE2_App.extend({
    init: function(data) {
        this.SAGE2Init("div", data);
        this.element.id = "div" + this.id;

        this.redraw = true
        this.log("Webb Viewer started")

        const imageDirectory = `${this.resrcPath}local_images/`

        const container = this.element
        this.element.classList.add("container")
        
        this.resizeEvents = "continuous"
        
        const images = [
            {
                "title": `${this.resrcPath} <-- The Pillars of Creation (Webb NIRCam Image)`,
                "description": `${this.resrcPath} <--- This Webb image of the “Pillars of Creation” has layers of semi-opaque, rusty red gas and dust that start at the bottom left and go toward the top right. There are three prominent pillars rising toward the top right. The left pillar is the largest and widest. The peaks of the second and third pillars are set off in darker shades of brown and have red outlines. Peeking through the layers of gas and dust is the background, set in shades of blue and littered with tiny yellow and blue stars. Many of the tips of the pillars appear tinged with what looks like lava. There are also tiny red dots at the edges of the pillars, which are newly born stars.`,
                "url": `${imageDirectory}1.jpg`,
                "width": 3547,
                "height": 6144
            },
            {
                "title": "The Phantom Galaxy Across the Spectrum",
                "description": "This image shows Webb near-infrared data combined with optical data from Hubble. Lacy red filaments spiraling out of the center of the galaxy are overlaid over a black field speckled with stars. The center of the galaxy glows in a pale color. The red filaments contain pops of bright pink, and some blue stars are visible in the background. The red color is dust, lighter oranges in the dust mean that dust is hotter. The young stars sprinkled through the arms and around the core of the galaxy are blue. Heavier older stars nearer the center of the galaxy are cyan and green and contribute to its glow. The pink pops of color are star forming regions. ",
                "url": `${imageDirectory}2.jpg`,
                "width": 2048,
                "height": 1273
            },
            {
                "title": "Heading",
                "description": "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                "url": `${imageDirectory}3.jpg`,
                "width": 2048,
                "height": 1193
            },
            {
                "title": "Headin asdas dasdasd asdg2",
                "description": "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                "url": `${imageDirectory}4.jpg`,
                "width": 2015,
                "height": 2048
            },
            {
                "title": "Heading3",
                "description": "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
                "url": `${imageDirectory}5.jpg`,
                "width": 2048,
                "height": 1918
            },
            {
                "title": "Tennant Titles",
                "description": "This title sequence.",
                "url": `${imageDirectory}6.jpg`,
                "width": 2048,
                "height": 1152
            },
            {
                "title": "Smith Titles",
                "description": "That title sequence",
                "url": `${imageDirectory}7.jpg`,
                "width": 1402,
                "height": 1080
            }
        ]
        
        const columns = 20, viewerWidth = 4000, viewerHeight = 440
        
        /**
         * Time in milliseconds before the image set is replaced
         */
        const imageLifespan = 10000
        
        const viewerAspectRatio = viewerWidth / viewerHeight
        const imageSets = []
        let imageSetCounter = 0
        
        /**
         * Create an element, add class name, and append to a parent element
         * @param {string} tag - html element <div> <h1> <p> etc.
         * @param {string} className - class name to add to element, for CSS
         * @param {string} parent - parent element, for appending this element to as a child
         * @returns reference to the new component (element) created
         */
        function createComponent(tag, className, parent) {
            const newElement = document.createElement(tag)
            newElement.classList.add(className)
            parent.appendChild(newElement)
            return newElement
        }
        
        /**
         * Create a showcase (text part + image part) and append to the container
         * @param {object} image - an image object {} in the images [] array
         * @param {integer} numOfColumns - number of columns necessary to display the whole image (excluding text part)
         */
        function createShowcase(image, numOfColumns) {
            const textPart = createComponent("div", "text-part", container)
            textPart.style.width = `${100 / columns}%`
            textPart.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)
            
            const title = createComponent("h1", "title", textPart)
            title.innerHTML = `${this.resrcPath}${image.title}`
        
            const description = createComponent("p", "description", textPart)
            description.innerHTML = image.description
            
            const imagePart = createComponent("div", "image-part", container)
            imagePart.style.backgroundImage = `url(${image.url})`
            imagePart.style.width = `${numOfColumns * (100 / columns)}%`
            imagePart.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)
        }
        
        /**
         * Arrange/group images {} in the 'images' [] array into 'imageSets' [].
         * 
         * This algorithm uses the aspect ratio of the image to calculate 
         * how many columns are required to display this image and its text part.
         */
        function arrangeImageSets() {
            let imageCounter = 0, columnsUsed = 0, imageSetCounter = 0
            while (images.length > imageCounter) {
                const image = images[imageCounter]
        
                const imageAspectRatio = image.width / image.height
        
                const numOfColumns = Math.ceil((columns / viewerAspectRatio) * imageAspectRatio)
                const numOfRequiredColumns = numOfColumns + 1 // Image + Text
        
                if (columnsUsed + numOfRequiredColumns > columns) {
                    columnsUsed = 0
                    imageSetCounter++
                }
        
                columnsUsed += numOfRequiredColumns
        
                if (!imageSets[imageSetCounter]) imageSets[imageSetCounter] = []
                imageSets[imageSetCounter].push({
                    image: image,
                    numOfColumns: numOfColumns
                })
        
                imageCounter++
            }
        }
        
        /**
         * Render the current image set.
         * 
         * (set by imageSetCounter)
         */
        function renderDisplay() {
            let imageSetCounterModulo = imageSetCounter % imageSets.length
            console.log(`Rendering set ${imageSetCounterModulo}`)
            const imageSet = imageSets[imageSetCounterModulo]
            
            // Clear display
            while (container.firstChild) container.removeChild(container.lastChild)
        
            /**
             * Render each image in the image set
             */
            for (let j = 0; j < imageSet.length; j++) {
                console.log(`Rendering image ${j}`)
                const image = imageSet[j];
                createShowcase(image.image, image.numOfColumns)
            }
        
            imageSetCounter++
        }
        
        arrangeImageSets()
        renderDisplay()
                
        setInterval(renderDisplay, imageLifespan)
    },
    resize: function(date) {
        this.refresh(date)
    },
    quit: function() {
		// Make sure to delete stuff (timers, ...)
	},
});