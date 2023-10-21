//  -----   Global variables    -----   //

//  Initialise a list to hold the IDs of blacklisted images
let whitelist = [], images = [], imageCache = []

// Incrementing counter for external images pulled
let numOfExternalImagesPulled = 0

//  Initialise variable to represent the number of images preloaded
let numOfImagesCurrentlyPreloaded = 0

//  Declare variable used to iterate whitelist index when displaying images
let counter = 0


//  -----   Script functions    -----   //

/**
 * Returns the url input, and prepends the file path if it's a local file
 * @returns image url, formatted correctly
 */
String.prototype.asImageUrl = function () {
    if (this.includes("http")) return this
    else return `${imageDirectory}${this}`
}  

/**
 *  Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed
 * 
 */
async function getExternalImagesList(){

    console.log("FETCHING IMAGE WHITELIST")

    //  Retrieve required values from config data
    const apiKey = configImages.apiKey.value
    const albumID = configImages.albumID.value

    //  Build url to make api calls to
    const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${apiKey}&photoset_id=${albumID}&format=json&nojsoncallback=1`

    //  Make api call / request
    const apiResponse = await fetch(apiURL);    
    //  Parse api call data to JSON
    const responseData = await apiResponse.json();

    //  Store the response data for use
    let responseImages = responseData["photoset"]["photo"]; 
    
    //  -----   Function logic  -----   //

    const blacklist = configImages.blacklist.value

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

    //  Print the external image IDs fetched to the log
    console.log("***** WHITELIST FETCHED   *****")

    console.log(apiURL)
    console.log(`Whitelist length = ${whitelist.length}`);
    console.log(`WHITELIST: ${JSON.stringify(whitelist)}`)

    //  Get external image data
    console.log("*****  STARTING TO PULL EXTERNAL IMAGE DATA   *****")

    const externalImagePullRate = configFunctionality.externalImagePullRate.value * 1000
    
    //  Create delay for API calls so not calling all at once
    setInterval(getExternalImageData, externalImagePullRate)

}


/**
 *  Retrieves the information required to display each image in the whitelist
 */
async function getExternalImageData() {          

    // insert check for if all images in the whitelist have been pulled, end here
    if (numOfExternalImagesPulled == whitelist.length) return  

    // Pull image data
    console.log(`----- PULLING EXTERNAL IMAGE: Array no. [${numOfExternalImagesPulled}] ID: ${whitelist[numOfExternalImagesPulled]} of a list of ${whitelist.length} images`)
        
    //  Create image object to push to list of images to display
    let imageObject = {
        title: "",
        description: "",
        url: ""
    };  

    //  Get external image URL
    imageObject.url = await getExternalImageURL(whitelist[numOfExternalImagesPulled]);
    //  Get image title and description
    [imageObject.title, imageObject.description] = await getExternalImageText(whitelist[numOfExternalImagesPulled]);

    // Push to images array
    images.push(imageObject);

    // Increment 'external images pulled' counter
    numOfExternalImagesPulled++

    // The following line should preload the image
    preloadImage(images.length-1)
    
}


/**
 *  Retrieves the information required to display each image in the whitelist
 */
async function getExternalImageText(_imageID) {    

 
    //  -----   -----   Get image title and description -----   -----   //

    //  Retrieve required values from config data
    const apiKey = configImages.apiKey.value

    //  Build url to make api calls to
    const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${apiKey}&photo_id=${_imageID}&format=json&nojsoncallback=1`

    //  Make api call / request
    const apiResponse = await fetch(apiURL)
    //  Parse api call data to JSON
    const responseData = await apiResponse.json()

    //  Store the response data for use
    const responseImage = responseData["photo"];

    //  Store image title
    let title = responseImage.title._content

    //  -----   -----   Format Image Description    -----   -----   //

    //  Create list to store each paragraph in description
    let descParagraphs = responseImage["description"]["_content"].split("\n");

    //  Initialise a list to store formatted description paragraphs
    let formattedDescParagraphs = [];

    //console.log("++++++++++++++++++++   DESCRIPTION PARAGRAPHS ++++++++++++++++++++++++");
    
    //  For each paragraph in the description
    for (let i = 0; i < descParagraphs.length; i++) {

        //  Assign paragaph to a variable
        let paragraph = descParagraphs[i];

        let lowerCaseParagraph = paragraph.toLowerCase()

        // If paragraph empty or includes 'image description', exclude this paragraph
        if (!lowerCaseParagraph || lowerCaseParagraph.includes("image description:")) {continue}

        //  Remove sentences from paragraphs which contain links
        if (paragraph.includes("href")) {
            paragraph = removeLink(paragraph)
            continue
        }

        let paragraphTest = paragraph;

        //  Remove emojis from sentences
        //paragraph = removeEmojis(paragraphTest);

        //  Perform formatting checks
        if (lowerCaseParagraph.includes("credit") || lowerCaseParagraph.includes("illustration:")){

            //  Declare variable to store html tag to prepend paragraph with
            paragraph = `<span class="credits">${paragraph}</span>`;

        }

        //  Perform formatting checks
        if (lowerCaseParagraph.includes("this image:")){

            //  Declare variable to store html tag to prepend paragraph with
            paragraph = `<span class="meta-description">${paragraph}</span>`;

        }
        
        //  Add the paragraph to the list of descriptions to show on-screen
        formattedDescParagraphs.push(paragraph);
        
    }
    
    //  Apply the desired, formatted paragraphs to the description of the image object
    let description = formattedDescParagraphs.join("<br/>");    

    //  For each formatted paragraph in the description
    for (let i = 0; i < formattedDescParagraphs.length; i++) {
        
        //  Log the paragraph
        //console.log(`Paragraph ${i} : ${formattedDescParagraphs[i]}`);        
                
    }

    //  -----   -----   End Format Image Description   -----   -----   //

    console.log(`Pulled data for image ${_imageID}, Title = ${title}, description = ${description}`);

    //  Add imageObject to list of image objects to display
    return[title, description];

}


