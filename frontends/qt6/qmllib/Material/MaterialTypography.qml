import QtQuick 2.15

import "MaterialPalette.qml" as MaterialPalette

Text {
    id: typ
    property alias content: text
    property string variant: "body1"

    color: MaterialPalette.onSurface
    font.pixelSize: variant === "h1" ? 32 :
        variant === "h2" ? 28 :
        variant === "h3" ? 24 :
        variant === "h4" ? 20 :
        variant === "button" ? 16 :
        14
    font.bold: variant === "h1" || variant === "h2" || variant === "h3"
}
