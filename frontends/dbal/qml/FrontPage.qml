import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15

Rectangle {
    id: root
    width: 1024
    height: 768
    color: "#0f172a"

    anchors.centerIn: parent

    ColumnLayout {
        anchors.centerIn: parent
        spacing: 24
        width: parent.width * 0.75

        Text {
            text: "DBAL Observatory"
            font.pixelSize: 52
            font.bold: true
            color: "#f8fafc"
            horizontalAlignment: Text.AlignHCenter
            Layout.alignment: Qt.AlignHCenter
        }

        Text {
            text: "Monitor daemon health across Prisma, adapters, and metrics."
            font.pixelSize: 20
            color: "#94a3b8"
            wrapMode: Text.Wrap
            horizontalAlignment: Text.AlignHCenter
            Layout.alignment: Qt.AlignHCenter
        }

        RowLayout {
            spacing: 16
            Layout.alignment: Qt.AlignHCenter

            Rectangle {
                radius: 12
                color: "#1d4ed8"
                height: 56
                Layout.preferredWidth: 220

                Text {
                    anchors.centerIn: parent
                    text: "View status"
                    font.pixelSize: 18
                    color: "#f8fafc"
                }
            }

            Rectangle {
                radius: 12
                color: "#334155"
                height: 56
                Layout.preferredWidth: 220

                Text {
                    anchors.centerIn: parent
                    text: "Explore docs"
                    font.pixelSize: 18
                    color: "#e2e8f0"
                }
            }
        }
    }

    ColumnLayout {
        anchors {
            bottom: parent.bottom
            left: parent.left
            margins: 32
        }
        spacing: 8

        Text {
            text: "Live telemetry"
            font.pixelSize: 18
            color: "#e0f2fe"
        }

        RowLayout {
            spacing: 16

            Rectangle {
                width: 180
                height: 80
                radius: 12
                border.color: "#475569"
                border.width: 1
                color: "#0b1120"

                Column {
                    anchors.centerIn: parent
                    spacing: 4

                    Text {
                        text: "Latency"
                        color: "#94a3b8"
                        font.pixelSize: 12
                    }

                    Text {
                        text: "32 ms"
                        color: "#38bdf8"
                        font.pixelSize: 20
                        font.bold: true
                    }
                }
            }

            Rectangle {
                width: 180
                height: 80
                radius: 12
                border.color: "#475569"
                border.width: 1
                color: "#0b1120"

                Column {
                    anchors.centerIn: parent
                    spacing: 4

                    Text {
                        text: "Status"
                        color: "#94a3b8"
                        font.pixelSize: 12
                    }

                    Text {
                        text: "Degraded"
                        color: "#facc15"
                        font.pixelSize: 20
                        font.bold: true
                    }
                }
            }
        }
    }
}
