import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: root
    width: 1280
    height: 900
    color: "#03030a"

    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#040b22" }
            GradientStop { position: 0.5; color: "#0b1121" }
            GradientStop { position: 1.0; color: "#03030a" }
        }
    }

    ScrollView {
        anchors.fill: parent
        anchors.margins: 24
        clip: true

        ColumnLayout {
            width: parent.width - 24
            spacing: 28

            RowLayout {
                width: parent.width
                spacing: 36
                Layout.alignment: Qt.AlignHCenter

                Text {
                    text: "MetaBuilder"
                    color: "#f8fbff"
                    font.pixelSize: 28
                    font.bold: true
                    Layout.alignment: Qt.AlignVCenter
                }

                Rectangle {
                    width: 1
                    height: 24
                    color: "#1e2b4a"
                }

                RowLayout {
                    spacing: 12
                    Layout.alignment: Qt.AlignVCenter
                    Button { text: "Home"; font.pixelSize: 14 }
                    Button { text: "Docs"; font.pixelSize: 14 }
                    Button { text: "Login"; font.pixelSize: 14 }
                }
            }

            Rectangle {
                width: parent.width
                radius: 16
                color: "#11172d"
                border.color: "#25315b"
                border.width: 1
                padding: 32

                ColumnLayout {
                    spacing: 18

                    Text {
                        text: "Build entire stacks visually, from public sites to secure admin panels."
                        font.pixelSize: 36
                        font.bold: true
                        color: "#ffffff"
                        wrapMode: Text.Wrap
                    }

                    Text {
                        text: "MetaBuilder layers marketing, observability, and runtime tooling into a single declarative canvas."
                        font.pixelSize: 18
                        color: "#b1bfd7"
                        wrapMode: Text.Wrap
                    }

                    RowLayout {
                        spacing: 12

                        Button {
                            text: "Explore levels"
                            font.pixelSize: 15
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

            TabView {
                width: parent.width
                height: 420
                background: Rectangle { color: "transparent" }

                Tab {
                    title: "Home"
                    Rectangle {
                        anchors.fill: parent
                        color: "transparent"
                        ColumnLayout {
                            anchors.fill: parent
                            spacing: 24

                            Rectangle {
                                width: parent.width
                                radius: 12
                                color: "#0b1121"
                                border.color: "#1d1f2f"
                                border.width: 1
                                padding: 22

                                ColumnLayout {
                                    spacing: 12
                                    Text {
                                        text: "Why builders choose MetaBuilder"
                                        font.pixelSize: 22
                                        color: "#f6f9ff"
                                    }
                                    RowLayout {
                                        spacing: 16
                                        Repeater {
                                            model: [
                                                { title: "Visual stacks", desc: "Compose landing, admin, and observability panels through drag-and-drop sections." },
                                                { title: "Observability built in", desc: "Monitor DBAL, Prisma, and daemon health in one cockpit." },
                                                { title: "Config-first", desc: "Declarative seeds keep designers and developers aligned." }
                                            ]
                                            delegate: Rectangle {
                                                width: (parent.width - (spacing * 2) - 4) / 3
                                                radius: 10
                                                color: "#11152b"
                                                border.color: "#1f2b45"
                                                border.width: 1
                                                padding: 14

                                                ColumnLayout {
                                                    spacing: 6
                                                    Text {
                                                        text: title
                                                        font.pixelSize: 16
                                                        color: "#f5f8ff"
                                                    }
                                                    Text {
                                                        text: desc
                                                        font.pixelSize: 13
                                                        color: "#aeb8cf"
                                                        wrapMode: Text.Wrap
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            Rectangle {
                                width: parent.width
                                radius: 12
                                color: "#0b1121"
                                border.color: "#1d1f2f"
                                border.width: 1
                                padding: 22

                                ColumnLayout {
                                    spacing: 10
                                    Text {
                                        text: "About MetaBuilder"
                                        font.pixelSize: 22
                                        color: "#ffffff"
                                    }
                                    Text {
                                        text: "MetaBuilder turns seed metadata, dbal automation, and Prisma migrations into cohesive UX experiences without losing low-level control."
                                        font.pixelSize: 16
                                        color: "#aeb8cf"
                                        wrapMode: Text.Wrap
                                    }
                                }
                            }
                        }
                    }
                }

                Tab {
                    title: "GitHub Actions"
                    Rectangle {
                        anchors.fill: parent
                        color: "transparent"
                        ColumnLayout {
                            spacing: 16
                            Repeater {
                                model: [
                                    { name: "frontends-nextjs-build", status: "passing" },
                                    { name: "dbal-unit-tests", status: "passing" },
                                    { name: "prisma-migrations", status: "running" }
                                ]
                                delegate: Rectangle {
                                    width: parent.width
                                    height: 56
                                    radius: 10
                                    color: "#0f1324"
                                    border.color: "#1f2b46"
                                    border.width: 1
                                    anchors.horizontalCenter: parent.horizontalCenter
                                    RowLayout {
                                        anchors.fill: parent
                                        anchors.margins: 12
                                        spacing: 16
                                        Text {
                                            text: name
                                            color: "#eef2ff"
                                            font.pixelSize: 16
                                        }
                                        Rectangle {
                                            width: 8
                                            height: 8
                                            radius: 4
                                            color: status === "passing" ? "#39d98a" : "#facc15"
                                            anchors.right: parent.right
                                        }
                                        Text {
                                            text: status
                                            color: status === "passing" ? "#39d98a" : "#facc15"
                                            font.pixelSize: 15
                                            anchors.rightMargin: 0
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Tab {
                    title: "Status"
                    Rectangle {
                        anchors.fill: parent
                        color: "transparent"
                        ColumnLayout {
                            spacing: 16
                            Repeater {
                                model: [
                                    { label: "DBAL stack", value: "healthy" },
                                    { label: "Prisma migrations", value: "pending" },
                                    { label: "Daemon progress", value: "building" }
                                ]
                                delegate: Rectangle {
                                    width: parent.width
                                    height: 60
                                    radius: 12
                                    color: "#0f1324"
                                    border.color: "#1f2b46"
                                    border.width: 1
                                    padding: 16
                                    RowLayout {
                                        anchors.fill: parent
                                        spacing: 12
                                        Text {
                                            text: label
                                            color: "#d9e1ff"
                                            font.pixelSize: 17
                                        }
                                        Item { Layout.fillWidth: true }
                                        Text {
                                            text: value
                                            font.pixelSize: 16
                                            color: value === "healthy" ? "#39d98a" : "#facc15"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Rectangle {
                width: parent.width
                radius: 14
                color: "#0b1121"
                border.color: "#1d2a42"
                border.width: 1
                padding: 22

                ColumnLayout {
                    spacing: 16
                    Text {
                        text: "Start a project"
                        font.pixelSize: 22
                        color: "#ffffff"
                    }
                    Text {
                        text: "Share your stack vision and MetaBuilder will map it to seeds, workflows, and runtime automation."
                        font.pixelSize: 16
                        color: "#aeb8cf"
                        wrapMode: Text.Wrap
                    }

                    RowLayout {
                        spacing: 10
                        TextField {
                            placeholderText: "Your name"
                            Layout.fillWidth: true
                        }
                        TextField {
                            placeholderText: "Company"
                            Layout.fillWidth: true
                        }
                        TextField {
                            placeholderText: "Email"
                            Layout.fillWidth: true
                        }
                    }

                    Button {
                        text: "Schedule a call"
                        font.pixelSize: 16
                        background: Rectangle {
                            radius: 10
                            color: "#5a7dff"
                        }
                    }
                }
            }

            RowLayout {
                width: parent.width
                spacing: 20
                Text {
                    text: "© MetaBuilder • Public interface preview"
                    color: "#7e899d"
                }
                Text {
                    text: "Built for data-driven builders"
                    color: "#7e899d"
                }
            }
        }
    }
}
