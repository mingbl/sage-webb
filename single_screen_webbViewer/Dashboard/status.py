from tkinter import *
from tkinter import font
from dashboard import categories

statusFont = font.Font(family = "Arial", size = "10")

class StatusBar(Frame):

    """
    Class to create status bar and handle changing the app status
    
    """

    def __init__(self, parent):

        super().__init__(parent)

        # Create a bottom frame to contain a status bar
        self.statusFrame = Frame(parent, bd=1, relief = SUNKEN)
        self.statusFrame.pack(side = BOTTOM, fill = BOTH)

        # Create a label to display the current status to the user            
        self.statusLabel = Label(self.statusFrame, text = "Dashboard loaded", font = statusFont)
        self.statusLabel.pack(anchor = E, padx = 10, pady = 10)


    def changeStatus(self, _status):

        """
        Displays a new status to the user at the bottom of the window
        
        """

        self.statusLabel.configure(text = _status)