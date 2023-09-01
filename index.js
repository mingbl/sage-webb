var imageDirectory = "./webbViewer/local_images/"
var container = document.querySelector("div.container")

const images = [
    {
        title: "Heading",
        description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
        url: "https://cdn.discordapp.com/attachments/1134060514994028594/1139348534957707264/53072881464_d0a95851f1_k.jpg",
        // url: `${imageDirectory}1.jpg`,
        width: 2048,
        height: 1193
    },
    {
        title: "Heading2",
        description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
        url: "https://cdn.discordapp.com/attachments/1134060514994028594/1139348535406506137/53104943445_9398264921_k.jpg",
        // url: `${imageDirectory}2.jpg`,
        width: 2015,
        height: 2048
    },
    {
        title: "Heading3",
        description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
        url: "https://cdn.discordapp.com/attachments/1134060514994028594/1139348535838511254/53040527259_e8567a9d02_k.jpg",
        // url: `${imageDirectory}3.jpg`,
        width: 2048,
        height: 1918
    },
    {
        title: "Heading4",
        description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
        url: "https://cdn.discordapp.com/attachments/1134060514994028594/1139348974659186699/53068407159_dde8245cfe_k.jpg",
        // url: `${imageDirectory}4.jpg`,
        width: 2048,
        height: 1152
    },
    {
        title: "Heading5",
        description: "Discovered by Hubble, Earendel is the farthest star ever detected. It existed in the first billion years after the big bang! The James Webb Space Telescope now shows it to be a massive B-type star, more than twice as hot as our Sun and about a million times more luminous. It’s only detectable thanks to its alignment with a galaxy cluster between Earendel and us. The cluster’s gravity bends light, magnifying what is behind it — in the case of a star-sized object like Earendel, by a factor of at least 4000. Based on the colors of the light of Earendel, astronomers think it may have a cooler companion star. Webb is also able to see other details in Earendel’s host galaxy, the Sunrise Arc — the most highly magnified galaxy yet detected in the universe’s first billion years. Those features include both young star-forming regions and older, established star clusters as small as 10 light-years across.",
        url: "https://cdn.discordapp.com/attachments/716936586180165682/1146979943486586972/The_Sixth_Doctor_Regenerates_Time_and_the_Rani_Doctor_Who_-_YouTube_-_0_05.jpeg",
        width: 1402,
        height: 1080
    }
]

const columns = 20, columnWidth = 100 / columns

/**
 * Create an element, add class name, and append to a parent element
 * @param {string} tag - html element <div> <h1> <p> etc.
 * @param {string} className - class name to add to element, for CSS
 * @param {string} parent - parent element, for appending this element to as a child
 * @returns reference to the new component (element) created
 */
function createComponent(tag, className, parent) {
    let newElement = document.createElement(tag)
    newElement.classList.add(className)
    parent.appendChild(newElement)
    return newElement
}

function createShowcase(image, numOfRequiredColumns, datab) {
    
    const div = createComponent("div", "showcase", container)
    div.style.width = `${(numOfRequiredColumns) * columnWidth}%`

    const textPart = createComponent("div", "text-part", div)
    textPart.style.width = `${(100 / numOfRequiredColumns)}%`
    
    const title = createComponent("h1", "title", textPart)
    title.innerHTML = `${image.title}`

    const description = createComponent("p", "description", textPart)
    description.innerHTML = image.description
    
    const imagePart = createComponent("div", "image-part", div)
    imagePart.style.backgroundImage = `url(${image.url})`
    imagePart.style.width = `${(100 / numOfRequiredColumns * (numOfRequiredColumns - 1))}%`
}

function getShowcaseWidth(imageCols) {
    return numOfRequiredColumns + 1
}

function renderDisplay() {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    const viewerAspectRatio = vw / vh

    let columnsUsed = 0
    for (let i = 0; i < images.length; i++) {
        const image = images[i]

        let imageAspectRatio = image.width / image.height

        let numOfColumns = Math.ceil((columns / viewerAspectRatio) * imageAspectRatio)
        let numOfRequiredColumns = numOfColumns + 1 // Image + Text

        if (columnsUsed + numOfRequiredColumns > columns) continue

        columnsUsed += numOfRequiredColumns
        const debugData = {
            vw: vw,
            vh: vh,
            columns: columns,
            viewerAspectRatio: viewerAspectRatio,
            columnsUsed: columnsUsed,
            imageAspectRatio: imageAspectRatio,
            numOfColumns: numOfColumns,
            numOfRequiredColumns: numOfRequiredColumns
        }
        createShowcase(image, numOfRequiredColumns, JSON.stringify(debugData))
        console.log(debugData)
    }
}

renderDisplay()