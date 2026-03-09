import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

import "qmllib/MetaBuilder" as MetaBuilder

Rectangle {
    id: root
    width: 1280
    height: 900
    color: "#03030a"

    property var featureHighlights: [
        { title: "Visual stacks", desc: "Compose landing, admin, and observability panels through drag-and-drop sections." },
        { title: "Observability built in", desc: "Monitor DBAL, Prisma, and daemon health from a single cockpit." },
        { title: "Config-first", desc: "Declarative seeds keep designers and developers aligned." }
    ]

    property var ciRuns: [
        { name: "frontends-nextjs-build", status: "passing" },
        { name: "dbal-unit-tests", status: "passing" },
        { name: "prisma-migrations", status: "running" }
    ]

    property var statusItems: [
        { label: "DBAL stack", value: "healthy" },
        { label: "Prisma migrations", value: "pending" },
        { label: "Daemon progress", value: "building" }
    ]

    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#040b22" }
            GradientStop { position: 0.5; color: "#0b1121" }
            GradientStop { position: 1.0; color: "#03030a" }
        }
    }

    MetaBuilder.NavBar {
        id: navBar
        anchors {
            top: parent.top
            left: parent.left
            right: parent.right
        }
        onActionTriggered: console.log("navbar action:", action)
    }

    ScrollView {
        anchors {
            top: navBar.bottom
            left: parent.left
            right: parent.right
            bottom: parent.bottom
        }
        anchors.margins: 24
        clip: true

        ColumnLayout {
            width: parent.width - 24
            spacing: 28

            MetaBuilder.HeroSection {
                Layout.fillWidth: true
                onPrimaryAction: console.log("Hero primary action")
                onSecondaryAction: console.log("Hero secondary action")
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
                                        width: parent.width
                                        spacing: 16

                                        Repeater {
                                            model: featureHighlights
                                            delegate: MetaBuilder.FeatureCard {
                                                Layout.fillWidth: true
                                                Layout.preferredWidth: (parent.width - 32) / 3
                                                title: modelData.title
                                                description: modelData.desc
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
                                model: ciRuns
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
                                            text: modelData.name
                                            color: "#eef2ff"
                                            font.pixelSize: 16
                                        }
                                        Rectangle {
                                            width: 8
                                            height: 8
                                            radius: 4
                                            color: modelData.status === "passing" ? "#39d98a" : "#facc15"
                                            anchors.right: parent.right
                                        }
                                        Text {
                                            text: modelData.status
                                            color: modelData.status === "passing" ? "#39d98a" : "#facc15"
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
                                model: statusItems
                                delegate: MetaBuilder.StatusCard {
                                    Layout.fillWidth: true
                                    label: modelData.label
                                    value: modelData.value
                                }
                            }
                        }
                    }
                }
            }

            MetaBuilder.ContactForm {
                Layout.fillWidth: true
                onSubmitRequested: console.log("contact form submitted", name, company, email)
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
