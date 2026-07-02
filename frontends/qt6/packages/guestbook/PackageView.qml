import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

CPaper {
    id: packageCard
    width: 460
    height: 320
    property string title: "Guestbook"
    property string subtitle: "v1.0.0"
    property var dependenciesList: []

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 18
        spacing: 12

        RowLayout {
            spacing: 12
            CAvatar { initials: title.substring(0,2).toUpperCase(); bgColor: Theme.primary }
            ColumnLayout {
                spacing: 4
                CText { variant: "h3"; text: title }
                CText { variant: "body1"; text: subtitle }
            }
            Item { Layout.fillWidth: true }
            CBadge { text: dependenciesList.length ? "Dependency package" : "Standalone"; accent: dependenciesList.length > 0 }
        }

        Text {
            text: "Simple contributions feed for visitors to leave messages."
            font.pixelSize: 14
            color: Theme.text
            wrapMode: Text.WordWrap
        }

        RowLayout {
            spacing: 8
            CChip { text: "Adaptive layout" }
            CChip { text: "Realtime telemetry" }
            CChip { text: "Community moderation" }
        }

        RowLayout {
            spacing: 8
            CButton { text: "Install" }
            CButton { text: "Dependency graph"; variant: "ghost" }
        }
    }
}
