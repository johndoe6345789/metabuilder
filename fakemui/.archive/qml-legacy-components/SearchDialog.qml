import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../contexts"
import "../fakemui"

/**
 * SearchDialog.qml - Search dialog for tasks
 * Uses Python AppController's search via taskModel filter
 */
Dialog {
    id: root
    
    signal taskSelected(int index)
    
    title: LanguageContext.t("search")
    modal: true
    standardButtons: Dialog.Close
    width: 600
    height: 500
    
    // Search state
    property string query: ""
    property bool loading: false
    
    // Debounce timer
    Timer {
        id: searchTimer
        interval: 300
        onTriggered: performSearch()
    }
    
    function performSearch() {
        // Use Python controller's search filter
        app.setSearchQuery(query)
    }
    
    onOpened: {
        searchInput.forceActiveFocus()
    }
    
    onClosed: {
        query = ""
        // Clear the search filter
        app.setSearchQuery("")
    }
    
    background: Rectangle {
        color: Theme.surface
        radius: 8
        border.color: Theme.border
    }
    
    header: ColumnLayout {
        spacing: 0
        
        // Title bar
        Rectangle {
            Layout.fillWidth: true
            height: 48
            color: Theme.surface
            
            Text {
                anchors.centerIn: parent
                text: root.title
                font.pixelSize: 18
                font.bold: true
                color: Theme.text
            }
        }
        
        // Search input
        TextField {
            id: searchInput
            Layout.fillWidth: true
            Layout.margins: 16
            Layout.bottomMargin: 8
            placeholderText: LanguageContext.t("searchPlaceholder")
            text: query
            onTextChanged: {
                query = text
                searchTimer.restart()
            }
            font.pixelSize: 16
            color: Theme.text
            
            leftPadding: 40
            
            Text {
                anchors.left: parent.left
                anchors.leftMargin: 12
                anchors.verticalCenter: parent.verticalCenter
                text: "🔍"
                font.pixelSize: 18
            }
            
            background: Rectangle {
                color: Theme.background
                border.color: searchInput.activeFocus ? Theme.primary : Theme.border
                border.width: searchInput.activeFocus ? 2 : 1
                radius: 4
                implicitHeight: 44
            }
        }
        
        // Results count
        Text {
            Layout.leftMargin: 16
            Layout.bottomMargin: 8
            text: app.taskModel.rowCount() + " " + LanguageContext.t("results")
            font.pixelSize: 12
            color: Theme.textSecondary
            visible: query.trim() !== ""
        }
    }
    
    contentItem: ScrollView {
        clip: true
        
        ColumnLayout {
            width: parent.width
            spacing: 8
            
            // Empty state
            Text {
                Layout.alignment: Qt.AlignHCenter
                Layout.topMargin: 32
                visible: query.trim() === ""
                text: LanguageContext.t("searchHelp")
                font.pixelSize: 14
                color: Theme.textSecondary
            }
            
            // No results
            Text {
                Layout.alignment: Qt.AlignHCenter
                Layout.topMargin: 32
                visible: query.trim() !== "" && app.taskModel.rowCount() === 0
                text: LanguageContext.t("noResults")
                font.pixelSize: 14
                color: Theme.textSecondary
            }
            
            // Task results from model
            Repeater {
                model: app.taskModel
                
                delegate: Rectangle {
                    Layout.fillWidth: true
                    Layout.leftMargin: 4
                    Layout.rightMargin: 4
                    height: taskColumn.height + 16
                    color: taskMouse.containsMouse ? 
                           Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.08) : 
                           "transparent"
                    radius: 4
                    
                    required property int index
                    required property string taskId
                    required property string title
                    required property string status
                    required property string repo
                    required property string matchInfo
                    
                    MouseArea {
                        id: taskMouse
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: {
                            taskSelected(index)
                            root.close()
                        }
                    }
                    
                    ColumnLayout {
                        id: taskColumn
                        anchors.left: parent.left
                        anchors.right: parent.right
                        anchors.top: parent.top
                        anchors.margins: 8
                        spacing: 4
                        
                        RowLayout {
                            spacing: 8
                            
                            // Status badge
                            Rectangle {
                                width: 8
                                height: 8
                                radius: 4
                                color: status === "completed" ? Theme.success :
                                       status === "running" ? Theme.primary :
                                       status === "error" ? Theme.error : Theme.warning
                            }
                            
                            Text {
                                text: title || "Untitled"
                                font.pixelSize: 14
                                font.bold: true
                                color: Theme.text
                                elide: Text.ElideRight
                                Layout.fillWidth: true
                            }
                        }
                        
                        RowLayout {
                            spacing: 8
                            
                            Text {
                                text: repo
                                font.pixelSize: 12
                                color: Theme.textSecondary
                            }
                            
                            Text {
                                visible: matchInfo !== ""
                                text: "• " + matchInfo
                                font.pixelSize: 11
                                color: Theme.primary
                            }
                        }
                        
                        Text {
                            visible: NerdModeContext.nerdMode
                            text: taskId
                            font.pixelSize: 11
                            font.family: "monospace"
                            color: Theme.textMuted
                            elide: Text.ElideMiddle
                            Layout.maximumWidth: 300
                        }
                    }
                }
            }
        }
    }
}
