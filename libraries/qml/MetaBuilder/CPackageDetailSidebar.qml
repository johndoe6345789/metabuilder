import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: detailSidebar
    Layout.preferredWidth: 320
    Layout.fillHeight: true
    property string selectedPackageId: ""
    signal rescanRequested()

    ColumnLayout {
        Layout.fillWidth: true
        spacing: 12

        CText { variant: "subtitle1"; text: "Package Details" }

        Rectangle {
            Layout.fillWidth: true; Layout.fillHeight: true
            color: "transparent"; visible: selectedPackageId !== ""
            ColumnLayout {
                Layout.fillWidth: true; Layout.fillHeight: true; spacing: 8
                CText {
                    variant: "h5"
                    text: {
                        var pkg = PackageLoader
                            ? PackageLoader.getPackage(
                                selectedPackageId) : null
                        return pkg ? (pkg.name || "") : ""
                    }
                }
                CText {
                    variant: "body2"
                    wrapMode: Text.Wrap
                    Layout.fillWidth: true
                    text: {
                        var pkg = PackageLoader
                            ? PackageLoader.getPackage(
                                selectedPackageId) : null
                        return pkg ? (pkg.description || "") : ""
                    }
                }
                CDivider { Layout.fillWidth: true }
                CText { variant: "caption"; text: "Version" }
                CText {
                    variant: "body2"
                    text: {
                        var pkg = PackageLoader
                            ? PackageLoader.getPackage(
                                selectedPackageId) : null
                        return pkg ? (pkg.version || "") : ""
                    }
                }
                CText { variant: "caption"; text: "Category" }
                CBadge {
                    text: {
                        var pkg = PackageLoader
                            ? PackageLoader.getPackage(
                                selectedPackageId) : null
                        return pkg && pkg.category
                            ? pkg.category : "\u2014"
                    }
                }
                CText { variant: "caption"; text: "Dependencies" }
                CText {
                    variant: "body2"
                    wrapMode: Text.Wrap
                    Layout.fillWidth: true
                    text: {
                        var deps = PackageLoader
                            ? PackageLoader.resolveDependencies(
                                selectedPackageId) : []
                        return deps.length > 0
                            ? deps.join(", ") : "None"
                    }
                }
                Item { Layout.fillHeight: true }
            }
        }
        CText {
            visible: selectedPackageId === ""; variant: "body2"
            text: "Select a package to view details"
            Layout.fillWidth: true; wrapMode: Text.Wrap
        }
        Item { Layout.fillHeight: true }
        CDivider { Layout.fillWidth: true }
        CButton {
            text: "Rescan packages"
            variant: "ghost"
            Layout.fillWidth: true
            onClicked: rescanRequested()
        }
    }
}
