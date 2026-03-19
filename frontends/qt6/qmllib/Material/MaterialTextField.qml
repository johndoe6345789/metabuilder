import QtQuick
import QtQuick.Controls

import "MaterialPalette.qml" as MaterialPalette

TextField {
    id: field
    property color baseColor: MaterialPalette.surfaceVariant
    property color focusColor: MaterialPalette.focus
    property color caretColor: MaterialPalette.onSurface

    implicitHeight: 48
    font.pixelSize: 15
    background: Rectangle {
        radius: 12
        border.width: 1
        border.color: field.activeFocus ? focusColor : MaterialPalette.outline
        color: baseColor
    }
    color: MaterialPalette.onSurface
    cursorVisible: true
    cursorColor: caretColor
    padding: 14
}
