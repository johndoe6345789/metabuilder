import QtQuick 2.15

pragma Singleton

QtObject {

    property color primary: "#6750A4"
    property color primaryContainer: "#EADDFF"
    property color secondary: "#625B71"
    property color secondaryContainer: "#E8DEF8"
    property color background: "#121212"
    property color surface: "#1E1B2D"
    property color surfaceVariant: "#302B3E"
    property color onPrimary: "#ffffff"
    property color onSecondary: "#ffffff"
    property color onSurface: "#E6E1FF"
    property color outline: "#494458"

    property color focus: "#BB86FC"
    property color error: "#CF6679"

    property real elevationHigh: 18
    property real elevationMedium: 12
    property real elevationLow: 6
}
