var webbViewer = SAGE2_App.extend({
    init: function(data) {
        this.SAGE2Init("div", data);
        this.element.id = "div" + this.id;

        this.redraw = true
        this.log("Webb Viewer started")

        const imageDirectory = `${this.resrcPath}local_images/`
        const imageJson = `${imageDirectory}images.json`

        String.prototype.asImageUrl = function () {
            if (this.includes("http")) return this
            else return `${imageDirectory}${this}`
        }

        const container = this.element
        this.element.classList.add("container")
        
        this.resizeEvents = "continuous"
        
        let images = []
        let imageCache = []

        let externalImagesIDs = []
        let blacklist = []

        // queueExternalImages()

        const columns = 20, viewerWidth = 4000, viewerHeight = 440
        const numOfStartUpImagesToPreload = 8
        // let imagesPreloadedInOrder = numOfImagesToPreload - 1 // Based on the order of the image array

        let numOfImagesCurrentlyPreloaded = 0
        
        function printConsoleLog(message) {
            this.log(message)
        }

        /**
         * Time in milliseconds before the image set is replaced
         */
        const imageLifespan = 10 * 1000
        /**
         * Time in milliseconds before the next image in the images array [] is preloaded
         */
        const preloadDelay = 1 * 1000
        
        const viewerAspectRatio = viewerWidth / viewerHeight
        
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
        function createShowcase(image, numOfColumns, imageID) {
            // const img = document.createElement("img")
            // img.src = imageCache[imageID].src
            // container.appendChild(img)
            // img.style.width = `${numOfColumns * (100 / columns)}%`
            // img.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)
            this.log(`CREATING SHOWCASE for: ${image.url.asImageUrl()}`)

            const textPart = createComponent("div", "text-part", container)
            textPart.style.width = `${100 / columns}%`
            textPart.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)
            
            const title = createComponent("h1", "title", textPart)
            title.innerHTML = image.title
        
            const description = createComponent("p", "description", textPart)
            description.innerHTML = image.description
            
            // printConsoleLog(`imageCache ${imageCache}, imageID ${imageID}, ${imageCache[imageID]}, ${JSON.stringify(imageCache[imageID])}, ${imageCache[imageID].src}`)

            const imagePart = createComponent("div", "image-part", container)
            imagePart.style.backgroundImage = `url(${image.url.asImageUrl()})`
            // imagePart.style.backgroundImage = `url(${imageCache[imageID].src})`
            // imagePart.style.src = imageCache[imageID].src
            imagePart.style.width = `${numOfColumns * (100 / columns)}%`
            imagePart.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)
        }
        
        /**
         * Render as many images as can be displayed until adding an image exceeds 20 columns.
         */
        let imageCounter = 0
        function renderDisplay() {
            // If there are no images in the images array, skip rendering this rotation
            // if (images.length < 1) return

            this.log(`Rendering Display`)

            if (numOfImagesCurrentlyPreloaded < 1) {
                this.log(`No images preloaded`)
                return
            }

            // Clear display
            while (container.firstChild) container.removeChild(container.lastChild)

            /**
             * This algorithm uses the aspect ratio of the image to calculate 
             * how many columns are required to display this image and its text part.
             */
            let columnsUsed = 0
            while (columnsUsed < columns) {
                let imageCounterModulo = imageCounter % images.length
                const image = images[imageCounterModulo]
        
                imageCounter++

                // If image has not been preloaded, skip this image for now
                if (image.preloaded === false) {
                    this.log(`IMAGE NOT PRELOADED: ${imageCounterModulo}/${images.length - 1} (${image.url.asImageUrl()})`)
                    continue
                }

                // this.log(`image: ${JSON.stringify(image)}`)

                const imageAspectRatio = image.width / image.height
        
                const numOfColumns = Math.ceil((columns / viewerAspectRatio) * imageAspectRatio)
                const numOfRequiredColumns = numOfColumns + 1 // Image + Text

                // Don't render this image this rotation if it can't fit on the screen
                if (columnsUsed + numOfRequiredColumns > columns) return

                columnsUsed += numOfRequiredColumns

                createShowcase(image, numOfColumns, imageCounterModulo)
            }

            // if (!localImageDataLoaded || !apiImageDataLoaded) return

        }

        async function preloadImage(imageID) {
            
            if (images.length < imageID) return

            const image = images[imageID]

            /**
             * If the image is already preloaded, skip.
             * This function should not be called at this point.
             */
            if (image.preloaded === true) return

            this.log(`IMAGE ${imageID} will be preloaded. (${image.url.asImageUrl()})`)

            // Create img in memory
            // const imgCache = new Image()
            const imgCache = document.createElement("img")
            // this.log(`created img cache for ${image.url} ${imgCache}`)


            // this.log(`setting img src for ${image.url} ${imgCache}. ${imageDirectory}${image.url}`)
            imgCache.src = image.url.asImageUrl()
            // this.log(`imgCache.src = ${imgCache.src}`)

            imageCache[imageID] = imgCache

            // this.log(`setting onload for imageID ${imageID}`)

            numOfImagesCurrentlyPreloaded++

            imgCache.onload = function () {
                image.width = imgCache.naturalWidth
                image.height = imgCache.naturalHeight
                image.preloaded = true


                printConsoleLog(`IMAGE ${imageID} has preloaded. Width: ${imgCache.naturalWidth} Height: ${imgCache.naturalHeight}. (${image.url.asImageUrl()})`)

            }
            // this.log(`onload line passed for imageID ${imageID}`)
        }

        async function preloadNextImage() {
            if (numOfImagesCurrentlyPreloaded === images.length) return // Done preloading all images in the images array []
            
            let nextImageinQueue = numOfImagesCurrentlyPreloaded

            preloadImage(nextImageinQueue)
        }

        // function imageLoaded(imageID) {
        //     const image = images[imageID]
        //     const imgCache = imageCache[imageID]

        //     this.log(`width: ${this.width}. height: ${this.height}`)
        //     this.log(`this: ${this}`)
        //     this.log(`imgcache: ${imgCache}`)
        //     this.log(`imgcache width: ${imgCache.width}. height: ${imgCache.height}`)
        //     this.log(`imgcache width: ${imgCache.naturalWidth}. height: ${imgCache.naturalHeight}`)

        //     this.log(`image preloaded`)
        //     this.log(`image preloaded image ${image.url}`)
        //     image.width = imgCache.width
        //     image.height = imgCache.height

        //     this.log(`currentSrc: ${imageCache.currentSrc}`)

        //     image.preloaded = true

        //     this.log(JSON.stringify(image))
        //     this.log(JSON.stringify(imgCache))

        // }

        // let localImageDataLoaded = false
        // let apiImageDataLoaded = false

        function readLocalImages() {
            readFile(imageJson, function(err, imageData) {
                this.log(`attempting to read file ${imageJson}`)
                if (err) throw err
                else {
                    for (let i = 0; i < imageData.length; i++) {
                        const image = imageData[i];
                        image.preloaded = false

                        images.push(image)
                    }
                    // images = images.concat(imageData)
                    this.log(`Reading images`)
    
                    images.forEach(image => {
                        this.log(image.title)
                    });
    
                    // Preload start up images
                    for (let i = 0; i < numOfStartUpImagesToPreload; i++) {
                        preloadImage(i)
                    }

                    // localImageDataLoaded = true

                    // renderDisplay()
                }
              }, "JSON")
        }

        const loadingText = createComponent("p", "description", container)
        loadingText.innerHTML = "Loading..."

        readLocalImages()


        setInterval(renderDisplay, imageLifespan)

        setInterval(preloadNextImage, preloadDelay)

        /**
         *  Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed
         * 
         */
        async function queueExternalImages(){

            //  -----   Initialise variables    -----   //

            //  Store API key in a variable
            const apiKey = "01dcb39fbbee4546f965dd0d8d512342";
            //  Store API secret in a variable
            const apiSecret = "0dec3ebc72ea2d36";
            //  Store ID of a photoset (album) to retrieve images from
            let albumID = "72177720305127361";

            //  Build url to make api calls to
            const apiURL = "https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" + apiKey + "&photoset_id=" + albumID + "&format=json&nojsoncallback=1"

            //  Make api call / request
            const apiResponse = await fetch(apiURL);    
            //  Parse api call data to JSON
            const responseData = await apiResponse.json();

            //  Get the list of images from the album via the response data
            let responseImages = responseData["photoset"]["photo"]; 
            
            //  -----   Function logic  -----   //

            //  For all of the external images retrieved
            for (let i = 0; i < responseImages.length; i++) {

                //  Create a reference to the ID of the image being checked
                const externalImageID = responseImages[i]["id"];

                // If the blacklist doesn't contain the image
                if (!blacklist.includes(externalImageID)){

                    //  Add the images to the queue of images to display
                    externalImagesIDs.push(externalImageID);
                    this.log(externalImageID);

                };
                        
            };

            this.log(externalImagesIDs)

            apiImageDataLoaded = true

        }
    },
    resize: function(date) {
        this.refresh(date)
    },
    quit: function() { },
});