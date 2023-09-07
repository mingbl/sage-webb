//  -----   Global variables    -----   //

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


//  -----   Methods -----   //


//  Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed
//  Then use list of external image IDs to add external images and necessary properties to list of images to display
getExternalImages(createExternalImageObjects());


/**
 *  Display a startup animation until the external images have been retrieved from the API
 * 
 */
function hideStartup(){

    //  (If the app has finished starting up)
    document.querySelector("#startup").style.display = "none";

}

/**
 *  Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed
 * 
 */
async function getExternalImages(_callback){

    //  Build url to make api calls to
    const apiURL = "https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" + apiKey + "&photoset_id=" + albumID + "&format=json&nojsoncallback=1";

    //  Make api call / request
    const apiResponse = await fetch(apiURL);    
    //  Parse api call data to JSON
    const responseData = await apiResponse.json();

    //  Store the response data for use
    let responseImages = responseData["photoset"]["photo"]; 
    
    //  -----   Function logic  -----   //

    // 
    let imagesChecked = 0;

    //  For all of the external images retrieved
    for (let i = 0; i < responseImages.length; i++) {

        //  Create a reference to the ID of the image being checked
        const externalImageID = responseImages[i]["id"];

        // If the blacklist doesn't contain the image
        if (!blacklist.includes(externalImageID)){

            //  Add the images to the queue of images to display
            whitelist.push(externalImageID);

        };

        imagesChecked += 1;
                
    };
    
    //  Hide loading animation
    hideStartup();

    while(imagesChecked < responseImages.length){};

    //  Then use list of external image IDs to add external images and necessary properties to list of images to display
    _callback;

};

/**
 *  Retrieves the information required to display each image in the whitelist
 * 
 */
async function createExternalImageObjects(){

    console.log("fetching, whitelist length = " + whitelist.length);    

    for (let i = 0; i < whitelist.length; i++) {        

        const currentImageID = whitelist[i];

        //  Build url to make api calls to
        const apiURL = "https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + apiKey + "&photo_id=" + currentImageID + "&format=json&nojsoncallback=1";

        //  Make api call / request
        const apiResponse = await fetch(apiURL);    
        //  Parse api call data to JSON
        const responseData = await apiResponse.json();

        //  Store response data for use
        let responseImage = responseData;

        console.log("responseImage");
        
        //  Get the information required to show the image on screen
        //  (title, description, url, width, height)

        

        //  Add the image to the list of images to display
        //images.push(currentImageID);
        
        
    }

};