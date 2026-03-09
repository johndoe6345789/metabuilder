import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: hero
    property string headline: "Build entire stacks visually, from public sites to secure admin panels."
    property string subhead: "MetaBuilder layers marketing, observability, and runtime tooling into a single declarative canvas."
    signal primaryAction()
    signal secondaryAction()

    radius: 16
    color: "#11172d"
    border.color: "#25315b"
    border.width: 1
    padding: 32
    anchors.horizontalCenter: parent ? parent.horizontalCenter : undefined

    ColumnLayout {
        anchors.fill: parent
        spacing: 18

        Text {
            text: hero.headline
            font.pixelSize: 36
            font.bold: true
            color: "#ffffff"
            wrapMode: Text.Wrap
        }

        Text {
            text: hero.subhead
            font.pixelSize: 18
            color: "#b1bfd7"
            wrapMode: Text.Wrap
        }

        RowLayout {
            spacing: 12

            Button {
                text: "Explore levels"
                font.pixelSize: 15
                onClicked: hero.primaryAction()
                background: Rectangle {
                    radius: 12
                    color: "#5a7dff"
                    border.color: "#4b6ef9"
                    border.width: 1
                }
            }

            Button {
                text: "View live demo"
                font.pixelSize: 15
                onClicked: hero.secondaryAction()
                background: Rectangle {
                    radius: 12
                    color: "#11162b"
                    border.color: "#5a7dff"
                    border.width: 1
                }
            }
        }
    }
}
