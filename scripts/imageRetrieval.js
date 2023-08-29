//  -----   Global variables    -----   //

//  Initialise variable to reference directory where startup images are stored locally
const IMAGEDIRECTORY = '../images/startup_images/';

//  Initialise variable to which images downloaded via the Flickr API will be assigned
//  (Assigned on window load)
const LOCALIMAGES = [
    {
        title: "Heading",
        description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
        url: IMAGEDIRECTORY + "1.jpg"
        // url: "https://live.staticflickr.com/65535/53104943445_3da1b9392b_o_d.png"
    },
    {
        title: "Heading2",
        description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
        url: IMAGEDIRECTORY + "2.jpg"
        // url: "https://live.staticflickr.com/65535/53068407159_0d8983cdb3_o_d.jpg"
    },
    {
        title: "Heading3",
        description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
        url: IMAGEDIRECTORY + "3.jpg"
        // url: "https://live.staticflickr.com/65535/53072881464_4275f02ec5_o_d.png"
    },
    {
        title: "Heading4",
        description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
        url: IMAGEDIRECTORY + "4.jpg"
        // url: "https://live.staticflickr.com/65535/53040527259_5682c6bcf0_o_d.png"
    },             
]

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