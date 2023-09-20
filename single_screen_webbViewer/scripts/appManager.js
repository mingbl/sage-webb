//  -----   Global variables    -----   //

//  initialise variable to store container div for the app
let container

//  When the window loads, apply DOM elements to variables initialised above, show loading screen and get external image data
window.onload = function() {intialiseApp(), getExternalImagesList()}

/**
 *  Creates the app's container div and shows a loading screen
 * 
 */
function intialiseApp(){

    //  Create reference to document body
    const documentBody = document.body

    //  Create app container and apply to variable initialised above
    container = createComponent("div", "container", documentBody)

    //  Show the loading animation while the app pulls external images
    createLoading()

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