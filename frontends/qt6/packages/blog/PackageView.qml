import QtQuick 2.15
import QtQuick.Layouts 1.15
import "qmllib/Material" as Material

Material.MaterialSurface {
    id: packageCard
    width: 460
    height: 320
    property string title: "Blog"
    property string subtitle: "v1.0.0"
    property var dependenciesList: ["profile_page"]

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 18
        spacing: 12

        RowLayout {
            spacing: 12
            Material.MaterialAvatar { initials: title.left(2).toUpper(); backgroundColor: Material.MaterialPalette.primaryContainer }
            ColumnLayout {
                spacing: 4
                Material.MaterialTypography { variant: "h3"; text: title }
                Material.MaterialTypography { variant: "body1"; text: subtitle }
            }
            Item { Layout.fillWidth: true }
            Material.MaterialBadge { text: dependenciesList.length ? "Dependency package" : "Standalone"; accent: dependenciesList.length > 0 }
        }

        Text {
            text: "Storytelling hub with author profiles and read-later tagging."
            font.pixelSize: 14
            color: Material.MaterialPalette.onSurface
            wrapMode: Text.WordWrap
        }

        RowLayout {
            spacing: 8
            Material.MaterialChip { text: "Adaptive layout" }
            Material.MaterialChip { text: "Realtime telemetry" }
            Material.MaterialChip { text: "Community moderation" }
        }

        RowLayout {
            spacing: 8
            Material.MaterialButton { text: "Install" }
            Material.MaterialButton { text: "Dependency graph"; outlined: true }
        }
    }
}
