import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: pkgRoot
    color: Theme.background
    objectName: "view_package_manager"
    Accessible.role: Accessible.Pane
    Accessible.name: "Package Manager"

    property string searchText: ""
    property string selectedPackageId: ""

    function filteredPackages() {
        var allPkgs = PackageLoader ? PackageLoader.packages : []
        if (searchText === "")
            return allPkgs
        var lower = searchText.toLowerCase()
        return allPkgs.filter(function(pkg) {
            return pkg.name.toLowerCase()
                    .indexOf(lower) !== -1
                || pkg.packageId.toLowerCase()
                    .indexOf(lower) !== -1
                || (pkg.description
                    && pkg.description
                        .toLowerCase()
                        .indexOf(lower) !== -1)
        })
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 16
        anchors.margins: 20

        FlexRow {
            Layout.fillWidth: true
            spacing: 12
            CText {
                variant: "h3"
                text: "Package Manager"
            }
            CStatusBadge {
                status: "success"
                text: (PackageLoader
                    ? PackageLoader.packageCount : 0)
                    + " packages"
            }
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            CPackageDetailSidebar {
                selectedPackageId:
                    pkgRoot.selectedPackageId
                onRescanRequested:
                    if (PackageLoader) PackageLoader.scan()
            }

            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true

                ColumnLayout {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    spacing: 12

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12
                        CTextField {
                            placeholderText:
                                "Search packages"
                            text: searchText
                            onTextChanged:
                                searchText = text
                            Layout.fillWidth: true
                            activeFocusOnTab: true
                            Accessible.role:
                                Accessible.EditableText
                            Accessible.name:
                                "Search packages"
                        }
                        CText {
                            variant: "caption"
                            text:
                                filteredPackages()
                                .length + " / "
                                + (PackageLoader
                                    ? PackageLoader.packageCount || 0
                                    : 0)
                        }
                    }

                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: filteredPackages()
                        spacing: 8
                        clip: true
                        delegate:
                            CPackageListItem {
                            width: parent
                                ? parent.width
                                : 400
                            packageData: modelData
                            onInstallRequested:
                                PackageLoader
                                .install(modelData
                                    .packageId)
                            onUninstallRequested:
                                PackageLoader
                                .uninstall(
                                    modelData
                                    .packageId)
                            onDetailsRequested:
                                selectedPackageId
                                = modelData
                                    .packageId
                        }
                    }
                }
            }
        }
    }
}
