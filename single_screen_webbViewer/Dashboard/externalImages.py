import requests

from tkinter import *

from configuration import *
from appearance import *

from PIL import Image, ImageTk

class ImageManager(Frame):

    """
    Class to contain options which change James Webb SAGE app functionality
    
    """

    def __init__(self, parent):
        
        super().__init__(parent)

        # Initialise lists to store images that should / shouldn't be shown in the application
        self.allImages = []
        self.blacklist = self.setBlacklist()
        self.whitelist = self.setWhitelist()


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
        apiResponse = requests.get(apiURL)
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
            self.allImages.append(externalImageID)

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


    def showImages(self, _element):

        for image in self.allImages:

            print("Adding image {0}".format(image))

            # Create a label for the image and add to the desired element
            imageLabel = Label(_element, text = image, font = mainFont)
            imageLabel.pack()

        print("All images shown in Image Manager")

    def getWhiteList(self):

        for image in self.whitelist:
            print(image)
