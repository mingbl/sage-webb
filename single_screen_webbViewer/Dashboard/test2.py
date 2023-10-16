import tkinter as tk
from PIL import Image, ImageTk, ImageFilter, ImageEnhance
import requests
from io import BytesIO

class ClickableImage(tk.Label):
    clicked_images = []

    def __init__(self, master, image_url, index, total_images):
        self.image_url = image_url
        self.index = index
        self.total_images = total_images
        self.is_washed_out = False
        self.washed_out_images = []
        self.number = index  # Store the 'i' value in the image
        super().__init__(master)
        self.bind("<Button-1>", self.toggle_washed_out_filter)
        self.load_image()

    def load_image(self):
        response = requests.get(self.image_url)
        image_data = response.content
        img = Image.open(BytesIO(image_data))
        self.img = img
        self.original_img = img  # Store the original image
        self.img_tk = ImageTk.PhotoImage(img)
        super().configure(image=self.img_tk)
        self.grid(row=(self.index - 1) // 4, column=(self.index - 1) % 4)  # Organize images in a 4x5 grid

    def toggle_washed_out_filter(self, event):
        self.is_washed_out = not self.is_washed_out
        if self.is_washed_out:
            washed_out_image = self.img.copy()
            washed_out_image = washed_out_image.filter(ImageFilter.BLUR)
            enhancer = ImageEnhance.Brightness(washed_out_image)
            washed_out_image = enhancer.enhance(0.7)  # Adjust the factor as needed
            self.washed_out_images.append(washed_out_image)
            washed_out_img_tk = ImageTk.PhotoImage(washed_out_image)
            self.img_tk = washed_out_img_tk
            super().configure(image=washed_out_img_tk)
            # Add the clicked image to the list
            if self not in ClickableImage.clicked_images:
                ClickableImage.clicked_images.append(self)
        else:
            if self.washed_out_images:
                self.washed_out_images.pop()
                if self.washed_out_images:
                    washed_out_img_tk = ImageTk.PhotoImage(self.washed_out_images[-1])
                    self.img_tk = washed_out_img_tk
                    super().configure(image=washed_out_img_tk)
                else:
                    self.img_tk = ImageTk.PhotoImage(self.img)
                    super().configure(image=self.img_tk)
                # Remove the unclicked image from the list
                if self in ClickableImage.clicked_images:
                    ClickableImage.clicked_images.remove(self)

    def unclick_image(self):
        self.is_washed_out = False
        self.washed_out_images = []  # Clear the washed out images
        self.img = self.original_img  # Restore the original image
        self.img_tk = ImageTk.PhotoImage(self.img)
        super().configure(image=self.img_tk)
        # Remove the unclicked image from the list
        if self in ClickableImage.clicked_images:
            ClickableImage.clicked_images.remove(self)

def main():
    window = tk.Tk()
    window.title("Image Viewer")

    image_url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2wqbvAodhHRlRcwjS82ul8OoxacKtvleMQyqVkOPuFDo4esIrrDNzQCbN6_kSNDArUUc&usqp=CAU"

    def load_images():
        frame = tk.Frame(window)
        frame.pack()
        image_widgets = []

        for i in range(20):
            image_widget = ClickableImage(frame, image_url, i + 1, 20)
            image_widgets.append(image_widget)

    def print_clicked_images():
        print("Clicked Images (Washed Out) and their 'i' values:")
        for image in ClickableImage.clicked_images:
            if image.is_washed_out:
                print(f"Image {image.number} is clicked")

    def unclick_all_images():
        for image in ClickableImage.clicked_images.copy():
            image.unclick_image()

    load_images()

    # Create a frame for centered buttons
    button_frame = tk.Frame(window)
    button_frame.pack()

    # Create a button to empty the blacklist
    unclick_button = tk.Button(button_frame, text="Empty Blacklist", command=unclick_all_images)
    unclick_button.pack(side=tk.LEFT)

    # Create a button to print clicked images
    print_button = tk.Button(button_frame, text="Print Clicked Images", command=print_clicked_images)
    print_button.pack(side=tk.LEFT)

    window.mainloop()

if __name__ == "__main__":
    main()