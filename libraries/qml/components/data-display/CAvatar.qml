import QtQuick
import QmlComponents 1.0

/**
 * CAvatar.qml - Material Design 3 circular avatar
 * Displays image or initials in a circular container with tonal surface
 *
 * Usage:
 *   CAvatar { initials: "JD" }                        // Tonal primary with
 // initials
 *   CAvatar { src: "avatar.png" }                     // Image avatar
 *   CAvatar { size: "lg"; initials: "AB" }            // Large avatar
 *   CAvatar { size: "sm"; bgColor: Theme.error }      // Custom color
 */
Rectangle {
    id: root

    property string size: "md"           // sm, md, lg
    property string src: ""              // Image source URL
    property string initials: ""         // Fallback initials (e.g. "JD")
    property color bgColor:
        Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.16)
    property color textColor: Theme.primary

    // MD3 size mapping: sm=32, md=40, lg=56
    readonly property int _size: {
        switch (size) {
            case "sm": return 32
            case "lg": return 56
            default: return 40
        }
    }

    // MD3 font size: scales with avatar size
    readonly property int _fontSize: {
        switch (size) {
            case "sm": return 13
            case "lg": return 22
            default: return 16
        }
    }

    Accessible.role: Accessible.Graphic
    Accessible.name: initials || "Avatar"

    width: _size
    height: _size
    radius: _size / 2
    color: src !== "" ? "transparent" : bgColor
    clip: true

    // Image avatar
    Image {
        id: avatarImage
        anchors.fill: parent
        source: root.src
        fillMode: Image.PreserveAspectCrop
        visible: root.src !== "" && status === Image.Ready
        smooth: true
        asynchronous: true

        // Circular clipping via layer
        layer.enabled: true
        layer.effect: Item {
            Rectangle {
                anchors.fill: parent
                radius: width / 2
            }
        }
    }

    // Placeholder shown while image loads or on error
    Rectangle {
        anchors.fill: parent
        radius: width / 2
        color: root.bgColor
        visible: root.src !== "" && avatarImage.status !== Image.Ready

        Text {
            anchors.centerIn: parent
            text: root.initials.toUpperCase()
            color: root.textColor
            font.pixelSize: root._fontSize
            font.weight: Font.Medium
            font.family: Theme.fontFamily
            visible: root.initials !== ""
        }
    }

    // Initials fallback (no src)
    Text {
        anchors.centerIn: parent
        text: root.initials.toUpperCase()
        color: root.textColor
        font.pixelSize: root._fontSize
        font.weight: Font.Medium
        font.family: Theme.fontFamily
        visible: root.src === "" && root.initials !== ""
    }
}
