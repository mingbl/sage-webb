//  -----   Global variables    -----   //

//  Initialise variable to hold images which are to be displayed next
let IMAGEQUEUE;

//  Initialise variable to determine if the app should display images stored locally 
//  or use the API to fetch new ones 
let STARTUP = true;


//  -----   Methods -----   //

/**
 *  Queues the next set of images to display
 */
function queueImages(){

    if (STARTUP){
        
        IMAGEQUEUE = LOCALIMAGES;

        for (let i = 0; i < IMAGEQUEUE.length; i++) {
            
            console.log(IMAGEQUEUE[i].title);
            
        }

        console.log(APPCONTAINER);

    } else {

        //  Use the API to fetch new images to display and queue those


    }

    displayImages(IMAGEQUEUE);

}