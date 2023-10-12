# Import JSON
import json
from os import path

# Import tkinter - used to create interfaces
from tkinter import *
from tkinter import font
from tkinter import filedialog
from tkinter.colorchooser import askcolor

# Import image library
from PIL import Image, ImageTk


"""
Get config file

"""

print("***** Retrieving config file ********")

# Open and parse config file
with open ("./config/config.json", "r") as config:
    jsonData = json.load(config)

# Print config file 
print("Config data retrieved:")
for i in jsonData:
    # if (default_values) return
    print(i, jsonData[i])

#   Get list of categories from data
categories = list(jsonData.keys())

print("Configuration categories: {0}".format(categories))


"""
Create GUI for config file 

"""

# Start tkinter and create reference to instance
root = Tk()

# Change title that appears in GUI window
root.title("James Webb Image Viewer Admin Dashboard")

# Open the window at a specific size
root.geometry("720x720")

# Configure styles for dashboard
menuFont = font.Font(family = "Arial", size = "18")
headerFont = font.Font(family = "Arial", size = "14")
mainFont = font.Font(family = "Arial", size = "12")
statusFont = font.Font(family = "Arial", size = "10")

statusBar = None

def openImage(_image):

    """
    Function to open images and format them in a way that Tkinter can read them

    """

    fileImage = Image.open(_image)
    photoImage = ImageTk.PhotoImage(fileImage)
    return photoImage


# Add the app icon to the window
iconImage = "../images/meta/moon-stars-fill.png"
root.wm_iconphoto(False, openImage(iconImage))

def closeWindow(_window):

    print("Closing Window {0}".format(_window.title))

    _window.destroy()


def addMenuOptions(_frame, _window):

    # Create a button to save changes 
    saveButton = Button(_frame, text = "Save")   

    # Add the button to the frame passed
    saveButton.pack(side=LEFT, padx = 10, pady = 10)

    # Create a button to close the window 
    exitButton = Button(_frame, text = "Exit", command = lambda window = _window: closeWindow(window))   

    # Add the button to the frame passed
    exitButton.pack(side=LEFT, padx = 10, pady = 10)  


def checkButtonAction(_property, _input):  

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


def pickColour(_colour, _label):

    # Get colour from user
    colour = askcolor(initialcolor = _colour, title = "Select a Colour") 
    
    print("Colour selected: {0}".format(colour))

    # Apply hex code of colour to label
    _label.config(text = colour[1], fg = colour[1])


def pickAudio(_label):

    # Get path to music file from user
    audioPath = filedialog.askopenfilename(initialdir = "/", title = "Select an Audio File", filetypes = (("Audio files", "*.mp3*"), ("all files", "*.*")))

    # Format filepath
    audioFile = path.basename(audioPath)[:20]

    # Apply name of audio file to label
    _label.config(text = audioFile)

def showBlacklist():
   
    # Change status message when window opens
    statusBar.changeStatus("Editing Image Blacklist.")    
    

    # Create a second window for editing image blacklist
    blacklist = Toplevel()
    blacklist.title("Editing Image Blacklist")
    blacklist.wm_iconphoto(False, openImage(iconImage))
    blacklist.geometry("1080x720")

    # Create a bottom frame to hold menu options
    menuFrame =  Frame(blacklist, bd=1)
    menuFrame.pack(side = BOTTOM)

    # Add a save and exit button to the window
    addMenuOptions(menuFrame, blacklist)    


class HelpWindow(Frame):

    """
    Class to contain options which change James Webb SAGE app functionality
    
    """

    def __init__(self, parent):
        super().__init__(parent)

        print("***** Creating Help frame *****") 

         # Add header to frame
        headerLabel = Label(self, text = "Admin Dashboard", font = headerFont).pack(pady = 10)

         # Add welcome message to frame
        messageLabel = Label(self, text = "Select a category from the menu above.", font = mainFont).pack()

        self.pack(padx = 20, pady = 20)


