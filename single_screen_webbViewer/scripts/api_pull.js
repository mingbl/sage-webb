//  -----   Initialise variables    -----   //

//  Store API key in a variable
const apiKey = "01dcb39fbbee4546f965dd0d8d512342";
//  Store API secret in a variable
const apiSecret = "0dec3ebc72ea2d36";

//  Store ID of a photoset (album) to retrieve images from
let albumID = "72177720305127361";

//  Initialise a list to hold the IDs of blacklisted images
let blacklist = [], whitelist = [], images = [];

//  Declare interval for image transition
const transitionInterval = 50000;

// Time before the image set is replaced (ms)
const imageLifespan = 20 * 1000

//  Initialise variables to represent CAVE screen attributes
const columns = 1, viewerWidth = 4000, viewerHeight = 440

let container;

let counter = 0;

let imageHeightCeiling = 3072;

//  When the window loads, apply DOM elements to variables initialised above, show loading screen and get external image data
window.onload = function() {intialiseVariables(), createLoading(), getExternalImagesList();};

/**
 *  Initialises global variables intiialised above
 * 
 */
function intialiseVariables(){

    //  Apply DOM elements to variables initialised above
    container = document.querySelector(".container");

}

/**
 *  Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed
 * 
 */
async function getExternalImagesList(){

    //  Build url to make api calls to
    const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${apiKey}&photoset_id=${albumID}&format=json&nojsoncallback=1`

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
            whitelist.push(externalImageID);

        };
                
    };

    console.log(whitelist.length);

    //  Hide loading animation
    hideLoading();

    //  Show the first image
    displayImages();
    
    //  Continue showing images after the first is shown
    setInterval(displayImages, transitionInterval);

}


/**
 *  Display images on screen
 * 
 */
async function displayImages(){

    //  Start from the beginning of the whitelist after reaching the end
    let imageIndex = counter % whitelist.length;

    //  Clear the display
    clearDisplay();

    //  Create text part of showcase
    const textPart = createComponent("div", "text-part", container)    
    textPart.style.width = `${100 / columns}%`
    textPart.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)

    //  Create image part of showcase
    const imagePart = createComponent("div", "image-part", container)    
    imagePart.style.width = `${100 / columns}%`
    imagePart.style.setProperty("animation-duration", `${imageLifespan / 1000}s`)

    
    //  Get the ID of the image to display
    let imageID = whitelist[imageIndex];

    //  -----   Add the image data to the showcase containers   -----   //

    //  API call to get image size
    let imageUrl = await getExternalImageURL(imageID);

    imagePart.style.backgroundImage = `url(${imageUrl.asImageUrl()}`

    //  Get the title, description and url of the image to display
    let imageData = await getExternalImageText(imageID);  

    //  Add the title to the text part
    const title = createComponent("h1", "title", textPart)
    title.innerHTML = imageData.title

    //  Add the description to the text part
    const description = createComponent("p", "description", textPart)
    description.innerHTML = imageData.description
   
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


/**
 *  Retrieves the information required to display each image in the whitelist
 */
async function getExternalImageText(_imageID) {    

 
    //  -----   -----   Get image title and description -----   -----   //

    //  Build url to make api calls to
    const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${apiKey}&photo_id=${_imageID}&format=json&nojsoncallback=1`

    //  Make api call / request
    const apiResponse = await fetch(apiURL)
    //  Parse api call data to JSON
    const responseData = await apiResponse.json()

    //  Store the response data for use
    const responseImage = responseData["photo"];

    //  Create image object to push to list of images to display
    let imageObject = {
        title: responseImage.title._content,
        description:""
    };  

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
    imageObject.description = formattedDescParagraphs.join("<br/>");    

    //  For each formatted paragraph in the description
    for (let i = 0; i < formattedDescParagraphs.length; i++) {
        
        //  Log the paragraph
        //console.log(`Paragraph ${i} : ${formattedDescParagraphs[i]}`);        
                
    }

    //  Use HTML tag to apply styling
    imageDescription = document.createElement("p");
    imageDescription.innerHTML = imageObject.description;

    //  -----   -----   End Format Image Description   -----   -----   //

    //  Add imageObject to list of image objects to display
    return(imageObject);

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


async function getExternalImageURL(_imageID){

    //  -----   -----   Get image urls and return the one closest to the screen size we specify -----   -----   //

    //  Build url to make api calls to
    const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&photo_id=${_imageID}&format=json&nojsoncallback=1`

    //  Make api call / request
    const sizeReponse = await fetch(apiURL)
    //  Parse api call data to JSON
    const reponseData = await sizeReponse.json()

    //  Store the response data for use
    const sizes = reponseData["sizes"]["size"];

    //  Initialise variable to store the desired URL
    let bestURL = sizes[0].source;
    let bestWidth = sizes[0].width;
    let bestHeight = sizes[0].height

    let difference = Math.abs(imageHeightCeiling - bestHeight);

    sizes.forEach(size => {

        //  See how close the size 
        let newDifference = Math.abs(imageHeightCeiling - size.height);

        if (newDifference < difference) {

            difference = newDifference;
            bestURL = size.source;
            bestHeight = size.height;
            bestWidth = size.width;

        }
        
    });

    console.log(`ImageID: ${_imageID}, Height grabbed= ${bestHeight}, url = ${bestURL}`);

    return bestURL

}


/**
 * Returns the url input, and prepends the file path if it's a local file
 * @returns image url, formatted correctly
 */
String.prototype.asImageUrl = function () {
    if (this.includes("http")) return this
    else return `${imageDirectory}${this}`
}  