function removeLink(paragraph) {

    //  Split paragraph into sentences
    const sentences = paragraph.split(/[\. \? \! ]\s/);
    //  Declare variable to store new sentence
    let newSentences = [];

    //  For each sentence in the paragraph
    sentences.forEach((sentence) => {
        if (sentence.includes("href")) return
        //console.log(`Sentence: ${sentence}`)

        newSentences.push(sentence)
        // newSentences.push(sentence)
    })

    //  Change the paragraph to contain only the sentences we want to keep
    return paragraph = newSentences.join(". ");

}


async function getExternalImageURL(_imageID){

    //  -----   -----   Get image urls and return the one closest to the screen size we specify -----   -----   //

    //  Retrieve required values from config data
    const apiKey = configImages.apiKey.value

    //  Build url to make api calls to
    const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&photo_id=${_imageID}&format=json&nojsoncallback=1`

    //  Make api call / request
    const sizeReponse = await fetch(apiURL)
    //  Parse api call data to JSON
    const reponseData = await sizeReponse.json()

    //  Store the response data for use
    const imageSizes = reponseData["sizes"]["size"];

    //  Initialise variable to store the desired URL
    let bestURL = imageSizes[0].source;
    let bestWidth = imageSizes[0].width;
    let bestHeight = imageSizes[0].height

    //  Declare variable to represent maximum height of images desired
    const imageHeightCeiling = configUserInterface.imageHeightCeiling.value

    let difference = Math.abs(imageHeightCeiling - bestHeight);

    imageSizes.forEach(imageSize => {

        //  See how close the size 
        let newDifference = Math.abs(imageHeightCeiling - imageSize.height);

        if (newDifference < difference) {

            difference = newDifference;
            bestURL = imageSize.source;
            bestHeight = imageSize.height;
            bestWidth = imageSize.width;

        }
        
    });

    console.log(`ImageID: ${_imageID}, Height grabbed= ${bestHeight}, url = ${bestURL}`);

    return bestURL

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

    console.log(`IMAGE ${imageIndex} will be preloaded. (${image.url.asImageUrl()})`)

    // Create img in memory
    const imgCache = new Image()
    // const imgCache = document.createElement("img")
    imgCache.src = image.url.asImageUrl()
    imageCache[imageIndex] = imgCache

    imgCache.onload = function () {

        image.width = imgCache.naturalWidth
        image.height = imgCache.naturalHeight
        image.preloaded = true

        console.log(`IMAGE ${imageIndex} has preloaded. Width: ${imgCache.naturalWidth} Height: ${imgCache.naturalHeight}. (${image.url.asImageUrl()})`)

        numOfImagesCurrentlyPreloaded++

        const loadingDelay = configFunctionality.loadingDelay.value * 1000

        // If images are all preloaded, begin render loop
        if (numOfImagesCurrentlyPreloaded === whitelist.length) {
           setTimeout(startRenderLoop, loadingDelay)
        }

    }

}


/**
 * Start render loop.
 */
function startRenderLoop() {

    //  Hide loading animation
    hideLoading()

    console.log(`STARTING FIRST RENDER`)

    // Initial render
    displayImages()

    // Declare time before the image set is replaced (ms)
    const imageLifespan = configFunctionality.imageLifespan.value * 1000

    // Render loop
    setInterval(displayImages, imageLifespan)

}


/**
 *  Display images on screen 
 *  
 */
async function displayImages(){

    //  Start from the beginning of the whitelist after reaching the end
    let imageIndex = counter % images.length;

    //  Clear the display
    clearDisplay();

    //  Declare variables to represent screen attributes
    const columns = configUserInterface.columns.value
    const viewerWidth = configUserInterface.viewerWidth.value
    const viewerHeight = configUserInterface.viewerHeight.value

    //  Declare time transition animation should take to complete
    const fadeDuration = configFunctionality.fadeDuration.value

    //  -----   Create showcase containers  -----   //

    //  Create text part of showcase
    const textPart = createComponent("div", "text-part", container)    
    textPart.style.width = `${100 / columns}%`
    textPart.style.setProperty("animation-duration", `${fadeDuration}s`)

    //  Create image part of showcase
    const imagePart = createComponent("div", "image-part", container)    
    imagePart.style.width = `${100 / columns}%`
    imagePart.style.setProperty("animation-duration", `${fadeDuration}s`)
    
    //  Get the ID of the image to display
    let image = images[imageIndex];

    //  -----   Add the image data to the showcase containers   -----   //

    imagePart.style.backgroundImage = `url(${image.url.asImageUrl()}` 

    //  Add the title to the text part
    const title = createComponent("h1", "title", textPart)
    title.innerHTML = image.title

    //  Add the description to the text part
    const description = createComponent("p", "description", textPart)
    description.innerHTML = image.description
   
    //  Show the data on screen
    container.appendChild(imagePart, textPart);

    //  Increment the counter show the next image is shown the next time this image is called
    counter ++;

}


/**
 *  Clears the images and their descriptions from the display
 * 
 */
function clearDisplay(){

    container.innerHTML = "";

}