const apiKey = "01dcb39fbbee4546f965dd0d8d512342";
const photoID = "53151475103";


getExternalImageData();


/**
 *  Retrieves the information required to display each image in the whitelist
 */
async function getExternalImageData() {    

 
    //  -----   -----   Get image title and description -----   -----   //

    //  Build url to make api calls to
    const apiURL = `https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${apiKey}&photo_id=${photoID}&format=json&nojsoncallback=1`

    //  Make api call / request
    const apiResponse = await fetch(apiURL)
    //  Parse api call data to JSON
    const responseData = await apiResponse.json()

    //  Store the response data for use
    const responseImage = responseData["photo"];

    //  Create image object to push to list of images to display
    let imageObject = {
        description:""
    };  

    //  -----   -----   Format Image Description    -----   -----   //

    //  Create list to store each paragraph in description
    let descParagraphs = responseImage["description"]["_content"].split("\n");

    //  Initialise a list to store formatted description paragraphs
    let formattedDescParagraphs = [];

    console.log("++++++++++++++++++++   DESCRIPTION PARAGRAPHS ++++++++++++++++++++++++");
    
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
        console.log(`Paragraph ${i} : ${formattedDescParagraphs[i]}`);        
                
    }

    //  Use HTML tag to apply styling
    imageDescription = document.createElement("p");
    imageDescription.innerHTML = imageObject.description;

    //  Show description on-screen
    document.querySelector("body").appendChild(imageDescription);

    //  -----   -----   End Format Image Description   -----   -----   //

}

function removeLink(paragraph) {
    //  Split paragraph into sentences
    const sentences = paragraph.split(/[\. \? \! ]\s/);
    //  Declare variable to store new sentence
    let newSentences = [];

    //  For each sentence in the paragraph
    sentences.forEach((sentence) => {
        if (sentence.includes("href")) return
        console.log(`Sentence: ${sentence}`)

        newSentences.push(sentence)
        // newSentences.push(sentence)
    })

    //  Change the paragraph to contain only the sentences we want to keep
    return paragraph = newSentences.join(". ");
}