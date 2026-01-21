@echo off
where python >NUL 2>NUL
if %ERRORLEVEL%==0 (
    echo Python is already installed.
    exit /B 0
)

echo Python not found. Attempting installation...
where choco >NUL 2>NUL
if %ERRORLEVEL%==0 (
    choco install -y python
) else (
    where winget >NUL 2>NUL
    if %ERRORLEVEL%==0 (
        winget install -e --id Python.Python.3
    ) else (
        echo No supported package manager found. Please install Python manually.
        exit /B 1
    )
)

where python >NUL 2>NUL
if %ERRORLEVEL%==0 (
    echo Python installed successfully.
    exit /B 0
) else (
    echo Python installation failed. Please install manually.
    exit /B 1
)
