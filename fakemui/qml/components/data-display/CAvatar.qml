import QtQuick

/**
 * CAvatar.qml - Circular avatar (mirrors _avatar.scss)
 * Displays image or initials in circular container
 */
Rectangle {
    id: root
    
    property string size: "md"           // sm, md, lg
    property string src: ""              // Image source URL
    property string initials: ""         // Fallback initials (e.g. "JD")
    property color bgColor: Theme.surfaceVariant
    property color textColor: Theme.onSurfaceVariant
    
    // Size mapping
    readonly property int _size: {
        switch (size) {
            case "sm": return 32
            case "lg": return 64
            default: return 48
        }
    }
    
    width: _size
    height: _size
    radius: _size / 2
    color: src ? "transparent" : bgColor
    clip: true
    
    // Image (if src provided)
    Image {
        anchors.fill: parent
        source: root.src
        fillMode: Image.PreserveAspectCrop
        visible: root.src !== ""
        
        // Smooth circular clipping
        layer.enabled: true
        layer.effect: Item {
            Rectangle {
                anchors.fill: parent
                radius: width / 2
            }
        }
    }
    
    // Initials fallback
    Text {
        anchors.centerIn: parent
        text: root.initials.toUpperCase()
        color: root.textColor
        font.pixelSize: root._size * 0.4
        font.weight: Font.Medium
        visible: root.src === "" && root.initials !== ""
    }
}
