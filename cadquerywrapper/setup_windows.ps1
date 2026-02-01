# PowerShell script
Write-Host "🔍 Checking for Chocolatey..."
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

Write-Host "📦 Updating Chocolatey..."
choco upgrade chocolatey -y

Write-Host "📦 Installing build tools..."
choco install python --version=3.11.5 -y
choco install visualstudio2022buildtools --package-parameters '--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended' -y
choco install windows-sdk-10.0 -y
choco install cmake --installargs 'ADD_CMAKE_TO_PATH=System' -y
choco install ninja -y
choco install make -y
choco install git -y
choco install openssl.light -y

Write-Host "✅ Python version: $(python --version)"

Write-Host "🔍 Checking for Poetry..."
if (-not (Get-Command poetry -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Poetry..."
    (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
    $env:Path += ';' + $env:USERPROFILE + '\.poetry\bin'
}

Write-Host "📦 Installing dependencies..."
poetry install

Write-Host "✅ Windows setup complete. Run 'poetry shell' to activate environment."
