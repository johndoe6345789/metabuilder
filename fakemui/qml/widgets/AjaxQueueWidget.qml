import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    
    // Properties from controller
    property var ajaxQueue: null
    property bool expanded: false
    property var themeColors: ({})
    
    // Internal colors that map from passed themeColors or use defaults
    readonly property var colors: ({
        background: themeColors.base || themeColors.background || "#1a1a2e",
        surface: themeColors.alternateBase || themeColors.surface || "#252542",
        primary: themeColors.highlight || themeColors.primary || "#4dabf7",
        secondary: themeColors.accent || themeColors.secondary || "#69db7c",
        accent: themeColors.accent || "#ffd43b",
        text: themeColors.text || themeColors.windowText || "#ffffff",
        textMuted: themeColors.textSecondary || themeColors.textMuted || "#888888",
        border: themeColors.mid || themeColors.border || "#3d3d5c",
        success: themeColors.success || "#51cf66",
        warning: themeColors.warning || "#fcc419",
        error: themeColors.error || "#ff6b6b"
    })
    
    // Auto-computed visibility
    visible: ajaxQueue && (ajaxQueue.visible || ajaxQueue.pending > 0)
    
    width: 320
    height: expanded ? Math.min(400, headerHeight + listView.contentHeight + 8) : headerHeight + (ajaxQueue && ajaxQueue.total > 0 ? summaryHeight : 0)
    radius: 8
    color: colors.surface
    border.color: colors.border
    border.width: 1
    
    // Animation
    Behavior on height { NumberAnimation { duration: 200; easing.type: Easing.OutQuad } }
    Behavior on opacity { NumberAnimation { duration: 200 } }
    
    property int headerHeight: 44
    property int summaryHeight: 32
    
    // Drop shadow effect
    layer.enabled: true
    layer.effect: Item {
        Rectangle {
            anchors.fill: parent
            anchors.margins: -4
            radius: root.radius + 4
            color: "#40000000"
            z: -1
        }
    }
    
    ColumnLayout {
        anchors.fill: parent
        spacing: 0
        
        // Header
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: root.headerHeight
            color: colors.primary
            radius: root.radius
            
            // Flatten bottom corners
            Rectangle {
                anchors.bottom: parent.bottom
                anchors.left: parent.left
                anchors.right: parent.right
                height: root.radius
                color: parent.color
            }
            
            RowLayout {
                anchors.fill: parent
                anchors.margins: 8
                spacing: 8
                
                // Spinning icon when pending
                Item {
                    width: 24
                    height: 24
                    
                    Text {
                        anchors.centerIn: parent
                        text: "☁️"
                        font.pixelSize: 16
                        
                        RotationAnimation on rotation {
                            running: ajaxQueue && ajaxQueue.pending > 0
                            from: 0
                            to: 360
                            duration: 2000
                            loops: Animation.Infinite
                        }
                    }
                    
                    // Badge
                    Rectangle {
                        visible: ajaxQueue && ajaxQueue.pending > 0
                        anchors.top: parent.top
                        anchors.right: parent.right
                        anchors.margins: -4
                        width: 16
                        height: 16
                        radius: 8
                        color: colors.warning
                        
                        Text {
                            anchors.centerIn: parent
                            text: ajaxQueue ? Math.min(ajaxQueue.pending, 99) : 0
                            font.pixelSize: 10
                            font.bold: true
                            color: "#000"
                        }
                    }
                }
                
                Text {
                    text: "AJAX Queue"
                    font.pixelSize: 14
                    font.bold: true
                    color: "#fff"
                    Layout.fillWidth: true
                }
                
                // Status chips
                Row {
                    spacing: 4
                    visible: ajaxQueue && ajaxQueue.total > 0
                    
                    // Pending chip
                    Rectangle {
                        visible: ajaxQueue && ajaxQueue.pending > 0
                        width: pendingText.width + 8
                        height: 18
                        radius: 9
                        color: colors.warning
                        
                        Text {
                            id: pendingText
                            anchors.centerIn: parent
                            text: ajaxQueue ? ajaxQueue.pending : 0
                            font.pixelSize: 10
                            font.bold: true
                            color: "#000"
                        }
                    }
                    
                    // Success chip
                    Rectangle {
                        visible: ajaxQueue && ajaxQueue.completed > 0
                        width: completedText.width + 8
                        height: 18
                        radius: 9
                        color: colors.success
                        
                        Text {
                            id: completedText
                            anchors.centerIn: parent
                            text: ajaxQueue ? ajaxQueue.completed : 0
                            font.pixelSize: 10
                            font.bold: true
                            color: "#000"
                        }
                    }
                    
                    // Error chip
                    Rectangle {
                        visible: ajaxQueue && ajaxQueue.failed > 0
                        width: failedText.width + 8
                        height: 18
                        radius: 9
                        color: colors.error
                        
                        Text {
                            id: failedText
                            anchors.centerIn: parent
                            text: ajaxQueue ? ajaxQueue.failed : 0
                            font.pixelSize: 10
                            font.bold: true
                            color: "#fff"
                        }
                    }
                }
                
                // Expand/collapse button
                Rectangle {
                    width: 24
                    height: 24
                    radius: 12
                    color: mouseArea1.containsMouse ? "#40ffffff" : "transparent"
                    
                    Text {
                        anchors.centerIn: parent
                        text: expanded ? "▲" : "▼"
                        font.pixelSize: 10
                        color: "#fff"
                    }
                    
                    MouseArea {
                        id: mouseArea1
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: expanded = !expanded
                    }
                }
                
                // Close button
                Rectangle {
                    width: 24
                    height: 24
                    radius: 12
                    color: mouseArea2.containsMouse ? "#40ffffff" : "transparent"
                    
                    Text {
                        anchors.centerIn: parent
                        text: "✕"
                        font.pixelSize: 12
                        color: "#fff"
                    }
                    
                    MouseArea {
                        id: mouseArea2
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: {
                            if (ajaxQueue && ajaxQueue.pending === 0) {
                                ajaxQueue.clearCompleted()
                                ajaxQueue.hide()
                            }
                        }
                    }
                }
            }
        }
        
        // Progress bar
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: ajaxQueue && ajaxQueue.pending > 0 ? 3 : 0
            color: colors.border
            visible: ajaxQueue && ajaxQueue.pending > 0
            
            Behavior on Layout.preferredHeight { NumberAnimation { duration: 200 } }
            
            Rectangle {
                anchors.left: parent.left
                anchors.top: parent.top
                anchors.bottom: parent.bottom
                width: parent.width * (ajaxQueue ? (ajaxQueue.completed + ajaxQueue.failed) / Math.max(ajaxQueue.total, 1) : 0)
                color: colors.primary
                
                Behavior on width { NumberAnimation { duration: 200 } }
            }
        }
        
        // Expanded list view
        ListView {
            id: listView
            Layout.fillWidth: true
            Layout.fillHeight: true
            visible: expanded
            clip: true
            model: ajaxQueue ? ajaxQueue.model : null
            spacing: 1
            
            delegate: Rectangle {
                width: listView.width
                height: 48
                color: model.status === "error" ? Qt.darker(colors.error, 1.5) : 
                       (delegateMouseArea.containsMouse ? Qt.lighter(colors.surface, 1.2) : colors.surface)
                opacity: model.status === "pending" ? 1.0 : 0.7
                
                MouseArea {
                    id: delegateMouseArea
                    anchors.fill: parent
                    hoverEnabled: true
                }
                
                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 8
                    spacing: 8
                    
                    // Status icon
                    Text {
                        text: model.status === "success" ? "✓" :
                              model.status === "error" ? "✕" : "◌"
                        font.pixelSize: 14
                        color: model.status === "success" ? colors.success :
                               model.status === "error" ? colors.error :
                               colors.textMuted
                        Layout.preferredWidth: 20
                        
                        // Pulse animation for pending
                        SequentialAnimation on opacity {
                            running: model.status === "pending"
                            loops: Animation.Infinite
                            NumberAnimation { to: 0.4; duration: 500 }
                            NumberAnimation { to: 1.0; duration: 500 }
                        }
                    }
                    
                    // Label and details
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 2
                        
                        RowLayout {
                            Layout.fillWidth: true
                            spacing: 4
                            
                            Text {
                                text: model.label
                                font.pixelSize: 12
                                color: colors.text
                                elide: Text.ElideRight
                                Layout.fillWidth: true
                                Layout.maximumWidth: 180
                            }
                            
                            // Progress indicator
                            Rectangle {
                                visible: model.hasProgress
                                width: progressText.width + 8
                                height: 16
                                radius: 8
                                color: colors.border
                                
                                Text {
                                    id: progressText
                                    anchors.centerIn: parent
                                    text: model.progressCurrent + "/" + model.progressTotal
                                    font.pixelSize: 9
                                    color: colors.textMuted
                                }
                            }
                        }
                        
                        RowLayout {
                            spacing: 8
                            
                            Text {
                                text: model.elapsed
                                font.pixelSize: 10
                                color: colors.textMuted
                            }
                            
                            Text {
                                visible: model.error !== ""
                                text: model.error
                                font.pixelSize: 10
                                color: colors.error
                                elide: Text.ElideRight
                                Layout.maximumWidth: 150
                            }
                        }
                    }
                }
                
                // Bottom border
                Rectangle {
                    anchors.bottom: parent.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    height: 1
                    color: colors.border
                }
            }
            
            // Empty state
            Text {
                anchors.centerIn: parent
                visible: listView.count === 0
                text: "No recent requests"
                font.pixelSize: 12
                color: colors.textMuted
            }
        }
        
        // Summary when collapsed
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: root.summaryHeight
            visible: !expanded && ajaxQueue && ajaxQueue.total > 0
            color: "transparent"
            
            Text {
                anchors.left: parent.left
                anchors.leftMargin: 12
                anchors.verticalCenter: parent.verticalCenter
                text: {
                    if (!ajaxQueue || ajaxQueue.total === 0) return ""
                    var label = ajaxQueue.model && ajaxQueue.model.rowCount() > 0 ? 
                                "Processing..." : "Idle"
                    if (ajaxQueue.pending > 1) {
                        label += " (+" + (ajaxQueue.pending - 1) + " more)"
                    }
                    return label
                }
                font.pixelSize: 11
                color: colors.textMuted
                elide: Text.ElideRight
            }
        }
    }
}
