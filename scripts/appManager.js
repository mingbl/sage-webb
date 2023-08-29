//  -----   Global variables   -----   //

//  Initialise variable to reference div which will wrap the image viewer
//  (Assigned on window load)
let APPCONTAINER;


//  -----   Methods -----   //

//  When the webpage loads, assign elements to variables and intialise required listeners
window.onload = function() {initialiseElements(), initialiseListeners(), queueImages()};

/**
 *  Gets webpage elements required for app to run
 *  Called on window load
 */
function initialiseElements(){

    //  Get div which will contain James Webb telescope images and their descriptions
    APPCONTAINER = document.querySelector(".app-container");    

}

/**
 *  Intialises listeners for the app
 *  When users click on images, etc.
 */
function initialiseListeners(){

    //  Initialise listener to enable users to blacklist or whitelist images


}