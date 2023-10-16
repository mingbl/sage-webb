import tkinter as tk
from PIL import Image, ImageTk

class ImageManager:
    def __init__(self, root):
        self.root = root

        self.left_canvas = tk.Canvas(root, width=200, height=100, bg="white")
        self.right_canvas = tk.Canvas(root, width=200, height=100, bg="white")

        self.left_canvas.grid(row=1, column=0, padx=10, pady=10)
        self.right_canvas.grid(row=1, column=1, padx=10, pady=10)

        # Add labels above each container
        tk.Label(root, text="Blacklist").grid(row=0, column=0)
        tk.Label(root, text="Whitelist").grid(row=0, column=1)

        self.create_save_button()
        self.add_red_square()

    def create_save_button(self):
        save_button = tk.Button(self.root, text="Save", command=self.save_images)
        save_button.grid(row=2, column=0, columnspan=2, pady=10)

    def save_images(self):
        images_in_left_container = self.left_canvas.find_all()
        images_in_right_container = self.right_canvas.find_all()

        print("Images in the Blacklist container:")
        for image_id in images_in_left_container:
            print(self.left_canvas.gettags(image_id))

        print("Images in the Whitelist container:")
        for image_id in images_in_right_container:
            print(self.right_canvas.gettags(image_id))

    def add_red_square(self):
        red_square = Image.new("RGB", (30, 30), "red")
        self.red_square_image = ImageTk.PhotoImage(red_square)

        self.red_square_label = tk.Label(self.left_canvas, image=self.red_square_image)
        self.red_square_label.photo = self.red_square_image

        self.left_canvas.create_image(45, 50, image=self.red_square_image, tags=("red_square", "left_canvas"))
        self.left_canvas.tag_bind("red_square", "<Button-1>", self.move_red_square)

    def move_red_square(self, event):
        x, y = event.x, event.y
        if event.widget == self.left_canvas:
            self.right_canvas.create_image(45, 50, image=self.red_square_image, tags=("red_square", "right_canvas"))
            self.left_canvas.delete("red_square")
        elif event.widget == self.right_canvas:
            self.left_canvas.create_image(45, 50, image=self.red_square_image, tags=("red_square", "left_canvas"))
            self.right_canvas.delete("red_square")
        event.widget.tag_bind("red_square", "<Button-1>", self.move_red_square)

if __name__ == "__main__":
    root = tk.Tk()
    root.title("Main Window")

    app = ImageManager(root)

    root.mainloop()