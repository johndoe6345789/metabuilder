import QtQuick 2.15
import QtQuick.Controls 2.15

import "MaterialPalette.qml" as MaterialPalette

TextField {
    id: field
    property color baseColor: MaterialPalette.palette.surfaceVariant
    property color focusColor: MaterialPalette.palette.focus
    property color caretColor: MaterialPalette.palette.onSurface

    implicitHeight: 48
    font.pixelSize: 15
    background: Rectangle {
        radius: 12
        border.width: 1
        border.color: field.activeFocus ? focusColor : MaterialPalette.palette.outline
        color: baseColor
    }
    color: MaterialPalette.palette.onSurface
    cursorVisible: true
    cursorColor: caretColor
    padding: 14
}
