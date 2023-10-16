import requests

from tkinter import *
from PIL import Image, ImageTk

# Initialise a list to store the images that shouldn't be shown in the application
# And a list to populate with external images
BLACKLIST = [], WHITELIST = []

