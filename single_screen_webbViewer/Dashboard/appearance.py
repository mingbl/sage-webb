from tkinter import Tk, font
from PIL import Image, ImageTk

def open_image(_image):

    """
    Function to open images and format them in a way that Tkinter can read them

    """

    fileImage = Image.open(_image)
    photoImage = ImageTk.PhotoImage(fileImage)
    return photoImage

"""
Create GUI for config file 

"""

# Start tkinter and create reference to instance
root = Tk()

# Change title that appears in GUI window
root.title("James Webb Image Viewer Admin Dashboard")

# Open the window at a specific size
root.geometry("720x720")

# Add the app icon to the window
ICONIMAGE = "../images/meta/app-logo.png"
root.wm_iconphoto(False, open_image(ICONIMAGE))

# Specify sizing for the Image Manager window
IMAGE_MANAGER_WINDOW_SIZE = (1080, 720)

# Specify size of padding used throughout app
STANDARD_PADDING = 20

"""
# Configure styles for dashboard

"""
MENUFONT = font.Font(family = "Arial", size = "18")
HEADERFONT = font.Font(family = "Arial", size = "14")
MAINFONT = font.Font(family = "Arial", size = "12")
STATUSFONT = font.Font(family = "Arial", size = "10")