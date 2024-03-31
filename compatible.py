import psutil
from tkinter import messagebox

def comp_memory(mem):
    getmem = round(mem / (1024.0 **3))
    if getmem < 2:
        messagebox.showinfo(
            title='Memory Error',
            message='Incompatible Memory',
        )

mem = psutil.virtual_memory().total
comp_memory(mem)
