import QtQuick
import QtQuick.Controls

Rectangle {
    id: root
    height: 52; radius: 4

    property string filePath:    ""
    property string fileName:    ""
    property string fileExt:     ""
    property string fileSizeStr: ""
    property bool   isSelected:  false

    signal clicked(string path)
    signal removed()
    signal streamRequested(string path)

    color: isSelected ? "#21262d" : "transparent"

    TapHandler { onTapped: root.clicked(root.filePath) }

    // ext badge
    Rectangle {
        id: badge
        anchors.left: parent.left; anchors.leftMargin: 8
        anchors.verticalCenter: parent.verticalCenter
        width: extL.implicitWidth + 10; height: 20; radius: 3
        color: root.fileExt === "mp4" || root.fileExt === "mkv"
            || root.fileExt === "mov" ? "#7c3aed" : "#0ea5e9"
        Text { id: extL; text: root.fileExt.toUpperCase()
            color: "#e6edf3"; font.pixelSize: 10; anchors.centerIn: parent }
    }

    // stream button  ↑
    Button {
        id: streamBtn
        anchors.right: rmBtn.left; anchors.rightMargin: 2
        anchors.verticalCenter: parent.verticalCenter
        implicitWidth: 24; implicitHeight: 24
        onClicked: root.streamRequested(root.filePath)
        contentItem: Text { text: "↑"; color: "#f97316"
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter; font.pixelSize: 13; font.bold: true }
        background: Rectangle {
            color: parent.hovered ? "#2d1f0e" : "transparent"; radius: 3 }
    }

    // remove button  ✕
    Button {
        id: rmBtn
        anchors.right: parent.right; anchors.rightMargin: 4
        anchors.verticalCenter: parent.verticalCenter
        implicitWidth: 24; implicitHeight: 24
        onClicked: root.removed()
        contentItem: Text { text: "✕"; color: "#8b949e"
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter; font.pixelSize: 11 }
        background: Rectangle {
            color: parent.hovered ? "#30363d" : "transparent"; radius: 3 }
    }

    Text {
        id: nameLbl
        anchors.left: badge.right; anchors.leftMargin: 8
        anchors.right: streamBtn.left; anchors.rightMargin: 4
        anchors.top: parent.top; anchors.topMargin: 10
        text: root.fileName; color: "#e6edf3"
        font.pixelSize: 12; elide: Text.ElideMiddle; clip: true
    }
    Text {
        anchors.left: badge.right; anchors.leftMargin: 8
        anchors.top: nameLbl.bottom; anchors.topMargin: 2
        text: root.fileSizeStr; color: "#8b949e"; font.pixelSize: 11
    }
}
