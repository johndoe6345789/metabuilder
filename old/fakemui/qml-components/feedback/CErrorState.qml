import QtQuick
import QtQuick.Layouts

/**
 * CErrorState.qml - Error state display (mirrors _error-state.scss)
 * Shows error message with optional retry action
 */
Rectangle {
    id: root
    
    property string title: "Something went wrong"
    property string message: ""
    property string icon: "⚠️"
    property bool showRetry: true
    property string retryText: "Try Again"
    
    signal retry()
    
    color: Theme.errorContainer
    radius: StyleVariables.radiusMd
    
    implicitWidth: parent ? parent.width : 400
    implicitHeight: contentCol.implicitHeight + StyleVariables.spacingLg * 2
    
    ColumnLayout {
        id: contentCol
        anchors.centerIn: parent
        width: parent.width - StyleVariables.spacingLg * 2
        spacing: StyleVariables.spacingMd
        
        // Icon
        Text {
            Layout.alignment: Qt.AlignHCenter
            text: root.icon
            font.pixelSize: 48
        }
        
        // Title
        Text {
            Layout.alignment: Qt.AlignHCenter
            Layout.fillWidth: true
            text: root.title
            color: Theme.error
            font.pixelSize: StyleVariables.fontSizeLg
            font.weight: Font.DemiBold
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.Wrap
        }
        
        // Message
        Text {
            Layout.alignment: Qt.AlignHCenter
            Layout.fillWidth: true
            text: root.message
            color: Theme.onErrorContainer
            font.pixelSize: StyleVariables.fontSizeSm
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.Wrap
            visible: root.message !== ""
        }
        
        // Retry button
        CButton {
            Layout.alignment: Qt.AlignHCenter
            text: root.retryText
            variant: "outlined"
            visible: root.showRetry
            onClicked: root.retry()
        }
    }
}
