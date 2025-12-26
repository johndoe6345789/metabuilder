import QtQuick 2.15
import QtQuick.Layouts 1.15
import "qmllib/Material" as Material

Material.MaterialSurface {
    id: root
    width: 380
    height: 280
    property string title: "Frontpage Experience"
    property string subtitle: "v1.0.0"
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12
        RowLayout {
            spacing: 10
            Material.MaterialAvatar { initials: title.left(2).toUpper(); backgroundColor: Material.MaterialPalette.primary }
            ColumnLayout { spacing: 2
                Material.MaterialTypography { variant: "h3"; text: title }
                Material.MaterialTypography { variant: "body1"; text: subtitle }
            }
        }
        Text { text: "Public landing page that stitches the hero, features, and CTA across all Qt experiences."; font.pixelSize: 14; color: Material.MaterialPalette.onSurface; wrapMode: Text.Wrap }
        RowLayout { spacing: 8
            Material.MaterialButton { text: "Install" }
            Material.MaterialButton { text: "Details"; outlined: true }
        }
    }
}
