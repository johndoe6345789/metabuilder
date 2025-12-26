import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

import "qmllib/Material" as Material

ApplicationWindow {
    visible: true
    width: 1400
    height: 900
    title: "MetaBuilder Package Manager"
    color: Material.MaterialPalette.background

    property var repositories: [
        { name: "Official", url: "https://repo.metabuilder.dev", description: "Curated MetaBuilder toolkit", status: "online" },
        { name: "Community", url: "https://community.metabuilder.dev", description: "Community-contributed adapters", status: "online" },
        { name: "Local", url: "file://packages/local", description: "Local drafts", status: "offline" }
    ]

    property var packages: [
        { id: "material_ui", name: "Material UI Kit", repo: "Official", version: "2.1.0", description: "Shared Material components for Qt.", installed: true, size: "4.1 MB" },
        { id: "db_connector", name: "Qt DB Connector", repo: "Community", version: "1.4.2", description: "Live DBAL observability widgets.", installed: false, size: "2.7 MB" },
        { id: "prisma_console", name: "Prisma Console", repo: "Official", version: "0.9.0", description: "Prisma schema preview and migrations view.", installed: false, size: "3.2 MB" },
        { id: "storybook_themes", name: "Storybook Themes", repo: "Local", version: "1.0.3", description: "Additional Storybook scenes + theming", installed: true, size: "1.8 MB" },
        { id: "telemetry", name: "Telemetry Metrics", repo: "Community", version: "0.4.1", description: "CPU/RAM/Latency dashboards for daemons.", installed: false, size: "5.6 MB" }
    ]

    property int selectedRepoIndex: 0
    property int selectedPackageIndex: 0
    property string searchText: ""

    function togglePackage(name, install) {
        packages = packages.map(pkg => pkg.name === name ? Object.assign({}, pkg, { installed: install }) : pkg)
    }

    function filteredPackages() {
        const currentRepo = repositories[selectedRepoIndex].name
        return packages.filter((pkg) => pkg.repo === currentRepo && pkg.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 16
        anchors.margins: 20

        Material.MaterialToolbar {
            Layout.fillWidth: true
            Material.MaterialTypography { variant: "h2"; text: "Package Manager" }
            Material.MaterialBadge { text: repositories[selectedRepoIndex].status === "online" ? "Online" : "Offline"; accent: true }
        }

        RowLayout {
            Layout.fillWidth: true
            spacing: 16

            Rectangle {
                width: 320
                radius: 16
                color: Material.MaterialPalette.surface
                border.color: Material.MaterialPalette.outline
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    Text { text: "Repositories"; font.pixelSize: 18; font.bold: true; color: Material.MaterialPalette.onSurface }

                    ListView {
                        id: repoList
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: repositories
                        spacing: 6
                        delegate: Rectangle {
                            width: parent.width
                            height: 80
                            radius: 12
                            border.color: index === selectedRepoIndex ? Material.MaterialPalette.primary : Material.MaterialPalette.surfaceVariant
                            border.width: index === selectedRepoIndex ? 2 : 1
                            color: index === selectedRepoIndex ? Material.MaterialPalette.primaryContainer : "transparent"
                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 10
                                spacing: 4

                                Text { text: name; font.pixelSize: 16; font.bold: true; color: Material.MaterialPalette.onSurface }
                                Text { text: description; font.pixelSize: 12; color: Material.MaterialPalette.onSurface; opacity: 0.7 }
                                Text { text: url; font.pixelSize: 10; color: Material.MaterialPalette.onSurface; opacity: 0.6 }
                            }
                            MouseArea {
                                anchors.fill: parent
                                onClicked: selectedRepoIndex = index; selectedPackageIndex = 0
                            }
                        }
                    }

                    Material.MaterialDivider { Layout.fillWidth: true }

                    Material.MaterialButton {
                        text: "Add repository"
                        onClicked: console.log("Add repo flow")
                    }
                    Material.MaterialButton {
                        text: "Refresh metadata"
                        outlined: true
                        onClicked: console.log("Refresh packages for", repositories[selectedRepoIndex].name)
                    }
                }
            }

            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                radius: 16
                color: Material.MaterialPalette.surface
                border.color: Material.MaterialPalette.outline

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 12
                        TextField {
                            placeholderText: "Search packages"
                            text: searchText
                            onTextChanged: searchText = text
                            Layout.fillWidth: true
                            background: Rectangle {
                                radius: 10
                                border.color: Material.MaterialPalette.outline
                                color: Material.MaterialPalette.surfaceVariant
                            }
                        }
                        Material.MaterialButton {
                            text: "Install from archive"
                            outlined: true
                            onClicked: console.log("Simulate install from zip/rcc")
                        }
                    }

                    Rectangle {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        color: "transparent"
                        radius: 12
                        border.color: Material.MaterialPalette.surfaceVariant

                        ListView {
                            id: packageList
                            anchors.fill: parent
                            spacing: 8
                        model: filteredPackages()
                            delegate: Rectangle {
                                width: parent.width
                                height: 110
                                radius: 12
                                border.color: index === selectedPackageIndex ? Material.MaterialPalette.primary : Material.MaterialPalette.surfaceVariant
                                border.width: index === selectedPackageIndex ? 2 : 1
                                color: "transparent"
                                RowLayout {
                                    anchors.fill: parent
                                    anchors.margins: 12
                                    spacing: 16

                                    ColumnLayout {
                                        spacing: 4
                                        Text { text: model.name; font.pixelSize: 18; font.bold: true; color: Material.MaterialPalette.onSurface }
                                        Text { text: model.description; font.pixelSize: 12; color: Material.MaterialPalette.onSurface; opacity: 0.7; wrapMode: Text.Wrap }
                                        Text { text: "v" + model.version + " · " + model.size; font.pixelSize: 11; color: Material.MaterialPalette.onSurface; opacity: 0.6 }
                                    }

                                    Item { Layout.fillWidth: true }
                                    ColumnLayout {
                                        spacing: 6
                                        Material.MaterialButton {
                                            text: model.installed ? "Installed" : "Install"
                                            outlined: !model.installed
                                            enabled: !model.installed
                                            onClicked: {
                                                if (PackageRegistry.loadPackage(model.id)) {
                                                    togglePackage(model.id, true)
                                                } else {
                                                    console.warn("Failed to load package", model.id)
                                                }
                                            }
                                        }
                                        Material.MaterialButton {
                                            text: "Uninstall"
                                            outlined: true
                                            enabled: model.installed
                                            onClicked: togglePackage(model.name, false)
                                        }
                                    }
                                }
                                MouseArea {
                                    anchors.fill: parent
                                    onClicked: selectedPackageIndex = index
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
