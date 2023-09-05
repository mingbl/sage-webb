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

        let externalImagesIDs = []
        let blacklist = []

        // queueExternalImages()

        const columns = 20, viewerWidth = 4000, viewerHeight = 440
        
        /**
         * Time in milliseconds before the image set is replaced
         */
        const imageLifespan = 5 * 1000
        
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
        function createShowcase(image, numOfColumns) {
            const textPart = createComponent("div", "text-part", container)
            textPart.style.width = `${100 / columns}%`
            textPart.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)
            
            const title = createComponent("h1", "title", textPart)
            title.innerHTML = image.title
        
            const description = createComponent("p", "description", textPart)
            description.innerHTML = image.description
            
            const imagePart = createComponent("div", "image-part", container)
            imagePart.style.backgroundImage = `url(${imageDirectory + image.url})`
            imagePart.style.width = `${numOfColumns * (100 / columns)}%`
            imagePart.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)
        }
        
        /**
         * Render as many images as can be displayed until adding an image exceeds 20 columns.
         */
        let imageCounter = 0
        function renderDisplay() {
            // If there are no images in the images array, skip rendering this rotation
            if (images.length < 1) return

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
        
                const imageAspectRatio = image.width / image.height
        
                const numOfColumns = Math.ceil((columns / viewerAspectRatio) * imageAspectRatio)
                const numOfRequiredColumns = numOfColumns + 1 // Image + Text

                // Don't render this image this rotation if it can't fit on the screen
                if (columnsUsed + numOfRequiredColumns > columns) return

                columnsUsed += numOfRequiredColumns
                imageCounter++

                createShowcase(image, numOfColumns)
            }

            // if (!localImageDataLoaded || !apiImageDataLoaded) return

        }

        // let localImageDataLoaded = false
        // let apiImageDataLoaded = false

        function readLocalImages() {
            readFile(imageJson, function(err, imageData) {
                this.log(`attempting to read file ${imageJson}`)
                if (err) throw err
                else {
                    images = images.concat(imageData)
                    this.log(`Reading images`)
    
                    images.forEach(image => {
                        this.log(image.title)
                    });
    
                    // localImageDataLoaded = true

                    renderDisplay()
                }
              }, "JSON")
        }

        readLocalImages()

        setInterval(renderDisplay, imageLifespan)

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