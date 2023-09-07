@echo off
for %%f in (*.jpg *.jpeg *.png *.gif *.bmp *.tif *.tiff) do (
    identify -format "%%f: %%w x %%h pixels" "%%f"
    echo.
)
pause