class ConfigWindow(Frame):

    """
    Class to contain options which change James Webb SAGE app functionality
    
    """

    def __init__(self, parent, _category):
        super().__init__(parent)

        print("***** Creating {0} frame *****".format(_category))     

        # Add header to frame
        headerLabel = Label(self, text = "{0} Settings".format(jsonData[_category]["label"]), font = headerFont)
        headerLabel.pack(pady = 10)    

        # Initiate variable to access catagory options in following loop
        optionIndex = 0

        # Initiate a dictionary to keep track of checkbox variables where neccessary
        checkBoxValues = {}

        # Add each category option to frame
        for index in jsonData[_category]["properties"]: 

            # Declare reference to property as using multiple times
            property = jsonData[_category]["properties"][index]

            propertyName = property["label"]

            # Declare reference to property input type as using multiple times
            propertyInput = property["input"]

            print("Adding property {0}, value = {1}".format(propertyName, property["value"]))

            # Create a frame to containe the label and input for the property
            propertyFrame = Frame(self)
            propertyFrame.pack(pady = 10)
               
            # Create a label for the property
            propertyLabel = Label(propertyFrame, text = propertyName, font = mainFont)
            propertyLabel.pack(side = LEFT)                   

            # Initialise a variable to store the input element for the property
            propertyInputElement = None

            # Create the required input element for the property and apply to the variable initialised above
            if (propertyInput["type"] == "spinbox"):

                value = StringVar()
                value.set(property["value"])

                propertyInputElement = Spinbox(propertyFrame, textvariable = value, from_ = propertyInput["minValue"], to = propertyInput["maxValue"])

            elif (propertyInput["type"] == "checkbox"):  

                # Get the current value of the boolean relating to the checkbox from the config file
                propertyValue = property["value"]

                # Create a variable to check the value of the checkbox and set to the current value of the boolean stored in the config file
                checkBoxValues["string{0}".format(propertyName)] = propertyValue                            

                propertyInputElement = Checkbutton(propertyFrame, onvalue = True, offvalue = False, variable = checkBoxValues["string{0}".format(propertyName)], command = lambda property = propertyName, value = checkBoxValues["string{0}".format(propertyName)]: checkButtonAction(property, value))

                # If the value is true, show the checkbox as being selected
                if (propertyValue):

                    propertyInputElement.select()   

            elif (propertyInput["type"] == "colour"):

                colourLabel = Label(propertyFrame, text = property["value"], fg = property["value"], font = mainFont)
                colourLabel.pack(side = LEFT, padx = 5)

                propertyInputElement = Button(propertyFrame, text = "Edit...", command = lambda colour = property["value"], label = colourLabel: pickColour(colour, label))

            elif (propertyInput["type"] == "entry"):

                propertyInputElement = Entry(propertyFrame)
                propertyInputElement.insert(0, property["value"])     

            elif (propertyInput["type"] == "audio"):

                # Get the name of the music file and format it for display
                audioPath = property["value"]                 
                audioFile = path.basename(property["value"])[:20]

                audioLabel = Label(propertyFrame, text = audioFile, font = mainFont)
                audioLabel.pack(side = LEFT, padx = 5)

                propertyInputElement = Button(propertyFrame, text = "Edit...", command = lambda label = audioLabel: pickAudio(label))   

            elif (propertyInput["type"] == "blacklist"):

                propertyInputElement = Button(propertyFrame, text = "Edit...", command = lambda: showBlacklist())     

            # Add the input label and element to the frame
            propertyInputElement.pack(side = LEFT, padx = 5)

        # Increment the option index to be able to continue the loop
        optionIndex += 1    

        # Display the frame
        self.pack(padx = 20, pady = 20)


class WindowContainer():

    """
    Class to contain all the windows of the app

    """

    def __init__(self, master):
 
        # Create a frame to hold main "menu"
        topFrame = Frame(master)
        # Add the frame to the window
        topFrame.pack(padx = 20, pady = 20)

        # Add menu to the window
        menu = Menu(topFrame)
        master.config(menu = menu)

        # Create a frame which will contain the desired options category
        mainFrame = Frame(master)
        mainFrame.pack(padx = 20, pady = 20)     

        # Declare list which will contain all of the category frames
        self.frameList = []

        print("***** Creating frames for each config category *****")

        # Initiate variable to access catagory data in following loop
        categoryIndex = 0

        # For each configuration category
        for category in jsonData:           

            # Create a new category frame and append to the list of category frames            
            self.frameList.append(ConfigWindow(mainFrame, category))

            # Add a button to be able to access the category frame in the menu
            menu.add_command(label = jsonData[category]["label"], font = menuFont, command = lambda category = categoryIndex: self.changeCategory(category))

            # Increment the category index to be able to continue the loop
            categoryIndex += 1
        
        # Create the menu item for the Help window
        menu.add_command(label = "Help", font = menuFont, command = lambda: self.showHelp())   

        # Create Help frame and add to list of frames
        self.frameList.append(HelpWindow(mainFrame))

        # Create and add a status bar to the frame
        global statusBar
        statusBar = StatusBar(master)

        # Create a bottom frame to hold menu options
        menuFrame =  Frame(master, bd=1)
        menuFrame.pack(side = BOTTOM)

        # Add a save and exit button to the frame
        addMenuOptions(menuFrame, master)    

        # Show the main frame
        self.showHelp()


    def hideFrames(self):

        """
        Function to show frame desired and hide the others
        
        """

        # Hide all frames
        for frame in self.frameList:
                frame.forget()

    
    def changeWindow(self, _window):

        # Hide all frames
        self.hideFrames()        

        # Determine which frame to show
        desiredFrame = self.frameList[_window]

        # Show the frame we want to show
        desiredFrame.tkraise()        
        desiredFrame.pack(padx = 20, pady = 20)  

    
    def changeCategory(self, _categoryIndex):

        category = categories[_categoryIndex]

        self.changeWindow(_categoryIndex)    
        global statusBar    
        statusBar.changeStatus("Configure app {0} options.".format(jsonData[category]["label"]))
        

    def showHelp(self):

        self.changeWindow(4)

        global statusBar
        statusBar.changeStatus("Showing the dashboard help screen.")


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
        print("--> {0}".format(_status))


#   Create instance of the main window
window = WindowContainer(root)

# Run appication
root.mainloop()


"""
Logic for when user closes out of the GUI

"""

print("Dashboard closed")