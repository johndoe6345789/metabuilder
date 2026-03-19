import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Popup {
    id: popup
    objectName: "languageSelector"
    Accessible.role: Accessible.Dialog
    Accessible.name: "Language selector"

    width: 220
    height: Math.min(400, langList.contentHeight + 60)
    padding: 8

    property string currentLanguage: "en"
    property var themeColors: ({})
    
    signal languageSelected(string langId)
    
    // Internal colors with fallbacks
    readonly property var colors: ({
        background: themeColors.window || themeColors.background || "#0d0d0d",
        paper: themeColors.alternateBase || "#1a1a1a",
        text: themeColors.windowText || themeColors.text || "#ffffff",
        textSecondary: themeColors.textSecondary || "#a0a0a0",
        accent: themeColors.accent || "#10a37f",
        border: themeColors.border || "#333333",
        hover: themeColors.highlight || "#242424"
    })
    
    readonly property var languages: [
        { id: "en", name: "English", flag: "🇺🇸" },
        { id: "es", name: "Español", flag: "🇪🇸" },
        { id: "fr", name: "Français", flag: "🇫🇷" },
        { id: "de", name: "Deutsch", flag: "🇩🇪" },
        { id: "it", name: "Italiano", flag: "🇮🇹" },
        { id: "pt", name: "Português", flag: "🇧🇷" },
        { id: "nl", name: "Nederlands", flag: "🇳🇱" },
        { id: "pl", name: "Polski", flag: "🇵🇱" },
        { id: "sv", name: "Svenska", flag: "🇸🇪" },
        { id: "tr", name: "Türkçe", flag: "🇹🇷" },
        { id: "ru", name: "Русский", flag: "🇷🇺" },
        { id: "uk", name: "Українська", flag: "🇺🇦" },
        { id: "ar", name: "العربية", flag: "🇸🇦" },
        { id: "hi", name: "हिंदी", flag: "🇮🇳" },
        { id: "th", name: "ไทย", flag: "🇹🇭" },
        { id: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
        { id: "zh", name: "中文", flag: "🇨🇳" },
        { id: "ja", name: "日本語", flag: "🇯🇵" },
        { id: "ko", name: "한국어", flag: "🇰🇷" },
    ]
    
    background: Rectangle {
        color: colors.background
        border.color: colors.border
        border.width: 1
        radius: 8
    }
    
    ColumnLayout {
        anchors.fill: parent
        spacing: 4
        
        Label {
            text: "🌐 Language"
            font.bold: true
            font.pixelSize: 12
            color: colors.text
            Layout.bottomMargin: 4
        }
        
        ListView {
            id: langList
            objectName: "languageList"
            Accessible.role: Accessible.List
            Accessible.name: "Available languages"
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            model: popup.languages
            
            delegate: ItemDelegate {
                width: langList.width
                height: 36
                objectName: "lang_" + modelData.id
                Accessible.role: Accessible.ListItem
                Accessible.name: modelData.name
                Accessible.description:
                    modelData.id
                    === popup.currentLanguage
                    ? modelData.name
                        + ", currently selected"
                    : modelData.name
                activeFocusOnTab: true
                Keys.onReturnPressed: {
                    popup.languageSelected(
                        modelData.id)
                    popup.close()
                }

                highlighted:
                    modelData.id
                    === popup.currentLanguage
                
                background: Rectangle {
                    color: parent.highlighted
                        ? colors.accent
                        : (parent.hovered ? colors.hover : "transparent")
                    radius: 4
                }
                
                contentItem: RowLayout {
                    spacing: 8
                    
                    Label {
                        text: modelData.flag
                        font.pixelSize: 16
                    }
                    
                    Label {
                        text: modelData.name
                        color: parent.parent.highlighted ? "#fff" : colors.text
                        Layout.fillWidth: true
                    }
                    
                    Label {
                        text: "✓"
                        visible: modelData.id === popup.currentLanguage
                        color: "#fff"
                    }
                }
                
                onClicked: {
                    popup.languageSelected(modelData.id)
                    popup.close()
                }
            }
            
            ScrollBar.vertical: ScrollBar {
                policy: ScrollBar.AsNeeded
            }
        }
    }
}
