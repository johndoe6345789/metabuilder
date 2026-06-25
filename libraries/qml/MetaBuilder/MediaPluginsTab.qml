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
                CText { variant: "caption"; text: plugins.length + " plugins"
                color: Theme.textSecondary }

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

                    delegate: MediaPluginCard {
                        name: modelData.name
                        version: modelData.version
                        status: modelData.status
                        capabilities: modelData.capabilities
                        onReloadRequested: reloadPlugin(
                            plugins[index].name.toLowerCase())
                    }
                }
            }

            Item { Layout.preferredHeight: 8 }
        }
    }
}
