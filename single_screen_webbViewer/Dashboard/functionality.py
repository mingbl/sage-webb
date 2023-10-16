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
    imageManagerWindow.geometry("1080x720")

    # Create a bottom frame to hold menu options
    menuFrame =  Frame(imageManagerWindow, bd=1)
    menuFrame.pack(side = BOTTOM)

    # Create a frame which will contain the images pulled via API
    ImagesFrame = ImageManager(imageManagerWindow)
    ImagesFrame.pack(padx = 20, pady = 20)    

    # Create an element to hold the image thumbnails
    ImagesContainer = Listbox(ImagesFrame)

    # Add image thumbnails to the desired element
    ImagesFrame.showImages(ImagesContainer)

    # Show the image thumbnail container
    ImagesContainer.pack()

    # Add a save and exit button to the window
    add_menu_options(menuFrame, imageManagerWindow)    