from tkinter import filedialog
from os import path
from tkinter.colorchooser import askcolor

from status import *
from appearance import *
from externalImages import *

# Import image library
from tkinter import *


def close_window(_window):

    print("Closing Window {0}".format(_window.title))

    _window.destroy()


def add_menu_options(_frame, _window):

    # Create a button to save changes 
    saveButton = Button(_frame, text = "Save")   

    # Add the button to the frame passed
    saveButton.pack(side=LEFT, padx = 10, pady = 10)

    # Create a button to close the window 
    exitButton = Button(_frame, text = "Exit", command = lambda window = _window: close_window(window))

    # Add the button to the frame passed
    exitButton.pack(side=LEFT, padx = 10, pady = 10)  


def pick_colour(_colour, _label):

    # Get colour from user
    colour = askcolor(initialcolor = _colour, title = "Select a Colour")
    
    print("Colour selected: {0}".format(colour))

    # Apply hex code of colour to label
    _label.config(text = colour[1], fg = colour[1])


def pick_audio(_label):

    # Get path to music file from user
    audioPath = filedialog.askopenfilename(initialdir = "/", title = "Select an Audio File", filetypes = (("Audio files", "*.mp3*"), ("all files", "*.*")))

    # Format filepath
    audioFile = path.basename(audioPath)[:20]

    # Apply name of audio file to label
    _label.config(text = audioFile)


def checkbutton_action(_property, _input):  

    # Get value of checkbox
    value = _input    

    print("{0} changed to {1}".format(_property, value))  

    # If this check button is for the "Limit number of images to pull" property
    if (_property == "Pull Images in Order?"):

        print("{0} changed to {1}".format(_property, value))
    
    elif (_property == "Limit Number of External Images to Pull?"):

        print("{0} changed to {1}".format(_property, value))

    
    elif (_property == "Show Display Log?"):

        print("{0} changed to {1}".format(_property, value))

    
    elif (_property == "Play Background Music?"):

        print("{0} changed to {1}".format(_property, value))


def open_image_manager():  

    # Create a second window for editing image blacklist
    imageManagerWindow = Toplevel()
    imageManagerWindow.title("Editing Image Blacklist")
    imageManagerWindow.wm_iconphoto(False, open_image(ICONIMAGE))

    # Format size of window
    global IMAGE_MANAGER_WINDOW_SIZE
    imageManagerWindow.geometry("{0}x{1}".format(IMAGE_MANAGER_WINDOW_SIZE[0], IMAGE_MANAGER_WINDOW_SIZE[1]))

    # Create a bottom frame to hold menu options
    menuFrame =  Frame(imageManagerWindow, bd=1)
    menuFrame.pack(side = BOTTOM)

    # Create a frame which will contain the images pulled via API
    imagesFrame = ImageManager(imageManagerWindow)
    imagesFrame.pack(padx = STANDARD_PADDING, pady = STANDARD_PADDING, side=LEFT, fill=BOTH, expand=True)  

    # Get IDs for all the images stored in the desired Flickr Album
    imagesFrame.changeStatus("Getting IDs of images stored in Flickr Album...")
    imagesFrame.update()
    imagesFrame.whitelist = imagesFrame.setWhitelist()

    # Get image and metadata for each Image ID
    imagesFrame.changeStatus("Getting image and metadata for each Image ID...")
    imagesFrame.update()
    imagesFrame.imageObjects = imagesFrame.getExternalImages()

    # Create the first row which images will be addeed to
    imagesFrame.currentRowFrame = createImageRow(imagesFrame)    

    # Show the images in the window
    show_images(imagesFrame, 0)

    # Add a save and exit button to the window
    add_menu_options(menuFrame, imageManagerWindow)


def show_images(_imagesFrame, index):

    if index < len(_imagesFrame.imageObjects):

        next_image = _imagesFrame.imageObjects[index]

        # Update the status
        _imagesFrame.changeStatus("Displaying images... {}/{}".format(index + 1, len(_imagesFrame.imageObjects)))
        _imagesFrame.update()

        showImage(_imagesFrame, next_image)
        _imagesFrame.update()

        index += 1

        # Schedule the next image to be displayed after a short delay
        _imagesFrame.after(10, show_images, _imagesFrame, index)

    else: 

        # Change the status label text
        _imagesFrame.changeStatus('Deselect images and click "Save" below to remove them from showing in the application.')


def showImage(_imagesFrame, _image):

    print ("Showing image {0}".format(_image.imageID))

    # Get the width of the containing frame of the images
    containerWidth = IMAGE_MANAGER_WINDOW_SIZE[0] - STANDARD_PADDING * 2

    # Add the width of the image to the cumulative width (to see if it'll fit in the row)
    imageWidth = _image.getWidth() + STANDARD_PADDING
    _imagesFrame.cumulativeWidth += imageWidth

    print("Image width = {0}. Cumulative width = {1}, container width = {2}".format(imageWidth, _imagesFrame.cumulativeWidth, containerWidth))

    # If the label will go past the end of the row             
    if _imagesFrame.cumulativeWidth > containerWidth:

        # Reset the cumulative width
        _imagesFrame.cumulativeWidth = imageWidth

        # Create a new row
        _imagesFrame.currentRowFrame = createImageRow(_imagesFrame)    

    # Forget the current parent
    _image.pack_forget()

    # Add the current image row as its new parent
    _image.master = _imagesFrame.currentRowFrame

    # Show the new label
    _image.pack(side = LEFT, padx = (0, STANDARD_PADDING)) 

    print("Added image {0} to row number {1}".format(_image.imageID, _imagesFrame.rowNumber))


def createImageRow(_imagesFrame):

    print("Making new row")

    # Create a frame to act as a new row for the images when needed
    rowFrame = Frame(_imagesFrame)
    rowFrame.pack(fill = X)

    _imagesFrame.rowNumber += 1

    # Return the frame to the showimages() function
    return rowFrame