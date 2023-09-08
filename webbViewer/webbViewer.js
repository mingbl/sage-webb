var webbViewer = SAGE2_App.extend({
    init: function(data) {
        this.SAGE2Init("div", data)
        this.element.id = "div" + this.id

        this.redraw = true
        this.log("Webb Viewer started")

        //  -----   -----   Global variables    -----   -----   //

        const resourcePath = this.resrcPath
        const imageDirectory = `${resourcePath}images/local_images/`,
            imageJson = `${imageDirectory}images.json`,
            metaImageDirectory = `${resourcePath}images/meta/`

        const container = this.element
        this.element.classList.add("container")
        this.resizeEvents = "continuous"

        //  Initialise variables to represent CAVE screen attributes
        const columns = 20, viewerWidth = 4000, viewerHeight = 440

        // Startup screen delay duration
        const loadingDelay = 5 * 1000
        // Time before the image set is replaced (ms)
        const imageLifespan = 20 * 1000
        // Time before the next external image is pulled from the API (ms)
        const externalImagePullRate = 0.5 * 1000
        
        // Array of image objects [{title, description, url}...]
        let images = []
        // Array of Image() elements [HTMLImageElement]
        let imageCache = []
        // Incrementing counter for image displayed, used by renderDisplay()
        let imageCounter = 0
        // Counter for startup images preloaded. Used by checkStartupImagesFullyPreloaded() to stop attempting to preload nonexistant startup images
        let numOfStartupImages = 0, numOfImagesCurrentlyPreloaded = 0, startUpImagesFullyPreloaded = false
        // Incrementing counter for external images pulled
        let numOfExternalImagesPulled = 0
        
        //  Store API key in a variable
        const apiKey = "01dcb39fbbee4546f965dd0d8d512342"
        //  Store API secret in a variable
        const apiSecret = "0dec3ebc72ea2d36"
        //  Store ID of a photoset (album) to retrieve images from
        const albumID = "72177720305127361"

        //  Initialise arrays to hold the IDs of blacklisted and whitelisted images
        let blacklist = [], whitelist = []

        const viewerAspectRatio = viewerWidth / viewerHeight

        //  -----   -----   End global variables    -----   -----   //

        /**
         * Returns the url input, and prepends the file path if it's a local file
         * @returns image url, formatted correctly
         */
        String.prototype.asImageUrl = function () {
            if (this.includes("http")) return this
            else return `${imageDirectory}${this}`
        }
  
        /**
         * Workaround for printing to the console
         * @param {string} message - Message to print to console log
         */
        function printConsoleLog(message) {this.log(message)}

        /**
         * Create an element, add class name, and append to a parent element
         * @param {string} tag - html element <div> <h1> <p> etc.
         * @param {string} className - class name to add to element, for CSS
         * @param {string} parent - parent element, for appending this element to as a child
         * @returns reference to the new component (element) created
         */
        function createComponent(tag, className, parent) {
            const newElement = document.createElement(tag)
            let classes = className.split(" ")
            classes.forEach(c => {newElement.classList.add(c)})
            parent.appendChild(newElement)
            return newElement
        }
        
        /**
         * Create a showcase (text part + image part) and append to the container
         * @param {object} image - an image object {} in the images [] array
         * @param {integer} numOfColumns - number of columns necessary to display the whole image (excluding text part)
         */
        function createShowcase(image, numOfColumns) {
            this.log(`CREATING SHOWCASE for: ${image.url.asImageUrl()}`)

            const textPart = createComponent("div", "text-part", container)
            textPart.style.width = `${100 / columns}%`
            textPart.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)
            
            const title = createComponent("h1", "title", textPart)
            title.innerHTML = image.title
        
            const description = createComponent("p", "description", textPart)
            description.innerHTML = image.description
            
            const imagePart = createComponent("div", "image-part", container)
            imagePart.style.backgroundImage = `url(${image.url.asImageUrl()})`
            imagePart.style.width = `${numOfColumns * (100 / columns)}%`
            imagePart.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)
        }
        
        /**
         * Render as many images as can be displayed until adding an image exceeds 20 columns.
         */
        function renderDisplay() {
            this.log(`Rendering Display`)

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

                const imageAspectRatio = image.width / image.height
        
                const numOfColumns = Math.ceil((columns / viewerAspectRatio) * imageAspectRatio)
                const numOfRequiredColumns = numOfColumns + 1 // Image + Text

                // Don't render this image this rotation if it can't fit on the screen
                if (columnsUsed + numOfRequiredColumns > columns) return

                columnsUsed += numOfRequiredColumns

                createShowcase(image, numOfColumns)
            }
        }

        /**
         * Preload an image by creating an image element in memory and setting the src to the url, to download the img and cache it in memory.
         * @param {integer} imageIndex - index in images array []
         */
        async function preloadImage(imageIndex) {
            if (images.length < imageIndex) return

            const image = images[imageIndex]

            // If the image is already preloaded, skip. This function should not be called at this point.
            if (image.preloaded === true) return

            this.log(`IMAGE ${imageIndex} will be preloaded. (${image.url.asImageUrl()})`)

            // Create img in memory
            const imgCache = new Image()
            // const imgCache = document.createElement("img")
            imgCache.src = image.url.asImageUrl()
            imageCache[imageIndex] = imgCache

            imgCache.onload = function () {
                image.width = imgCache.naturalWidth
                image.height = imgCache.naturalHeight
                image.preloaded = true

                printConsoleLog(`IMAGE ${imageIndex} has preloaded. Width: ${imgCache.naturalWidth} Height: ${imgCache.naturalHeight}. (${image.url.asImageUrl()})`)

                checkStartupImagesFullyPreloaded()
            }
        }

        /**
         * Checks if startup images are fully preloaded now, and starts the render loop.
         */
        function checkStartupImagesFullyPreloaded() {
            // If the 'startup images fully preloaded' flag has already been marked true, don't continue
            if (startUpImagesFullyPreloaded) return

            numOfImagesCurrentlyPreloaded++

            // If startup images are all preloaded, begin render loop
            if (numOfImagesCurrentlyPreloaded === numOfStartupImages) {
                startUpImagesFullyPreloaded = true
                printConsoleLog(`STARTUP IMAGES fully preloaded (${numOfImagesCurrentlyPreloaded}/${numOfStartupImages})`)
                setTimeout(startRenderLoop, loadingDelay)
            }
        }

        /**
         * Read startup images specified in images/local_images/images.json
         */
        function readStartupImages() {
            readFile(imageJson, function(err, imageData) {
                this.log(`Attempting to read file ${imageJson}`)
                if (err) throw err
                else {
                    for (let i = 0; i < imageData.length; i++) {
                        const image = imageData[i]
                        image.preloaded = false

                        images.push(image)
                    }
                    this.log(`Reading images`)
    
                    images.forEach(image => {this.log(`IMAGE ${image.title} ${image.url} found in the json`)})
    
                    // Preload startup images
                    numOfStartupImages = imageData.length
                    for (let i = 0; i < numOfStartupImages; i++) {
                        preloadImage(i)
                    }
                }
              }, "JSON")
        }

        /**
         * Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed 
         * Then use list of external image IDs to add external images and necessary properties to list of images to display
         */
        async function getExternalImages(){

            //  Build url to make api calls to
            const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${apiKey}&photoset_id=${albumID}&format=json&nojsoncallback=1`

            //  Make api call / request
            const apiResponse = await fetch(apiURL)
            //  Parse api call data to JSON
            const responseData = await apiResponse.json()

            //  Store the response data for use
            let responseImages = responseData["photoset"]["photo"]
            
            //  -----   Function logic  -----   //

            //  For all of the external images retrieved
            for (let i = 0; i < responseImages.length; i++) {

                //  Create a reference to the ID of the image being checked
                const externalImageID = responseImages[i]["id"]

                // If the blacklist doesn't contain the image
                if (!blacklist.includes(externalImageID)) {

                    //  Add the images to the queue of images to display
                    whitelist.push(externalImageID)
                }
            }

            this.log("***** WHITELIST FETCHED   *****")
            this.log(`WHITELIST: ${JSON.stringify(whitelist)}`)

            //  Start pulling data for external images
            startPullingExternalImages()
        }

        /**
         *  Retrieves the information required to display each image in the whitelist
         */
        async function getExternalImageData() {          

            // insert check for if all images in the whitelist have been pulled, end here
            if (numOfExternalImagesPulled == whitelist.length) return  

            // Pull image data
            this.log(`----- PULLING EXTERNAL IMAGE: Array no. [${numOfExternalImagesPulled}] ID: ${whitelist[numOfExternalImagesPulled]} of a list of ${whitelist.length} images`)
            
            //  -----   -----   Get image title and description -----   -----   //

            //  Build url to make api calls to
            const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${apiKey}&photo_id=${whitelist[numOfExternalImagesPulled]}&format=json&nojsoncallback=1`

            //  Make api call / request
            const apiResponse = await fetch(apiURL)
            //  Parse api call data to JSON
            const responseData = await apiResponse.json()

            //  Store the response data for use
            const responseImage = responseData["photo"];

            //  Create image object to push to list of images to display
            let imageObject = {

                title: responseImage["title"]["_content"],
                description: responseImage["description"]["_content"],
                url: ""

            };  
            
            //  -----   -----   Get image URL   -----   -----   //

            //  Build url to make api calls to
            const sizeURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&photo_id=${whitelist[numOfExternalImagesPulled]}&format=json&nojsoncallback=1`

            //  Make api call / request
            const sizeReponse = await fetch(sizeURL)
            //  Parse api call data to JSON
            const sizeData = await sizeReponse.json()

            //  Store the response data for use
            const responseSize = sizeData["sizes"]["size"];

            for (let i = 0; i < responseSize.length; i++) {
                
                const s = responseSize[i];

                if (s.label = "Original") {

                    imageObject.url = s.source
                    
                }
                
            }

            printConsoleLog(`Pulled ${imageObject.title} from external repo`);
            printConsoleLog(`Description: ${imageObject.description}`);
            printConsoleLog(`URL: ${imageObject.url}`);

            // Push to images array
            images.push(imageObject);

            // Increment 'external images pulled' counter
            numOfExternalImagesPulled++

            // The following line should preload the image
            preloadImage(images.length-1)
            
        }

        /**
         * Create loading screen.
         */
        function createLoadingScreen() {
            //  Create containing div for startup animation
            let loadingContainer = createComponent("div", "display-center", container)

            let loading = createComponent("div", "auto-size", loadingContainer)

            //  Create startup animation element
            let loadingStar = createComponent("img", "loading-star-icon rotate", loading)
            loadingStar.src = `${metaImageDirectory}star.svg`
        }

        /**
         * Start render loop.
         */
        function startRenderLoop() {
            printConsoleLog(`STARTING FIRST RENDER`)
            // Initial render
            renderDisplay()
            // Render loop
            setInterval(renderDisplay, imageLifespan)

            // Get external images
            getExternalImages()
        }

        /**
         * Start pulling external images.
         */
        function startPullingExternalImages() {

            printConsoleLog("*****  Starting to pull external image data   *****")
            
            //  Create delay for API calls so not calling all at once
            setInterval(getExternalImageData, externalImagePullRate)
            
        }

        createLoadingScreen()

        readStartupImages()

    },
    resize: function(date) {
        this.refresh(date)
    },
    quit: function() { },
})