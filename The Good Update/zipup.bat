@echo off
setlocal enabledelayedexpansion

REM Step 1: Rename the webbViewer.zip file with a timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do (
    set "datetime=%%I"
)
set "timestamp=!datetime:~0,4!!datetime:~4,2!!datetime:~6,2!!datetime:~8,2!!datetime:~10,2!!datetime:~12,2!"

ren webbViewer.zip "old_versions/webbViewer_!timestamp!.zip"

set "source_folder=webbViewer"
set "zip_filename=%source_folder%.zip"

:: Check if the 'yes' folder exists
if not exist "%source_folder%" (
    echo The 'yes' folder does not exist.
    exit /b 1
)

:: Check if 7-Zip is installed (modify the path if necessary)
set "zip_program=C:\Program Files\7-Zip\7z.exe"
if not exist "%zip_program%" (
    echo 7-Zip is not installed or the path is incorrect.
    exit /b 1
)

:: Create the zip archive
"%zip_program%" a -r -tzip "%zip_filename%" "%source_folder%"

if %errorlevel% neq 0 (
    echo Failed to create the zip archive.
    exit /b 1
) else (
    echo The 'yes' folder has been successfully zipped as "%zip_filename%".
)

endlocal