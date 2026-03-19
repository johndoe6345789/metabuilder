import QtQuick
import QtQuick.Controls
import QmlComponents 1.0

Text {
    id: label
    property alias text: label.text
    property bool required: false
    color: Theme.onSurface
    font.pixelSize: StyleVariables.fontSizeSm
    text: "Label"
}
