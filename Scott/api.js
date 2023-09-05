//  Initialise a list to hold the IDs of blacklisted images
let blacklist = []

//  Pull external images, check if they are excluded from the blacklist and add to the dictionary of image objects to be displayed
queueExternalImages();

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
            blacklist.push(externalImageID);

        };
                
    };

}