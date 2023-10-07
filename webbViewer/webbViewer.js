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
        metaImageDirectory = `${resourcePath}images/meta/`,
        configJson = `${resourcePath}config.json`

        /**
         * Is this running in SAGE?
         * If false, skips all DOM/rendering and only uses console.
         * (for troubleshooting in node.js outside of SAGE)
         */
        const sage = true

        let config

        const startupImages = [], externalImages = [] // Arrays to contain images
        let artifacts = [] // Array of image objects [{title, description, url}...]
        
        let imageCounter = 0 // Incrementing counter for image displayed, used by renderDisplay(), for console version
        let rotationCounter = 0 // Incrementing counter for number of rotations
        
        let blacklist = []
        let renderLoopInterval // Reference to the render loop (started later)
        
        let showDisplayLog = true // To be overriden by the config json

        const display = (sage) ? this.element : []
        const log = (sage) ? createComponent("div", "display-log", display) : [],
            logText = (sage) ? createComponent("p", "display-log-text", log) : []
        const container = (sage) ? createComponent("div", "container", display) : []
        
        const sageState = (sage) ? this.state : null
        
        if (sage) {
            this.element.classList.add("display")
            this.resizeEvents = "continuous"
        
            // Full screen: Taken from https://bitbucket.org/sage2/sage2/src/46a011ba6bacd47572c26f588310628b55069aad/public/uploads/apps/welcome/welcome.js?at=master#welcome.js-65
            if (this.state.goFullscreen) {
                printConsoleLog(`Going full screen`)
                this.sendFullscreen()
                this.state.goFullscreen = false
                this.SAGE2Sync()
            }
        }
        
        //  -----   -----   End global variables    -----   -----   //
        
        /**
         * Returns the url input, and prepends the file path if it's a local file
         * @returns image url, formatted correctly
         */
        String.prototype.asImageUrl = function () {
            if (this.includes("http")) return this
            else return `${imageDirectory}${this}`
        }
        
        function readConfig() {
            readFile(configJson, (err, data) => {
                printConsoleLog(`- Reading config images json (${configJson})`)
                if (err) throw err
                else {
                    configData = JSON.parse(data)
        
                    config = configData
        
                    let fadeDuration = config.functionality.properties.fadeDuration.value
                    let imageLifespan = config.functionality.properties.imageLifespan.value
        
                    config.generated = {
                        viewerAspectRatio: config.userInterface.properties.viewerWidth.value / config.userInterface.properties.viewerHeight.value,
                        animationStyle: `${fadeDuration}s linear fadein, ${fadeDuration}s linear ${imageLifespan + fadeDuration}s fadeout` // CSS value for transition animation
                    }
                    
                    printConsoleLog(JSON.stringify(config, truncateStrings))

                    manageDisplayLog(config.userInterface.properties.showDisplayLog.value)

                    blacklist = config.images.properties.blacklist.value
        
                    let loadingDelay = config.functionality.properties.loadingDelay.value
                    setTimeout(startRenderLoop, loadingDelay * 1000)
                }
            })
        }
        
        /**
         * Enable/disable the visible display log
         * @param {Boolean} useDisplayLog - the Boolean value from the config.json
         */
        function manageDisplayLog(useDisplayLog) {
            if (!sage) return
        
            if (useDisplayLog) {
                printConsoleLog(`Enabling console log`)
        
                const usableColumns = config.userInterface.properties.usableColumns
        
                usableColumns.value = usableColumns.value - 1
                document.querySelector(':root').style.setProperty("--usableColumns", usableColumns.value)
        
                return
            } 
        
            printConsoleLog(`Hiding console log`)
            showDisplayLog = false
            log.style.setProperty("display", "none")
        }
        
        /**
         * Workaround for printing to the console
         * @param {string} message - Message to print to console log
         */
        function printConsoleLog(message) {
            if (typeof message != "string") message = JSON.stringify(message)
            if (!sage) {console.log(message); return}
            this.log(message)
            if (showDisplayLog) logText.innerHTML += `<br>${message}`
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
         * Create a showcase (text part + image part)
         * @param {integer} index - the image index for an image object {} in the images [] array
         * @returns showcase (HTML element) of the artifact
         */
        function createShowcase(index) {
            const artifact = artifacts[index]
        
            const { title, description, url, numOfColumns, origin } = artifact
        
            printConsoleLog(`#.#.#.# Showcasing ${origin} image [${index}/${artifacts.length - 1}] - ${JSON.stringify(artifact, truncateStrings)}`)
        
            let showcase = new DocumentFragment()
        
            const animationStyle = config.generated.animationStyle
        
            const textPart = createComponent("div", "text-part", showcase)
            textPart.style.setProperty("--textColumns", 1)
            textPart.style.setProperty("animation", animationStyle)
            
            const titleComponent = createComponent("h1", "title", textPart)
            titleComponent.textContent = title
        
            const descriptionComponent = createComponent("p", "description", textPart)
            descriptionComponent.innerHTML = `${description}`
            
            const imagePart = createComponent("div", "image-part", showcase)
            imagePart.style.backgroundImage = `url(${url.asImageUrl()})`
            imagePart.style.setProperty("--imageColumns", numOfColumns)
            imagePart.style.setProperty("animation", animationStyle)
        
            return showcase
        }
        
        /**
         * Render as many images as can be displayed until adding an image exceeds 20 columns.
         */
        function renderDisplay() {
            printConsoleLog(`#.# Start rendering display #${rotationCounter}`)
        
            if (sage) {
                printConsoleLog(`${JSON.stringify(sageState)}`)
            }
        
            if (sage) container.innerHTML = "" // Clear display
        
            let fragment = (sage) ? new DocumentFragment() : [] // Fragment to append this rotation's images to, before appending to the DOM container
        
            /**
             * This algorithm uses the aspect ratio of the image to calculate 
             * how many columns are required to display this image and its text part.
             */
            let columnsUsed = 0
            const usableColumns = config.userInterface.properties.usableColumns.value
            while (columnsUsed < usableColumns) {
                let index = getImageCounter() % artifacts.length
                
        
                const artifact = artifacts[index]
                const { numOfColumns, origin } = artifact
        
                const numOfRequiredColumns = numOfColumns + 1 // Image + Text
        
                /**
                 * Don't render this image this rotation if it can't fit on the screen. 
                 * If we had images that could fit within 1 column, 'break' could be set to 'continue', 
                 * but consideration of its accompanying text part means the columns needs to have 2 empty spaces
                 */
                if (columnsUsed + numOfRequiredColumns > usableColumns) break
        
                columnsUsed += numOfRequiredColumns
        
                printConsoleLog(`#.#.# Selecting ${origin} image [${index}/${artifacts.length - 1}] - ${JSON.stringify(artifact, truncateStrings)}`)
        
                setImageCounter(getImageCounter() + 1)
        
                if (!sage) continue
        
                const showcase = createShowcase(index)
                fragment.appendChild(showcase)
            }
        
            printConsoleLog(`#.# End rendering display #${rotationCounter}`)
        
            rotationCounter++
        
            if (!sage) return
        
            container.appendChild(fragment)
        }
        
        /**
         * Preload an image by creating an image element in memory and setting the src to the url, to download the img and cache it in memory.
         * @param {string} url - url of image
         */
        async function preloadImage(url) {
            const imgUrl = url.asImageUrl()
        
            printConsoleLog(`$$$$ Preloading image - (${imgUrl})`)
        
            // Create img in memory
            const imgCache = new Image()
            imgCache.src = imgUrl
        }
        
        /**
         * Read startup images specified in images/local_images/images.json
         */
        function readStartupImages() {
            readFile(imageJson, (err, data) => {
                printConsoleLog(`- Reading startup images json (${imageJson})`)
                if (err) throw err
                else {
                    imageData = JSON.parse(data)
        
                    // Copy to images array
                    imageData.forEach((metadata, index) => {
        
                        const { title, description, url, width, height } = metadata
        
                        printConsoleLog(`=== Awaiting startup image [${index}/${imageData.length - 1}]`)
        
                        const artifact = new Artifact(title, description, url, width, height, "startup")
        
                        startupImages.push(artifact)
                    })
        
                    artifacts = startupImages
                }
            }, "TEXT")
        }
        
        /**
         * Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed 
         * Then use list of external image IDs to add external images and necessary properties to list of images to display
         */
        async function getExternalImagesList() {
            printConsoleLog(`- Calling external images (flickr api list)`)
        
            const apiKey = config.images.properties.apiKey.value
            const albumID = config.images.properties.albumID.value
            const limitNumOfExternalImagesToPull = config.functionality.properties.limitNumOfExternalImagesToPull.value
            const numOfExternalImagesToPull = config.functionality.properties.numOfExternalImagesToPull.value
        
            //  Build url to make api calls to
            const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${apiKey}&photoset_id=${albumID}&format=json&nojsoncallback=1`
            
            const apiResponse = await fetch(apiURL) // Make api call / request
            const responseData = await apiResponse.json() // Parse api call data to JSON
            const responseImages = responseData["photoset"]["photo"] // Store the response data for use
            
            const list = [] // List of external image IDs
        
            // Filter out blacklisted images
            for (let i = 0; i < responseImages.length; i++) {
                if (limitNumOfExternalImagesToPull && i >= numOfExternalImagesToPull) break // Stop adding images that exceed the limit (if a limit is in place)
        
                const id = responseImages[i]["id"] // Create a reference to the ID of the image being checked
        
                if (blacklist.includes(id)) continue
        
                list.push(id)
            }
        
            // Get metadata for the leftover images
            for (let i = 0; i < list.length; i++) {
                const id = list[i]
        
                printConsoleLog(`@@@ Awaiting external image [${i}/${list.length - 1}]`)
                const artifact = await getExternalImageMetadata(id)
        
                externalImages.push(artifact) // Push to external images array
            }
            
            artifacts = externalImages // Change render loop to use external images
            setImageCounter(0) // Reset counter
        
            printConsoleLog(`- Now using external images - ${JSON.stringify(artifacts, truncateStrings)}`)
        
            if (sage) {
                this.SAGE2Sync()
                this.refresh(date.getTime())
            }
        }
        
        /**
         * Get title and description of an external image.
         * @param {*} id - ID of image on flickr
         * @returns title and description
         */
        async function getDescription(id) {
            const apiKey = config.images.properties.apiKey.value
        
            const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${apiKey}&photo_id=${id}&format=json&nojsoncallback=1` // Build url to make api calls to
        
            const apiResponse = await fetch(apiURL) //  Make api call / request
            const responseData = await apiResponse.json() //  Parse api call data to JSON
        
            const responseImage = responseData["photo"] //  Store the response data for use
        
            const title = responseImage["title"]["_content"],
                description = formatDescription(responseImage["description"]["_content"])
        
            return { title, description }
        }
        
        /**
         * Get width, height, and source/url of an external image.
         * @param {*} id - ID of image on flickr
         * @returns width, height, and source/url
         */
        async function getSource(id) {
            const apiKey = config.images.properties.apiKey.value
            const imageHeightCeiling = config.userInterface.properties.imageHeightCeiling.value
        
            const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&photo_id=${id}&format=json&nojsoncallback=1` //  Build url to make api calls to
            const apiResponse = await fetch(apiURL) // Make api call / request
            const responseData = await apiResponse.json() // Parse api call data to JSON
        
            const sizes = responseData["sizes"]["size"] // Store the response data for use
        
            let { source, width, height } = sizes[0], // Use first size to start with
            difference = Math.abs(imageHeightCeiling - height) // the difference (how close this is) from the desired height (3000px)
        
            // Get best size
            sizes.forEach(size => {
                let newDifference = Math.abs(imageHeightCeiling - size.height)
        
                if (newDifference >= difference) return
        
                difference = newDifference
                source = size.source
                width = size.width
                height = size.height
            })
        
            return { width, height, source }
        }
        
        /**
         * Retrieves the metadata of an external image
         * @param {integer} id - external image id
         * @returns artifact - title, desc, width, height, url
         */
        async function getExternalImageMetadata(id) {
            printConsoleLog(`@@@ [${id}] Calling external image metadata`)
        
            const { title, description } = await getDescription(id)
            const { width, height, source } = await getSource(id)
        
            printConsoleLog(`@@@ [${id}] Best image size: ${width}x${height} (${title}) (${source})`)
        
            const artifact = new Artifact(title, description, source, width, height, "external")
        
            printConsoleLog(`@@@ [${id}] Pulled image from external repo - ${JSON.stringify(artifact, truncateStrings)}<br><=>`)
        
            return artifact
        }
        
        /**
            * Format description to style credits paragraphs, remove links, etc.
            * @param {string} description - description, plain unformatted response from the API
            * @returns 
            */
        function formatDescription(description) {
        
            const paragraphs = description.split("\n")
            let newParagraphs = []
        
            // console.log("++++++++++++++++++++   DESCRIPTION PARAGRAPHS ++++++++++++++++++++++++")
            
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
            * Create loading screen.
            */
        function createLoadingScreen() {
            let fragment = new DocumentFragment() // Fragment for appending loading elements to before appending to the DOM container
            
            let loadingContainer = createComponent("div", "display-center", fragment) //  Create containing div for startup animation
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
            printConsoleLog(`# Starting render loop`)
            
            renderDisplay() // Initial render
            
            const imageLifespan = config.functionality.properties.imageLifespan.value
            const fadeDuration = config.functionality.properties.fadeDuration.value
        
            const interval = imageLifespan * 1000 + (fadeDuration * 2 * 1000)
            renderLoopInterval = setInterval(renderDisplay, interval) // Render loop
        }
        
        /**
         * Trunicate strings (used for console logging readability when using json stringify)
         * @param {string} - String to cut down
         * @returns cut down string
         */
        function truncateStrings(key, value) {
            const maxCharacters = 10
            if (typeof value === "string" && value.length > maxCharacters) {
                return value.substring(0, maxCharacters)
            }
            return value
        }
        
        function getImageCounter() {
            if (sage) return sageState.imageCounter
            return imageCounter
        }
        
        function setImageCounter(index) {
            if (sage) sageState.imageCounter = index
            imageCounter = index
        }
        
        class Artifact {
            constructor(title, description, url, width, height, origin) {
                this.title = title
                this.description = description
                this.url = url
                
                const aspectRatio = width / height
        
                const viewerColumns = config.userInterface.properties.viewerColumns.value
                const viewerAspectRatio = config.generated.viewerAspectRatio
        
                this.numOfColumns = Math.ceil((viewerColumns / viewerAspectRatio) * aspectRatio) > 1 ? Math.ceil((viewerColumns / viewerAspectRatio) * aspectRatio) : 3
                this.origin = origin
        
                printConsoleLog(`=== Created ${origin} artifact: ${JSON.stringify(this, truncateStrings)}`)
                if (sage && config.functionality.properties.preloadImageFlag.value) {preloadImage(url)}
            }
        }
        
        if (sage) createLoadingScreen()
        
        readConfig()
        
        setTimeout(readStartupImages, 1000)
        setTimeout(getExternalImagesList, 1000)
    },
    load: function(date) {
        this.refresh(date)
    },
    resize: function(date) {
        this.refresh(date)
    },
    quit: function() { },
})