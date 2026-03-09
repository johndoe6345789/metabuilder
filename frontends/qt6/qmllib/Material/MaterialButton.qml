import QtQuick 2.15
import QtQuick.Controls 2.15
import QtGraphicalEffects 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: root
    property alias text: label.text
    property bool outlined: false
    property bool elevated: true
    property url iconSource: ""
    property color fillColor: outlined ? "transparent" : MaterialPalette.primary
    property color borderColor: outlined ? MaterialPalette.outline : "transparent"
    property color textColor: outlined ? MaterialPalette.primary : MaterialPalette.onPrimary
    property color rippleColor: outlined ? MaterialPalette.primary : MaterialPalette.onPrimary
    property bool disabled: false
    property real cornerRadius: 12
    signal clicked()

    implicitHeight: 48
    radius: cornerRadius
    color: disabled ? MaterialPalette.surfaceVariant : fillColor
    border.color: disabled ? MaterialPalette.surfaceVariant : borderColor
    border.width: outlined ? 1 : 0
    layer.enabled: elevated && !outlined && !disabled
    layer.effect: DropShadow {
        anchors.fill: parent
        horizontalOffset: 0
        verticalOffset: 4
        radius: 16
        samples: 16
        color: "#22000000"
    }

    Rectangle {
        anchors.fill: parent
        color: "transparent"

        Rectangle {
            id: ripple
            anchors.fill: parent
            color: rippleColor
            opacity: 0
        }

        Row {
            anchors.centerIn: parent
            anchors.leftMargin: 12
            anchors.rightMargin: 12
            spacing: iconSource.length > 0 ? 8 : 0

            Image {
                source: iconSource
                visible: iconSource.length > 0
                width: 20
                height: 20
                fillMode: Image.PreserveAspectFit
                opacity: disabled ? 0.5 : 1
            }

            Text {
                id: label
                text: root.text
                font.pixelSize: 15
                font.bold: true
                color: disabled ? MaterialPalette.surface : textColor
            }
        }
    }

    NumberAnimation {
        id: rippleFade
        target: ripple
        property: "opacity"
        from: 0.3
        to: 0
        duration: 360
        easing.type: Easing.OutQuad
    }

    MouseArea {
        anchors.fill: parent
        enabled: !disabled
        hoverEnabled: true
        onClicked: root.clicked()
        onPressed: {
            root.opacity = 0.85
            ripple.opacity = 0.35
            rippleFade.running = false
            rippleFade.start()
        }
        onReleased: root.opacity = 1
    }
}
