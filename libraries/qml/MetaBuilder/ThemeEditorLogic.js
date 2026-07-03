.pragma library

// Theme editor color token and reset helpers.

function applyColorChange(root, token, value) {
    switch (token) {
        case "primary": root.customPrimary = value; break
        case "background": root.customBackground = value; break
        case "surface": root.customSurface = value; break
        case "paper": root.customPaper = value; break
        case "text": root.customText = value; break
        case "textSecondary": root.customTextSecondary = value; break
        case "border": root.customBorder = value; break
        case "error": root.customError = value; break
        case "warning": root.customWarning = value; break
        case "success": root.customSuccess = value; break
        case "info": root.customInfo = value; break
    }
}

function resetToDefaults(root, Theme) {
    root.customPrimary = Theme.primary; root.customBackground = Theme.background
    root.customSurface = Theme.surface; root.customPaper = Theme.paper
    root.customText = Theme.text; root.customTextSecondary = Theme.textSecondary
    root.customBorder = Theme.border; root.customError = Theme.error
    root.customWarning = Theme.warning; root.customSuccess = Theme.success
    root.customInfo = Theme.info
    root.fontFamily = "Inter"; root.baseFontSize = 14; root.baseSpacing = 8
    root.radiusSmall = 4; root.radiusMedium = 8; root.radiusLarge = 16
    root.hasUnsavedChanges = false
}

function loadJson(relativePath) {
    var xhr = new XMLHttpRequest()
    try {
        xhr.open("GET", relativePath, false)
        xhr.send()
        if (xhr.status === 200 || xhr.status === 0)
            return JSON.parse(xhr.responseText)
    } catch(e) {}
    return []
}
