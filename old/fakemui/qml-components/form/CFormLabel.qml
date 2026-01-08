import QtQuick
import QtQuick.Controls

Text {
    id: label
    property alias text: label.text
    property bool required: false
    color: Theme.onSurface
    font.pixelSize: StyleVariables.fontSizeSm
    text: "Label"
}
