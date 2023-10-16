//  -----   Global variables    -----   //

const loadingAnimation = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="#fff" class="bi bi-star-fill rotate" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>'


//  -----   Script functions    -----   //

function createLoading(){
    
    //  Create a container to put the loading animation into
    centerContainer = createComponent("div", "display-center", container)

    //  Add the loading animation to the container
    centerContainer.innerHTML = loadingAnimation

}

/**
 *  Hide the loading screen animation
 * 
 */
function hideLoading(){

    //  (If the app has finished starting up)
    document.querySelector(".display-center").style.display = "none"

}