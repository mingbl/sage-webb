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

        const display = this.element
        const log = createComponent("div", "display-log", display)
        const logText = createComponent("p", "display-log-text", log)
        const container = createComponent("div", "container", display)
        this.element.classList.add("display")
        this.resizeEvents = "continuous"

        //  Initialise variables to represent CAVE screen attributes
        const columns = 20, usableColumns = 19, viewerWidth = 4000, viewerHeight = 440

        // Startup screen delay duration (seconds)
        const loadingDelay = 5
        // Time before the image set is replaced (seconds) (exclusive of fade transition duration below)
        const imageLifespan = 5
        // Duration of fade in / fade out transitions
        const fadeDuration = 3
        // Time before the next external image is pulled from the API (seconds)
        const externalImagePullRate = 2
        // Pull external images in order? aka, Maintain image album order?
        const pullImagesInOrder = false
        // Limit how many external images should be pulled?
        const limitNumOfExternalImagesToPull = false
        // The max number of external images to pull (irrelevant if the above is set to false)
        const numOfExternalImagesToPull = 20
        
        // Array of image objects [{title, description, url}...]
        let images = []
        // Array of Image() elements [HTMLImageElement]
        let imageCache = []
        // Incrementing counter for image displayed, used by renderDisplay()
        let imageCounter = 0
        // Counter for startup images preloaded. Used by checkStartupImagesFullyPreloaded() to stop attempting to preload nonexistant startup images
        let numOfStartupImages = 0, numOfImagesCurrentlyPreloaded = 0, startUpImagesFullyPreloaded = false
        // Incrementing counter for external images pulled
        let indexForExternalImagePulled = 0
        
        //  Store API key in a variable
        const apiKey = "92c8e64a1118fb6e9e5b777c5625f04b"
        //  Store API secret in a variable
        const apiSecret = "295160358e33d9b6"
        //  Store ID of a photoset (album) to retrieve images from
        const albumID = "72177720305127361"

        //  Initialise arrays to hold the IDs of blacklisted and whitelisted images
        let blacklist = [], whitelist = []
        // Intervals to be started later
        let renderLoopInterval, externalImagePullingInterval

        const viewerAspectRatio = viewerWidth / viewerHeight
        const animationStyle = `${fadeDuration}s linear fadein, ${fadeDuration}s linear ${imageLifespan + fadeDuration}s fadeout`

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
        function printConsoleLog(message) {
            this.log(message)
            logText.innerHTML += `<br>${message}`
        }

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
         * Create a showcase (text part + image part) and append to a fragment
         * @param {integer} imageIndex - the image index for an image object {} in the images [] array
         * @param {integer} numOfColumns - number of columns necessary to display the whole image (excluding text part)
         * @param {element} fragment - the fragment to append elements to
         */
        function createShowcase(imageIndex, numOfColumns, fragment) {
            // Get image
            let image = images[imageIndex]

            const { title, description, url, width, height } = image

            printConsoleLog(`CREATING SHOWCASE for: IMAGE ${imageIndex}/${images.length}. URL: ${url.asImageUrl()}. Preloaded: ${image.preloaded}. Width: ${width}. Height: ${height}`)

            const textPart = createComponent("div", "text-part", fragment)
            textPart.style.setProperty("--textColumns", 1)
            // textPart.style.width = `${100 / columns}%`
            textPart.style.setProperty("animation", animationStyle)
            
            // const titleComponent = createComponent("h1", "title", textPart)
            // titleComponent.innerHTML = title
        
            const descriptionComponent = createComponent("p", "description", textPart)
            descriptionComponent.innerHTML = `imageCounter:${imageCounter}<br>${JSON.stringify(images)}<br><br>${description}`
            // descriptionComponent.innerHTML = `imageCounter:${imageCounter}<br>${JSON.stringify(images)}`
            // images.forEach((image, index) => {
            //     descriptionComponent.innerHTML += `image ${index}: ${image.url}<br>`
            // });
            
            const imagePart = createComponent("div", "image-part", fragment)
            imagePart.style.backgroundImage = `url(${url.asImageUrl()})`
            imagePart.style.setProperty("--imageColumns", numOfColumns)
            // imagePart.style.width = `${numOfColumns * (100 / usableColumns)}%`
            imagePart.style.setProperty("animation", animationStyle)
        }
        
        /**
         * Render as many images as can be displayed until adding an image exceeds 20 columns.
         */
        function renderDisplay() {
            printConsoleLog(`Rendering Display`)

            // Clear display
            // container.replaceChildren()
            container.innerHTML = ""
            // while (container.firstChild) container.removeChild(container.lastChild)

            // Fragment to append this rotation's images to, before appending to the DOM container
            let fragment = new DocumentFragment()

            /**
             * This algorithm uses the aspect ratio of the image to calculate 
             * how many columns are required to display this image and its text part.
             */
            let columnsUsed = 0
            while (columnsUsed < usableColumns) {
                let imageIndex = imageCounter % images.length
                
                const image = images[imageIndex]
                const { preloaded, numOfColumns, url } = image
        
                imageCounter++

                // If image has not been preloaded, skip this image for now
                // if (preloaded != true) {
                //     printConsoleLog(`IMAGE NOT PRELOADED: ${imageIndex}/${images.length - 1} (${url.asImageUrl()})`)
                //     continue
                // }

                const numOfRequiredColumns = numOfColumns + 1 // Image + Text

                /**
                 * Don't render this image this rotation if it can't fit on the screen. 
                 * If we had images that could fit within 1 column, 'break' could be set to 'continue', 
                 * but consideration of its accompanying text part means the columns needs to have 2 empty spaces
                 */
                if (columnsUsed + numOfRequiredColumns > usableColumns) break

                columnsUsed += numOfRequiredColumns

                createShowcase(imageIndex, numOfColumns, fragment)
            }

            container.appendChild(fragment)
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

            printConsoleLog(`IMAGE ${imageIndex} will be preloaded. (${image.url.asImageUrl()})`)

            // Create img in memory
            const imgCache = new Image()
            // const imgCache = document.createElement("img")
            imgCache.src = image.url.asImageUrl()
            imageCache[imageIndex] = imgCache

            imgCache.onload = () => updateArtifactAttributes(imageIndex)
        }

        /**
         * Update the attributes for an artifact/image object. Triggered on preload of an image.
         * Add attributes for width and height, and set the 'preloaded' flag to true.
         * @param {integer} imageIndex - index in images array []
         */
        function updateArtifactAttributes(imageIndex) {
            const image = images[imageIndex]

            const { naturalWidth: width, naturalHeight: height } = imageCache[imageIndex]

            const aspectRatio = width / height
            const numOfColumns = Math.ceil((columns / viewerAspectRatio) * aspectRatio)

            image.width = width
            image.height = height
            image.preloaded = true
            image.aspectRatio = aspectRatio
            image.numOfColumns = 3
            // image.numOfColumns = numOfColumns
        
            printConsoleLog(`IMAGE ${imageIndex} has preloaded. Width: ${width} Height: ${height}. (${image.url.asImageUrl()})`)

            // checkStartupImagesFullyPreloaded()
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
                // Get external images
            }
        }

        /**
         * Read startup images specified in images/local_images/images.json
         */
        function readStartupImages() {
            readFile(imageJson, function(err, imageData) {
                printConsoleLog(`Attempting to read file ${imageJson}`)
                if (err) throw err
                else {
                    // Save number of startup images, to be used by a preload check
                    numOfStartupImages = imageData.length

                    // Copy to images array
                    imageData.forEach((artifact, index) => {
                        images.push(artifact)

                        let { title, url } = artifact
                        printConsoleLog(`IMAGE ${title} ${url} found in the json`)

                        preloadImage(index)
                    })
                }
              }, "JSON")
        }

        /**
         * Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed 
         * Then use list of external image IDs to add external images and necessary properties to list of images to display
         */
        async function getExternalImagesList() {
            printConsoleLog("PULLING LIST OF EXTERNAL IMAGES")

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

            
            printConsoleLog("***** WHITELIST FETCHED   *****")
            printConsoleLog(`WHITELIST: ${JSON.stringify(whitelist)}`)
          
            // Start pulling data for external images
            setTimeout(getExternalImageMetadata, 5000)

        }

        /**
         *  Retrieves the information required to display each image in the whitelist
         */
        async function getExternalImageMetadata() {
            let externalImages = []

            printConsoleLog("Now getting external image metadata")

            for (const index in whitelist) {
                const imageID = whitelist[index]
    
                //  -----   -----   Get image title and description -----   -----   //
                //  Build url to make api calls to
                const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${apiKey}&photo_id=${imageID}&format=json&nojsoncallback=1`

                //  Make api call / request
                const apiResponse = await fetch(apiURL)
                //  Parse api call data to JSON
                const responseData = await apiResponse.json()

                //  Store the response data for use
                const responseImage = responseData["photo"];

                const title = responseImage["title"]["_content"]

                let description = formatDescription(responseImage["description"]["_content"])
                // let description = "This is an example description."
                
                //  -----   -----   Get image URL   -----   -----   //

                //  Build url to make api calls to
                const sizeURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&photo_id=${imageID}&format=json&nojsoncallback=1`

                //  Make api call / request
                const sizeReponse = await fetch(sizeURL)
                //  Parse api call data to JSON
                const sizeData = await sizeReponse.json()

                //  Store the response data for use
                const responseSize = sizeData["sizes"]["size"];

                // Initialise url variable
                let url = ""

                // Get the url for the image that matches the resolution choice (e.g. 'Original', 'Small')
                for (let i = 0; i < responseSize.length; i++) {
                    const s = responseSize[i]
                    // printConsoleLog(`${responseImage["title"]["_content"]}: ${s.label}`)
                    if (s.label != "Original") continue
                    url = s.source
                    description += `<br/>${JSON.stringify(s)}`
                    break
                }

                //  Create image object to push to list of images to display
                let artifact = createArtifact(title, description, url)


                // Push to images array
                // images.push(artifact);
                externalImages.push(artifact)

                printConsoleLog(`Pulled IMAGE ${images.length} ${artifact.title} from external repo`)

                // Preload this image
                // preloadImage(images.length - 1)
            }

            
            images = [...images, externalImages]
            printConsoleLog("all whitelist images added")


        }


        /**
         * Format description to style credits paragraphs, remove links, etc.
         * @param {string} description - description, plain unformatted response from the API
         * @returns 
         */
        function formatDescription(description) {

            const paragraphs = description.split("\n")
            let newParagraphs = []

            console.log("++++++++++++++++++++   DESCRIPTION PARAGRAPHS ++++++++++++++++++++++++")
            
            //  For each paragraph in the description
            paragraphs.forEach((paragraph) => {
                if (paragraph.length < 1) return

                let lowercase = paragraph.toLowerCase()

                // If paragraph includes 'image description', exclude this paragraph
                if (lowercase.includes("image description:")) return

                //  Remove sentences from paragraphs which contain links
                if (paragraph.includes("href")) {
                    paragraph = removeLinks(paragraph)
                }
                
                // Cut off text after a (and inclusive of) backslash
                if (paragraph.includes("\\")) {
                    let backslashIndex = paragraph.indexOf("\\")
                    paragraph = paragraph.substring(0, backslashIndex)
                }

                // Apply styling to 'credits' or 'illustration' paragraph
                if (lowercase.includes("credit") || lowercase.includes("illustration:")){
                    paragraph = `<span class="credits">${paragraph}</span>`
                }

                //  Apply styling to 'this image' paragraph
                if (lowercase.includes("this image:")){
                    paragraph = `<span class="meta-description">${paragraph}</span>`
                }
                
                //  Add the paragraph to the list of descriptions to show on-screen
                newParagraphs.push(paragraph)
            })

            return newParagraphs.join("<br/>")
        }

        /**
         * Remove links (and accompanying 'Learn more:' preceding text) from a paragraph
         * @param {string} paragraph - Input paragraph
         * @returns paragraph with links excluded
         */
        function removeLinks(paragraph) {
            //  Split paragraph into sentences
            const sentences = paragraph.split(/[\. \? \! ]\s/)
            //  Declare variable to store new sentence
            let newSentences = []
        
            //  For each sentence in the paragraph
            sentences.forEach((sentence) => {
                if (sentence.includes("href")) return
                newSentences.push(sentence)
            })
        
            //  Change the paragraph to contain only the sentences we want to keep
            return paragraph = newSentences.join(". ")
        }

        /**
         * Create an artifact (image object {})
         * @param {string} title 
         * @param {string} description 
         * @param {string} url 
         * @returns - the artifact object {}, for pushing to the images array []
         */
        function createArtifact(title, description, url) {
            let artifact = {
                title: title,
                description: description,
                url: url,
                preloaded: false,
                numOfColumns: 3
            }
            return artifact
        }
        
        /**
         * Create loading screen.
         */
        function createLoadingScreen() {
            // Fragment for appending loading elements to before appending to the DOM container
            let fragment = new DocumentFragment()

            //  Create containing div for startup animation
            let loadingContainer = createComponent("div", "display-center", fragment)

            let loading = createComponent("div", "auto-size", loadingContainer)

            //  Create startup animation element
            let loadingStar = createComponent("img", "loading-star-icon rotate", loading)
            loadingStar.src = `${metaImageDirectory}star.svg`

            container.appendChild(fragment)
        }

        /**
         * Start render loop.
         */
        function startRenderLoop() {
            printConsoleLog(`STARTING FIRST RENDER`)
            // Initial render
            renderDisplay()
            // Render loop
            renderLoopInterval = setInterval(renderDisplay, imageLifespan * 1000 + (fadeDuration * 2 * 1000))
        }

        /**
         * Start pulling external images.
         */
        function startPullingExternalImages() {

            printConsoleLog("*****  Starting to pull external image data   *****")
            
            //  Create delay for API calls so not calling all at once
            getExternalImageMetadata()
            // externalImagePullingInterval = setInterval(getExternalImageData, externalImagePullRate * 1000)
            
        }

        createLoadingScreen()

        readStartupImages()

        getExternalImagesList()

        setTimeout(startRenderLoop, loadingDelay * 1000)
    },
    resize: function(date) {
        this.refresh(date)
    },
    quit: function() { },
})