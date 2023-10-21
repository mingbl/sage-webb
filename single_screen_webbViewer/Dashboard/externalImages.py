from tkinter import *

from configuration import *
from appearance import *

from requests import get
from io import BytesIO

from PIL import Image, ImageTk

class ImageManager(Frame):

    """
    Class to contain options which change James Webb SAGE app functionality
    
    """

    def __init__(self, parent):
        
        super().__init__(parent)

        # Show loading label
        self.statusLabel = self.showStatus()        

        # Initialise lists to store images that should / shouldn't be shown in the application
        self.externalImageIDs = []
        self.blacklist = self.setBlacklist()
        self.whitelist = []

        # Initialise a variable which will be replaced with a frame to hold images
        self.imagesFrameContainer = None

        # Initialise variable to reference frame scrollbar - replaced later
        self.imagesFrameScrollbar = None

        # Initialise a variable to represent the cumulative width of images placed in the image manager frame
        self.cumulativeWidth = 0

        # Initialise a variable to represent the current row frame being populated with images
        self.currentRowFrame = None
        self.rowNumber = 0

        # Initialise list to store clickable image objects
        self.imageObjects = []

    def showStatus(self):

        # Create a label to advise the user that the application is loading external images
        statusLabel = Label(self, text = "Initialising Image Manager...", font = MAINFONT)
        statusLabel.pack()  

        self.update()    

        return statusLabel
    
    
    def changeStatus(self, _status):
        
        # Change the text in the Image manager's status label
        self.statusLabel.configure(text = _status)


    def setBlacklist(self):

        return JSONDATA["images"]["properties"]["blacklist"]["value"]

    
    def setWhitelist(self):

        """
        Gets the images stored in a repository on Flickr
        
        """

        # Retrieve required values from config data
        global JSONDATA
        apiKey = JSONDATA["images"]["properties"]["apiKey"]["value"]
        albumID = JSONDATA["images"]["properties"]["albumID"]["value"]

        
        # Build URL to make API calls to
        apiURL = "https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key={0}&photoset_id={1}&format=json&nojsoncallback=1".format(apiKey, albumID)

        # Make API call / request
        apiResponse = get(apiURL)
        apiResponseData = apiResponse.json()

        # Store the response data for use
        responseImages = apiResponseData["photoset"]["photo"]

        # Initialise a list which will be applied to the whitelist of the ImageManager class later
        whitelist = []

        # For all of the external images retrieved
        for image in responseImages:

            # Create a reference to the ID of the image being checked
            externalImageID = image["id"]

            # Add to the list containing all image IDs
            self.externalImageIDs.append(externalImageID)

            # If the blacklist doesn't contain the image
            if (not externalImageID in self.blacklist):

                # Add the images to the queue of images to display
                whitelist.append(externalImageID)

        #  Print the external image IDs fetched to the log
        print("***** WHITELIST FETCHED   *****")

        print(apiURL)
        print("Whitelist length = {0}".format(len(whitelist)))
        print("WHITELIST: {0}".format(whitelist))

        return whitelist    
    

    def on_mousewheel(self, event):
        self.imagesFrameContainer.yview_scroll(-1 * (event.delta // 120), "units")  
             

    def getExternalImages(self):

        # Create scrollbar for images container
        self.imagesFrameScrollbar = Scrollbar(self)
        self.imagesFrameScrollbar.pack(side = RIGHT, fill = Y)

        # Create a scrollable canvas to hold the element which hold contain the images
        self.imagesFrameContainer = Canvas(self, yscrollcommand=self.imagesFrameScrollbar.set, background="red", highlightthickness=4, highlightbackground="#000")
        self.imagesFrameContainer.pack(fill=BOTH, expand=True, padx = STANDARD_PADDING, pady = STANDARD_PADDING)

        # Make the value of the scrolllbar control the view of the canvas
        self.imagesFrameScrollbar.config(command=self.imagesFrameContainer.yview)
        
        # Create a frame to hold the images
        self.imagesFrame = Frame(self.imagesFrameContainer, width = IMAGE_MANAGER_WINDOW_SIZE[0] - STANDARD_PADDING * 2)
        # Add the frame to the canvas
        self.imagesFrameContainer.create_window((0, 0), window = self.imagesFrame, anchor="nw")

        # Create the first row which images will be addeed to
        self.currentRowFrame = self.createImageRow()     

        # initialise a list to add ImageObjects to
        imageObjects = []

        # Get the image data for each of the images stored in the Flickr album
        for image in self.externalImageIDs[:5]:

            print("Adding image {0}".format(image))

            # Create a clickable image object
            imageObject = ImageObject(self.imagesFrame, image)             

            # Add the image object to the list of image objects stored in the image manager
            imageObjects.append(imageObject)

        # Declare the region that the user can scroll over the image frame 
        self.imagesFrameContainer.config(scrollregion=self.imagesFrameContainer.bbox("all"))

        # Make the image frame scrollable by using the mouse wheel
        self.imagesFrameContainer.bind_all("<MouseWheel>", self.on_mousewheel)

        print("All images loaded in Image Manager")  

        return imageObjects 
    
    
    def showImage(self, _image):

        print ("Showing image {0}".format(_image.imageID))

        # Get the width of the containing frame of the images
        containerWidth = IMAGE_MANAGER_WINDOW_SIZE[0] - STANDARD_PADDING * 2

        # Add the width of the image to the cumulative width (to see if it'll fit in the row)
        imageWidth = _image.getWidth() + STANDARD_PADDING
        self.cumulativeWidth += imageWidth

        print("Image width = {0}. Cumulative width = {1}, container width = {2}".format(imageWidth, self.cumulativeWidth, containerWidth))

        # If the label will go past the end of the row             
        if self.cumulativeWidth > containerWidth:

            # Reset the cumulative width
            self.cumulativeWidth = imageWidth

            # Create a new row
            self.currentRowFrame = self.createImageRow()    

        # Forget the current parent
        _image.pack_forget()

        # Add the current image row as its new parent
        _image.master = self.currentRowFrame

        # Show the new label
        _image.pack(side = LEFT, padx = (0, STANDARD_PADDING)) 

        print("Added image {0} to row number {1}".format(_image.imageID, self.rowNumber))

    
    def createImageRow(self):

        print("Making new row")

        # Create a frame to act as a new row for the images when needed
        rowFrame = Frame(self.imagesFrame)
        rowFrame.pack(fill = X)

        self.rowNumber += 1

        # Return the frame to the showimages() function
        return rowFrame
    

    def getBlackList(self):

        for image in self.blacklist:
            print(image)


class ImageObject(Label):

    """
    Clickable image object class
    
    """

    def __init__(self, parent, _id):
    
        super().__init__(parent)

        # Declare ID of image this object will display
        self.imageID = _id

        print ("Creating clickable image object for image ID {0}".format(self.imageID))

        # Get size and URL for image and assign to variables
        self.width, self.height, self.imageURL = self.getImageData(self.imageID)

        # Get the image from the URL
        self.originalImage = self.getImage(self.imageURL)

        # Get the image from the URL
        self.labelImage = ImageTk.PhotoImage(self.originalImage)

        self.configure(image = self.labelImage)

        # Initialise bool to represent if the user has clicked this image or not
        self.blacklisted = False   

        # Bind function to blacklist image to the left mouse click
        #self.bind("<Button-1>", self.toggleBlacklisted)


    def getImageData(self, _id):

        # Retrieve required values from config data
        global JSONDATA
        apiKey = JSONDATA["images"]["properties"]["apiKey"]["value"]

        
        # Build URL to make API calls to
        apiURL = "https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key={0}&photo_id={1}&format=json&nojsoncallback=1".format(apiKey, _id)

        # Make API call / request
        apiResponse = get(apiURL)
        apiResponseData = apiResponse.json()

        print("Getting image data for image {0} from {1}".format(_id, apiURL))

        # Store the response data for use
        imageSizes = apiResponseData["sizes"]["size"]

        # Initialise variables to store the desired URL, width and height
        bestURL = imageSizes[0]["source"]
        bestWidth = imageSizes[0]["width"]
        bestHeight = imageSizes[0]["height"]

        #  Declare variable to represent maximum height of images desired
        imageHeightCeiling = 200

        difference = abs(imageHeightCeiling - bestHeight)

        for imageSize in imageSizes:

            #  See how close the size 
            newDifference = abs(imageHeightCeiling - imageSize["height"])

            if newDifference < difference :

                difference = newDifference
                bestURL = imageSize["source"]
                bestHeight = imageSize["height"]
                bestWidth = imageSize["width"]

        print("ImageID: {0}, Height grabbed= {1}, Width grabbed= {2}, url = {3}".format(_id, bestHeight, bestWidth, bestURL))

        return bestWidth, bestHeight, bestURL
    
    
    def getImage(self, _url):

        # Get the image from the URL
        imageFile = get(_url)

        # Create a reference to the content of the image
        imageData = imageFile.content

        # Open the image and store the data 
        image = Image.open(BytesIO(imageData))

        # Assign the image data to this object        
        return image

    
    def toggleBlacklisted(self):

        # Toggle the boolean which represents if this image is blacklisted
        self.blacklisted = not self.blacklisted
    
    
    def getWidth(self):

        return self.width