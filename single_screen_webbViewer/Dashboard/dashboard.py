# Import tkinter - used to create interfaces
from tkinter import *

# Import custom modules
from configuration import *
from appearance import *
from status import *
from functionality import *
from externalImages import *





class HelpWindow(Frame):

    """
    Class to contain options which change James Webb SAGE app functionality
    
    """

    def __init__(self, parent):
        super().__init__(parent)

        print("***** Creating Help frame *****") 

         # Add header to frame
        headerLabel = Label(self, text = "Admin Dashboard", font = headerFont)
        headerLabel.pack(pady = 10)

         # Add welcome message to frame
        messageLabel = Label(self, text = "Select a category from the menu above.", font = mainFont)
        messageLabel.pack()

        self.pack(padx = 20, pady = 20)


class ConfigWindow(Frame):

    """
    Class to contain options which change James Webb SAGE app functionality
    
    """

    def __init__(self, parent, _category):
        super().__init__(parent)

        print("***** Creating {0} frame *****".format(_category))     

        # Add header to frame
        headerLabel = Label(self, text = "{0} Settings".format(JSONDATA[_category]["label"]), font = headerFont)
        headerLabel.pack(pady = 10)    

        # Initiate variable to access catagory options in following loop
        optionIndex = 0

        # Initiate a dictionary to keep track of checkbox variables where neccessary
        checkBoxValues = {}

        # Add each category option to frame
        for index in JSONDATA[_category]["properties"]: 

            # Declare reference to property as using multiple times
            property = JSONDATA[_category]["properties"][index]

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

                propertyInputElement = Checkbutton(propertyFrame, onvalue = True, offvalue = False, variable = checkBoxValues["string{0}".format(propertyName)], command = lambda property = propertyName, value = checkBoxValues["string{0}".format(propertyName)]: checkbutton_action(property, value))

                # If the value is true, show the checkbox as being selected
                if (propertyValue):

                    propertyInputElement.select()   

            elif (propertyInput["type"] == "colour"):

                colourLabel = Label(propertyFrame, text = property["value"], fg = property["value"], font = mainFont)
                colourLabel.pack(side = LEFT, padx = 5)

                propertyInputElement = Button(propertyFrame, text = "Edit...", command = lambda colour = property["value"], label = colourLabel: pick_colour(colour, label))

            elif (propertyInput["type"] == "entry"):

                propertyInputElement = Entry(propertyFrame)
                propertyInputElement.insert(0, property["value"])     

            elif (propertyInput["type"] == "audio"):

                # Get the name of the music file and format it for display
                audioPath = property["value"]                 
                audioFile = path.basename(property["value"])[:20]

                audioLabel = Label(propertyFrame, text = audioFile, font = mainFont)
                audioLabel.pack(side = LEFT, padx = 5)

                propertyInputElement = Button(propertyFrame, text = "Edit...", command = lambda label = audioLabel: pick_audio(label))   

            elif (propertyInput["type"] == "blacklist"):

                propertyInputElement = Button(propertyFrame, text = "Edit...", command = show_blacklist)     

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
        for category in JSONDATA:           

            # Create a new category frame and append to the list of category frames            
            self.frameList.append(ConfigWindow(mainFrame, category))

            # Add a button to be able to access the category frame in the menu
            menu.add_command(label = JSONDATA[category]["label"], font = menuFont, command = lambda category = categoryIndex: self.changeCategory(category))

            # Increment the category index to be able to continue the loop
            categoryIndex += 1
        
        # Create the menu item for the Help window
        menu.add_command(label = "Help", font = menuFont, command = lambda: self.showHelp())   

        # Create Help frame and add to list of frames
        self.frameList.append(HelpWindow(mainFrame))

        # Create and add a status bar to the frame
        global STATUSBAR
        STATUSBAR = StatusBar(master)

        # Create a bottom frame to hold menu options
        menuFrame =  Frame(master, bd=1)
        menuFrame.pack(side = BOTTOM)

        # Add a save and exit button to the frame
        add_menu_options(menuFrame, master)    

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

        category = CATEGORIES[_categoryIndex]

        self.changeWindow(_categoryIndex)    
        global STATUSBAR    
        STATUSBAR.changeStatus("Configure app {0} options.".format(JSONDATA[category]["label"]))
        

    def showHelp(self):

        self.changeWindow(4)

        global STATUSBAR
        STATUSBAR.changeStatus("Showing the dashboard help screen.")


#   Create instance of the main window
window = WindowContainer(root)

# Run appication
root.mainloop()


"""
Logic for when user closes out of the GUI

"""

print("Dashboard closed")