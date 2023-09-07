var webbViewer = SAGE2_App.extend({
    init: function(data) {
        this.SAGE2Init("div", data);
        this.element.id = "div" + this.id;

        this.redraw = true
        this.log("Webb Viewer started")

        const imageDirectory = `${this.resrcPath}images/local_images/`
        const imageJson = `${imageDirectory}images.json`

        const container = this.element
        this.element.classList.add("container")
        
        this.resizeEvents = "continuous"

        
        //  -----   -----   Global variables    -----   -----   //

        //  Store API key in a variable
        const apiKey = "01dcb39fbbee4546f965dd0d8d512342";
        //  Store API secret in a variable
        const apiSecret = "0dec3ebc72ea2d36";
        //  Store ID of a photoset (album) to retrieve images from
        let albumID = "72177720305127361";

        //  Initialise list to hold images to display
        let images = [];

        //  Initialise a list to hold the IDs of blacklisted images
        let blacklist = [];

        //  Initialise a list to hole the IDs of whitelisted images
        let whitelist = [];   

        //  Initialise variables to represent CAVE screen attributes
        const columns = 20, viewerWidth = 4000, viewerHeight = 440

        //  -----   -----   End global variables    -----   -----   //


        //  -----   -----   Loading animation    -----   -----   //

        //  Create containing div for startup animation
        let loadingContainer = createComponent("div", "display-center", container);

        let loading = createComponent("div", "auto-size", loadingContainer);  

        //  Create startup animation element
        loading.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="#fff" class="bi bi-star-fill rotate" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>';

        //  -----   -----   End loading animation   -----   -----   //

        /**
         *  Removes element from DOM without deleting from memory
         * 
         */
        function hideElement(_element){

            //  Create new reference to the unwanted element
            //  (This keeps the original reference, so the element is not removed from memory)
            let unwantedElement = _element;

            //  If the element has a parent node (is on screen)
            if (unwantedElement.parentNode) {

                //  Remove the element from its parent element
                unwantedElement.parentNode.removeChild(unwantedElement);

            }

        }

        //  Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed
        //  Then use list of external image IDs to add external images and necessary properties to list of images to display
        getExternalImages(); 
        
        let interval = 5000;

        setInterval(createExternalImageObject, interval);
        
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
            if (!localImageDataLoaded || !apiImageDataLoaded) return

            //  Hide the loading image
            hideElement(loadingContainer);

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
        let apiImageDataLoaded = false

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

        /**
         *  Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed
         * 
         */
        async function getExternalImages(){

            //  Build url to make api calls to
            const apiURL = "https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" + apiKey + "&photoset_id=" + albumID + "&format=json&nojsoncallback=1";

            //  Make api call / request
            const apiResponse = await fetch(apiURL);    
            //  Parse api call data to JSON
            const responseData = await apiResponse.json();

            //  Store the response data for use
            let responseImages = responseData["photoset"]["photo"]; 
            
            //  -----   Function logic  -----   //

            //  For all of the external images retrieved
            for (let i = 0; i < responseImages.length; i++) {

                //  Create a reference to the ID of the image being checked
                const externalImageID = responseImages[i]["id"];

                // If the blacklist doesn't contain the image
                if (!blacklist.includes(externalImageID)){

                    //  Add the images to the queue of images to display
                    whitelist.push(externalImageID);

                };
                        
            };

            this.log("***** WHITELIST FETCHED   *****")

            //  Start showing internal images on CAVE screen
            apiImageDataLoaded = true  

        }

        /**
         *  Retrieves the information required to display each image in the whitelist
         * 
         */
        async function createExternalImageObject(){

            this.log("-----  Whitelist length = " + whitelist.length + "    -----");





        };
        
        arrangeImageSets()
        renderDisplay()
                
        setInterval(renderDisplay, imageLifespan)

    },
    resize: function(date) {
        this.refresh(date)
    },
    quit: function() { },
});