@echo off
SETLOCAL

where python >NUL 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo Python is already installed.
) ELSE (
    echo Python not found. Attempting to install...
    where winget >NUL 2>&1
    IF %ERRORLEVEL% EQU 0 (
        winget install -e --id Python.Python.3
    ) ELSE (
        where choco >NUL 2>&1
        IF %ERRORLEVEL% EQU 0 (
            choco install -y python
        ) ELSE (
            echo Could not find winget or choco for automatic install.
            echo Please download and install Python from https://www.python.org/
            EXIT /B 1
        )
    )
)

python -m pip install -r requirements.txt

ECHO Setup complete.
ENDLOCAL
