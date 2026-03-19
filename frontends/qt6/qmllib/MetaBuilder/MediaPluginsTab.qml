import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: pluginsTab
    color: "transparent"

    property var plugins: []

    signal reloadAll()
    signal reloadPlugin(string pluginName)

    ScrollView {
        anchors.fill: parent
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 16

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CText { variant: "h3"; text: "Installed Plugins" }
                CText { variant: "caption"; text: plugins.length + " plugins"; color: Theme.textSecondary }

                Item { Layout.fillWidth: true }

                CButton {
                    text: "Reload All (Dev)"
                    variant: "ghost"
                    size: "sm"
                    onClicked: reloadAll()
                }
            }

            CDivider { Layout.fillWidth: true }

            // Plugin grid (2 columns)
            GridLayout {
                Layout.fillWidth: true
                columns: 2
                columnSpacing: 16
                rowSpacing: 16

                Repeater {
                    model: plugins

                    delegate: CCard {
                        Layout.fillWidth: true
                        variant: "outlined"

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 10

                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 8

                                CText { variant: "subtitle1"; text: modelData.name }

                                Item { Layout.fillWidth: true }

                                CStatusBadge {
                                    status: modelData.status === "active" ? "success" : "warning"
                                    text: modelData.status
                                }
                            }

                            CText {
                                variant: "caption"
                                text: "v" + modelData.version
                                color: Theme.textSecondary
                            }

                            CDivider { Layout.fillWidth: true }

                            CText { variant: "caption"; text: "Capabilities" }

                            Flow {
                                Layout.fillWidth: true
                                spacing: 6

                                Repeater {
                                    model: modelData.capabilities

                                    delegate: CChip {
                                        text: modelData
                                    }
                                }
                            }

                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 8

                                Item { Layout.fillWidth: true }

                                CButton {
                                    text: "Reload"
                                    variant: "ghost"
                                    size: "sm"
                                    onClicked: reloadPlugin(plugins[index].name.toLowerCase())
                                }
                            }
                        }
                    }
                }
            }

            Item { Layout.preferredHeight: 8 }
        }
    }
}
