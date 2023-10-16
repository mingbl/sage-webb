//  -----   Global variables    -----   //

//  Create reference to json file which stores app config
const configData = "./dashboard/config/config.json";

//  Initialise variable to store config data and categories
let config, configFunctionality, configUserInterface, configTheme, configImages

//  Initialise variable to store container div for the app
let container

//  When the window loads, get config data from external file
window.onload = function() {getConfig()}


//  -----   Script functions    -----   //

/**
 *  Get config data from external image file
 * 
 */
async function getConfig(){

    //  Read in the data
    const response = await fetch(configData);

    //  Apply data to variable initialised above
    config = await response.json();

    console.log(`***** RETRIEVED CONFIG DATA ***** \n ${JSON.stringify(config)}`);

    //  Create references to functionality categories
    //  (Makes code more readable when referenceing config data in app script)
    configFunctionality = config.functionality.properties
    configUserInterface = config.userInterface.properties
    configTheme = config.theme.properties
    configImages = config.images.properties

    //  Create app container, show loading screen and start pulling external images
    intialiseApp()

}

/**
 *  Creates the app's container div and shows a loading screen
 * 
 */
function intialiseApp(){  

    //  If background music is required
    if (config.theme.properties.playBackgroundMusic.value){

        //  Declare variable to reference mp3 file in config
        const audio = new Audio(config.theme.properties.backgroundMusicSource.value)

        //  Play background music
        playAudio(audio)

    }

    //  Create reference to document body
    const documentBody = document.body

    //  Create app container and apply to variable initialised above
    container = createComponent("div", "container", documentBody)

    //  Show the loading animation while the app pulls external images
    createLoading()

    //  Begin pulling external images
    getExternalImagesList()

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