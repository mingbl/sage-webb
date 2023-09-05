var webbViewer = SAGE2_App.extend({
    init: function(data) {
        this.SAGE2Init("div", data);
        this.element.id = "div" + this.id;

        this.redraw = true
        this.log("Webb Viewer started")

        const imageDirectory = `${this.resrcPath}local_images/`
        const imageJson = `${imageDirectory}images.json`

        const container = this.element
        this.element.classList.add("container")
        
        this.resizeEvents = "continuous"
        
        let images = []

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
            title.innerHTML = `${image.title}`
        
            const description = createComponent("p", "description", textPart)
            description.innerHTML = image.description
            
            const imagePart = createComponent("div", "image-part", container)
            imagePart.style.backgroundImage = `url(${imageDirectory + image.url})`
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
            if (!localImageDataLoaded) return

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

        let localImageDataLoaded = false
        let apiImagesLoaded = false

        async function readLocalImages() {
            readFile(imageJson, function(err, imageData) {
                this.log(`attempting to read file ${imageJson}`)
                if (err) throw err
                else {
                    images = images.concat(imageData)
                    this.log(`Reading images`)
    
                    images.forEach(image => {
                        this.log(image.title)
                    });
    
                    arrangeImageSets()

                    localImageDataLoaded = true
                    // renderDisplay()
                            
                }
              }, "JSON")
        }

        readLocalImages()

        setInterval(renderDisplay, imageLifespan)

    },
    resize: function(date) {
        this.refresh(date)
    },
    quit: function() { },
});