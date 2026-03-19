import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    color: Theme.background

    property var repositories: [
        { name: "Official",  url: "https://repo.metabuilder.dev",      description: "Curated MetaBuilder toolkit", status: "online" },
        { name: "Community", url: "https://community.metabuilder.dev", description: "Community-contributed adapters", status: "online" },
        { name: "Local",     url: "file://packages/local",             description: "Local drafts", status: "offline" }
    ]

    property var packages: [
        { id: "material_ui",      name: "Material UI Kit",   repo: "Official",  version: "2.1.0", description: "Shared Material components for Qt.",          installed: true,  size: "4.1 MB" },
        { id: "db_connector",     name: "Qt DB Connector",   repo: "Community", version: "1.4.2", description: "Live DBAL observability widgets.",             installed: false, size: "2.7 MB" },
        { id: "prisma_console",   name: "Prisma Console",    repo: "Official",  version: "0.9.0", description: "Prisma schema preview and migrations view.",  installed: false, size: "3.2 MB" },
        { id: "storybook_themes", name: "Storybook Themes",  repo: "Local",     version: "1.0.3", description: "Additional Storybook scenes + theming",       installed: true,  size: "1.8 MB" },
        { id: "telemetry",        name: "Telemetry Metrics", repo: "Community", version: "0.4.1", description: "CPU/RAM/Latency dashboards for daemons.",     installed: false, size: "5.6 MB" }
    ]

    property int selectedRepoIndex: 0
    property string searchText: ""

    function togglePackage(name, install) {
        packages = packages.map(function(pkg) {
            return pkg.name === name ? Object.assign({}, pkg, { installed: install }) : pkg
        })
    }

    function filteredPackages() {
        var currentRepo = repositories[selectedRepoIndex].name
        return packages.filter(function(pkg) {
            return pkg.repo === currentRepo && pkg.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
        })
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 16
        anchors.margins: 20

        FlexRow {
            Layout.fillWidth: true
            spacing: 12
            CText { variant: "h3"; text: "Package Manager" }
            CStatusBadge {
                status: repositories[selectedRepoIndex].status === "online" ? "success" : "warning"
                text: repositories[selectedRepoIndex].status
            }
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            // Repo sidebar
            CCard {
                Layout.preferredWidth: 320
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    CText { variant: "subtitle1"; text: "Repositories" }

                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: repositories
                        spacing: 6
                        delegate: CListItem {
                            width: parent ? parent.width : 280
                            title: modelData.name
                            subtitle: modelData.description
                            selected: index === selectedRepoIndex
                            onClicked: selectedRepoIndex = index
                        }
                    }

                    CDivider { Layout.fillWidth: true }
                    CButton { text: "Add repository"; variant: "primary"; Layout.fillWidth: true }
                    CButton { text: "Refresh metadata"; variant: "ghost"; Layout.fillWidth: true }
                }
            }

            // Package list
            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12
                        CTextField {
                            placeholderText: "Search packages"
                            text: searchText
                            onTextChanged: searchText = text
                            Layout.fillWidth: true
                        }
                        CButton { text: "Install from archive"; variant: "ghost" }
                    }

                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: filteredPackages()
                        spacing: 8
                        delegate: CCard {
                            width: parent ? parent.width : 400
                            variant: "outlined"

                            FlexRow {
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 16

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 4
                                    CText { variant: "subtitle1"; text: modelData.name }
                                    CText { variant: "body2"; text: modelData.description; wrapMode: Text.Wrap }
                                    CText { variant: "caption"; text: "v" + modelData.version + " \u00b7 " + modelData.size }
                                }

                                ColumnLayout {
                                    spacing: 6
                                    CButton {
                                        text: modelData.installed ? "Installed" : "Install"
                                        variant: modelData.installed ? "default" : "primary"
                                        enabled: !modelData.installed
                                        size: "sm"
                                        onClicked: {
                                            if (PackageRegistry.loadPackage(modelData.id)) {
                                                togglePackage(modelData.name, true)
                                            }
                                        }
                                    }
                                    CButton {
                                        text: "Uninstall"
                                        variant: "danger"
                                        size: "sm"
                                        enabled: modelData.installed
                                        onClicked: togglePackage(modelData.name, false)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
