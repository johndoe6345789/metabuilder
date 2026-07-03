import QtQuick
import QtQuick.Controls

Rectangle {
    id: root
    property string fileName: ""
    property string tabType:  "music"
    property bool   isActive: false
    property bool   pinned:   false

    signal clicked()
    signal closeClicked()
    signal pinToggled()

    readonly property color accent:
        tabType === "stream" ? "#f97316"
      : tabType === "video"  ? "#7c3aed" : "#0ea5e9"
    readonly property string typeIcon:
        tabType === "stream" ? "↑"
      : tabType === "video"  ? "▶" : "♪"
    readonly property string typeLabel:
        tabType === "stream" ? "STREAM"
      : tabType === "video"  ? "VIDEO" : "MUSIC"

    implicitWidth: root.pinned
        ? 40
        : Math.max(200, Math.min(nameLbl.implicitWidth + typePill.width + 46, 300))
    implicitHeight: 34; radius: 6
    color: isActive
        ? Qt.rgba(root.accent.r, root.accent.g, root.accent.b, 0.08)
        : (hover.hovered ? "#1c2128" : "transparent")

    Rectangle {
        anchors { bottom: parent.bottom; left: parent.left; right: parent.right }
        height: root.isActive ? 2 : 1
        color: root.isActive ? root.accent
            : Qt.rgba(root.accent.r, root.accent.g, root.accent.b, 0.25)
        z: 2
    }

    Rectangle {
        visible: root.pinned
        anchors { left: parent.left; leftMargin: 2
                  verticalCenter: parent.verticalCenter }
        width: 3; height: 20; radius: 2; color: root.accent
    }

    HoverHandler { id: hover }

    TapHandler {
        acceptedButtons: Qt.LeftButton
        gesturePolicy: TapHandler.WithinBounds
        onTapped: root.clicked()
    }
    TapHandler {
        id: rightTap
        acceptedButtons: Qt.RightButton
        gesturePolicy: TapHandler.WithinBounds
        onTapped: tap => {
            ctxMenu.x = tap.position.x; ctxMenu.y = tap.position.y
            ctxMenu.open()
        }
    }

    Rectangle {
        id: typePill
        anchors.horizontalCenter: root.pinned ? parent.horizontalCenter : undefined
        anchors.left:  root.pinned ? undefined : parent.left
        anchors.leftMargin: root.pinned ? 0 : 8
        anchors.verticalCenter: parent.verticalCenter
        width: root.pinned ? 24 : (pillRow.implicitWidth + 14)
        height: 22; radius: 11
        color: Qt.rgba(root.accent.r, root.accent.g, root.accent.b, 0.18)
        Row {
            id: pillRow; anchors.centerIn: parent; spacing: 4
            Text { text: root.typeIcon; color: root.accent
                font.pixelSize: root.pinned ? 14 : 11; font.bold: true }
            Text { visible: !root.pinned; text: root.typeLabel
                color: root.accent; font.pixelSize: 9; font.bold: true
                font.letterSpacing: 0.5 }
        }
    }

    Text {
        id: nameLbl; visible: !root.pinned
        anchors.left: typePill.right; anchors.leftMargin: 6
        anchors.right: closeBtn.left; anchors.rightMargin: 4
        anchors.verticalCenter: parent.verticalCenter
        text: root.fileName; color: root.isActive ? "#e6edf3" : "#8b949e"
        font.pixelSize: 12; elide: Text.ElideMiddle; clip: true
    }

    Rectangle {
        id: closeBtn; visible: !root.pinned
        anchors.right: parent.right; anchors.rightMargin: 6
        anchors.verticalCenter: parent.verticalCenter
        width: 18; height: 18; radius: 3
        color: closeHov.hovered ? "#30363d" : "transparent"
        Text { anchors.centerIn: parent; text: "✕"
            color: "#8b949e"; font.pixelSize: 10 }
        HoverHandler { id: closeHov }
        TapHandler { onTapped: root.closeClicked() }
    }

    Popup {
        id: ctxMenu; padding: 6; width: 160
        closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
        background: Rectangle { color: "#1c2128"; radius: 8
            border.color: "#30363d"; border.width: 1 }
        Column {
            width: parent.width; spacing: 2
            Rectangle {
                width: ctxMenu.width - 12; height: 34; radius: 6
                color: pinHov.hovered ? "#2d333b" : "transparent"
                Text { anchors { left: parent.left; leftMargin: 10
                        verticalCenter: parent.verticalCenter }
                    text: root.pinned ? "Unpin Tab" : "Pin Tab"
                    color: "#e6edf3"; font.pixelSize: 13 }
                HoverHandler { id: pinHov }
                TapHandler { onTapped: { ctxMenu.close(); root.pinToggled() } }
            }
            Rectangle { width: parent.width; height: 1; color: "#30363d" }
            Rectangle {
                width: ctxMenu.width - 12; height: 34; radius: 6
                color: clHov.hovered && !root.pinned ? "#2d333b" : "transparent"
                opacity: root.pinned ? 0.4 : 1
                Text { anchors { left: parent.left; leftMargin: 10
                        verticalCenter: parent.verticalCenter }
                    text: "Close Tab"; color: "#e6edf3"; font.pixelSize: 13 }
                HoverHandler { id: clHov }
                TapHandler { enabled: !root.pinned
                    onTapped: { ctxMenu.close(); root.closeClicked() } }
            }
        }
    }
}
