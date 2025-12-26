import QtQuick 2.15
import QtQuick.Controls 2.15

ApplicationWindow {
    id: root
    visible: true
    width: 1200
    height: 860
    title: "MetaBuilder | Home"
    color: "#03030a"

    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#040b22" }
            GradientStop { position: 0.6; color: "#0f162d" }
            GradientStop { position: 1.0; color: "#050811" }
        }
    }

    Column {
        anchors.fill: parent
        spacing: 12
        ScrollView {
            id: contentScroll
            anchors {
                left: parent.left
                right: parent.right
                top: parent.top
                bottom: parent.bottom
            }

            Column {
                width: parent.width
                spacing: 20
                padding: 32

                // Navigation Bar
                Row {
                    width: parent.width
                    spacing: 18
                    anchors.horizontalCenter: parent.horizontalCenter

                    Text {
                        text: "MetaBuilder"
                        font.pixelSize: 26
                        font.bold: true
                        color: "#f6f7fb"
                    }

                    Rectangle {
                        width: 1
                        height: 24
                        color: "#2f3d60"
                    }

                    Row {
                        spacing: 12
                        anchors.verticalCenter: parent.verticalCenter

                        Button { text: "Home" }
                        Button { text: "Docs" }
                        Button { text: "Login" }
                    }
                }

                // Hero section
                Rectangle {
                    width: parent.width
                    radius: 18
                    gradient: Gradient {
                        GradientStop { position: 0.0; color: "#131a36" }
                        GradientStop { position: 1.0; color: "#1c2550" }
                    }
                    border.color: "#2f3d60"
                    border.width: 1
                    padding: 28

                    Column {
                        anchors.fill: parent
                        spacing: 16

                        Text {
                            text: "Build end-to-end stacks visually with confidence"
                            font.pixelSize: 38
                            font.bold: true
                            color: "#ffffff"
                            wrapMode: Text.Wrap
                        }
                        Text {
                            text: "MetaBuilder layers public marketing, admin consoles, and data-aware experiences atop a declarative code generator."
                            font.pixelSize: 18
                            color: "#c5d2ff"
                            wrapMode: Text.Wrap
                        }

                        Row {
                            spacing: 12
                            Button {
                                text: "Explore Levels"
                                background: Rectangle {
                                    radius: 12
                                    color: "#5a7dff"
                                }
                            }
                            Button {
                                text: "Live Demo"
                                background: Rectangle {
                                    radius: 12
                                    color: "#1b1e32"
                                    border.color: "#5a7dff"
                                    border.width: 1
                                }
                            }
                        }
                    }
                }

                // Tabs
                TabView {
                    width: parent.width
                    height: 480
                    clip: true

                    Tab {
                        title: "Home"
                        Rectangle {
                            anchors.fill: parent
                            color: "transparent"
                            Column {
                                anchors.fill: parent
                                spacing: 24

                                // Features
                                Rectangle {
                                    width: parent.width
                                    radius: 14
                                    color: "#0b1121"
                                    border.color: "#1e2a45"
                                    border.width: 1
                                    padding: 20

                                    Column {
                                        spacing: 16
                                        Text {
                                            text: "Why builders love MetaBuilder"
                                            font.pixelSize: 24
                                            color: "#f8fbff"
                                        }
                                        Row {
                                            spacing: 14
                                            Repeater {
                                                model: [
                                                    { title: "Visual stacks", desc: "Assemble complete apps through drag/drop sections." },
                                                    { title: "Live observability", desc: "Monitor DBAL, Prisma, and daemon health in real time." },
                                                    { title: "Config-first", desc: "Declarative workflows keep teams synchronized." }
                                                ]
                                                delegate: Rectangle {
                                                    width: (parent.width - (spacing * 2)) / 3
                                                    radius: 12
                                                    color: "#11152b"
                                                    border.color: "#2a3551"
                                                    border.width: 1
                                                    padding: 14

                                                    Column {
                                                        spacing: 6
                                                        Text { text: modelData.title; font.pixelSize: 18; color: "#ebf1ff" }
                                                        Text { text: modelData.desc; font.pixelSize: 14; color: "#b8c4e6"; wrapMode: Text.Wrap }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                // About
                                Rectangle {
                                    width: parent.width
                                    radius: 14
                                    color: "#0b1121"
                                    border.color: "#1e2a45"
                                    border.width: 1
                                    padding: 24

                                    Column {
                                        spacing: 12
                                        Text {
                                            text: "About MetaBuilder"
                                            font.pixelSize: 24
                                            color: "#ffffff"
                                        }
                                        Text {
                                            text: "MetaBuilder accelerates public marketing sites, admin dashboards, and monitoring consoles by synthesizing them from structured JSON seeds, dbal stacks, and Prisma schemas."
                                            font.pixelSize: 16
                                            color: "#aeb8d5"
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
                            Column {
                                anchors.fill: parent
                                spacing: 16
                                Text {
                                    text: "CI snapshots"
                                    font.pixelSize: 22
                                    color: "#f5f7ff"
                                }
                                Repeater {
                                    model: [
                                        { name: "frontends-nextjs-build", status: "passing" },
                                        { name: "dbal-unit-tests", status: "passing" },
                                        { name: "prisma-migrations", status: "failing" }
                                    ]
                                    delegate: Rectangle {
                                        width: parent.width
                                        radius: 10
                                        height: 52
                                        color: "#0f1526"
                                        border.color: "#1f2b46"
                                        Row {
                                            anchors.fill: parent
                                            anchors.margins: 12
                                            spacing: 12
                                            Text { text: modelData.name; font.pixelSize: 18; color: "#f5f7ff"; }
                                            Rectangle {
                                                width: 8
                                                height: 8
                                                radius: 4
                                                color: modelData.status === "passing" ? "#39d98a" : "#f16c6c"
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
                            Column {
                                anchors.fill: parent
                                spacing: 16
                                Text {
                                    text: "Runtime observability"
                                    font.pixelSize: 22
                                    color: "#f5f7ff"
                                }
                                Repeater {
                                    model: [
                                        { label: "DBAL stack", value: "healthy" },
                                        { label: "Prisma migrations", value: "pending" },
                                        { label: "Daemon progress", value: "building" }
                                    ]
                                    delegate: Rectangle {
                                        width: parent.width
                                        radius: 10
                                        height: 56
                                        color: "#10162b"
                                        border.color: "#1f2b46"
                                        padding: 14
                                        Row {
                                            anchors.fill: parent
                                            spacing: 12
                                            Text { text: label; font.pixelSize: 17; color: "#dbe3ff" }
                                            Text {
                                                text: value
                                                font.pixelSize: 17
                                                color: value === "healthy" ? "#39d98a" : "#f2c94c"
                                                anchors.right: parent.right
                                                anchors.rightMargin: 16
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Contact section
                Rectangle {
                    width: parent.width
                    radius: 14
                    color: "#0b1121"
                    border.color: "#1e2a45"
                    border.width: 1
                    padding: 24
                    Column {
                        spacing: 12
                        Text {
                            text: "Start a project"
                            font.pixelSize: 24
                            color: "#ffffff"
                        }
                        Text {
                            text: "Share your stack vision and we will help you map it to MetaBuilder seeds and workflows."
                            font.pixelSize: 16
                            color: "#b5bfde"
                            wrapMode: Text.Wrap
                        }

                        Row {
                            spacing: 12
                            TextField {
                                placeholderText: "Your name"
                                width: parent.width / 3
                            }
                            TextField {
                                placeholderText: "Company"
                                width: parent.width / 3
                            }
                            TextField {
                                placeholderText: "Email"
                                width: parent.width / 3
                            }
                        }

                        Button {
                            text: "Schedule a call"
                            anchors.horizontalCenter: parent.horizontalCenter
                            background: Rectangle {
                                radius: 10
                                color: "#5a7dff"
                            }
                        }
                    }
                }

                // Footer
                Row {
                    width: parent.width
                    spacing: 12
                    Text {
                        text: "© MetaBuilder • Public interface preview"
                        color: "#7e8aa7"
                    }
                    Text {
                        text: "Made for data-driven builders"
                        color: "#7e8aa7"
                    }
                }
            }
        }
    }
}
