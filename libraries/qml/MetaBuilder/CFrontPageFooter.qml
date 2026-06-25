import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: footer
    objectName: "footer_frontpage"
    Accessible.role: Accessible.Footer
    Accessible.name: "Page Footer"

    property color surfaceColor: "transparent"
    property color textColor: Theme.textSecondary
    property bool isDark: false

    Layout.fillWidth: true
    Layout.preferredHeight: 52
    color: surfaceColor

    RowLayout {
        anchors.fill: parent; anchors.leftMargin: 40; anchors.rightMargin: 40
        CText { text: "\u00a9 2026 MetaBuilder"; font.pixelSize: 12
        color: footer.textColor }
        Item { Layout.fillWidth: true }
        CText { text: "Qt6 \u00B7 Next.js \u00B7 C++ \u00B7 JSON"
        font.pixelSize: 12; font.family: "monospace"; color: footer.textColor
        opacity: footer.isDark ? 0.4 : 0.5 }
    }
}
