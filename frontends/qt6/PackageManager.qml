import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    color: Theme.background

    property string searchText: ""
    property string selectedPackageId: ""

    function filteredPackages() {
        var allPkgs = PackageLoader.packages
        if (searchText === "")
            return allPkgs
        var lower = searchText.toLowerCase()
        return allPkgs.filter(function(pkg) {
            return pkg.name.toLowerCase().indexOf(lower) !== -1
                || pkg.packageId.toLowerCase().indexOf(lower) !== -1
                || (pkg.description && pkg.description.toLowerCase().indexOf(lower) !== -1)
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
                status: "success"
                text: PackageLoader.packageCount + " packages"
            }
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            // Package details sidebar
            CCard {
                Layout.preferredWidth: 320
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    CText { variant: "subtitle1"; text: "Package Details" }

                    // Show details for selected package
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        color: "transparent"
                        visible: selectedPackageId !== ""

                        ColumnLayout {
                            anchors.fill: parent
                            spacing: 8

                            CText {
                                variant: "h5"
                                text: {
                                    var pkg = PackageLoader.getPackage(selectedPackageId)
                                    return pkg ? pkg.name : ""
                                }
                            }

                            CText {
                                variant: "body2"
                                wrapMode: Text.Wrap
                                Layout.fillWidth: true
                                text: {
                                    var pkg = PackageLoader.getPackage(selectedPackageId)
                                    return pkg ? pkg.description : ""
                                }
                            }

                            CDivider { Layout.fillWidth: true }

                            CText { variant: "caption"; text: "Version" }
                            CText {
                                variant: "body2"
                                text: {
                                    var pkg = PackageLoader.getPackage(selectedPackageId)
                                    return pkg ? pkg.version : ""
                                }
                            }

                            CText { variant: "caption"; text: "Category" }
                            CBadge {
                                text: {
                                    var pkg = PackageLoader.getPackage(selectedPackageId)
                                    return pkg && pkg.category ? pkg.category : "—"
                                }
                            }

                            CText { variant: "caption"; text: "Dependencies" }
                            CText {
                                variant: "body2"
                                wrapMode: Text.Wrap
                                Layout.fillWidth: true
                                text: {
                                    var deps = PackageLoader.resolveDependencies(selectedPackageId)
                                    return deps.length > 0 ? deps.join(", ") : "None"
                                }
                            }

                            Item { Layout.fillHeight: true }
                        }
                    }

                    // Placeholder when nothing selected
                    CText {
                        visible: selectedPackageId === ""
                        variant: "body2"
                        text: "Select a package to view details"
                        Layout.fillWidth: true
                        wrapMode: Text.Wrap
                    }

                    Item { Layout.fillHeight: true }

                    CDivider { Layout.fillWidth: true }

                    CButton {
                        text: "Rescan packages"
                        variant: "ghost"
                        Layout.fillWidth: true
                        onClicked: PackageLoader.scan()
                    }
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
                        CText {
                            variant: "caption"
                            text: filteredPackages().length + " / " + PackageLoader.packageCount
                        }
                    }

                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: filteredPackages()
                        spacing: 8
                        clip: true
                        delegate: CCard {
                            width: parent ? parent.width : 400
                            variant: "outlined"

                            FlexRow {
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 16

                                // Package icon badge
                                Rectangle {
                                    width: 40
                                    height: 40
                                    radius: 8
                                    color: modelData.installed ? Theme.primary : Theme.border
                                    Layout.alignment: Qt.AlignVCenter

                                    CText {
                                        anchors.centerIn: parent
                                        text: modelData.icon ? modelData.icon : modelData.name.charAt(0)
                                        variant: "subtitle1"
                                        color: modelData.installed ? "#ffffff" : Theme.textPrimary
                                    }
                                }

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 4
                                    CText { variant: "subtitle1"; text: modelData.name }
                                    CText { variant: "body2"; text: modelData.description; wrapMode: Text.Wrap }
                                    FlexRow {
                                        spacing: 8
                                        CBadge { text: "v" + modelData.version }
                                        CBadge {
                                            text: modelData.category ? modelData.category : "—"
                                            visible: modelData.category !== undefined
                                        }
                                        CBadge {
                                            text: "Level " + (modelData.level ? modelData.level : 2)
                                        }
                                    }
                                }

                                ColumnLayout {
                                    spacing: 6
                                    CButton {
                                        text: modelData.installed ? "Installed" : "Install"
                                        variant: modelData.installed ? "default" : "primary"
                                        enabled: !modelData.installed
                                        size: "sm"
                                        onClicked: PackageLoader.install(modelData.packageId)
                                    }
                                    CButton {
                                        text: "Uninstall"
                                        variant: "danger"
                                        size: "sm"
                                        enabled: modelData.installed
                                        onClicked: PackageLoader.uninstall(modelData.packageId)
                                    }
                                    CButton {
                                        text: "Details"
                                        variant: "ghost"
                                        size: "sm"
                                        onClicked: selectedPackageId = modelData.packageId
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
