import tkinter as tk

root = tk.Tk()
root.title("Label Packing Example")

# Create a frame
frame1 = tk.Frame(root)
frame1.pack(side="left", padx=10, pady=10)

# Create a label with frame1 as its parent
label = tk.Label(frame1, text="Hello, Label!")

# Create another frame
frame2 = tk.Frame(root)
frame2.pack(side="right", padx=10, pady=10)

# Pack the label inside frame2 (not its direct parent)
label.pack()

root.mainloop()
