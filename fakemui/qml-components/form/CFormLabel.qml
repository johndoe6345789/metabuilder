import QtQuick 2.15
import QtQuick.Controls 2.15

Text {
    id: label
    property alias text: label.text
    property bool required: false
    color: Theme.onSurface
    font.pixelSize: StyleVariables.fontSizeSm
    text: "Label"
}
