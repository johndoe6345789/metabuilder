import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: loader
    color: "transparent"
    objectName: "view_package_" + packageId
    Accessible.role: Accessible.Pane
    Accessible.name: formatTitle(packageId)

    property string packageId: ""

    // Resolve view URL via PackageLoader (disk → QRC fallback)
    Loader {
        id: viewLoader
        anchors.fill: parent
        source: (packageId !== "" && PackageLoader)
            ? PackageLoader.qmlPathUrl(packageId) : ""
        onStatusChanged: {
            if (status === Loader.Error) {
                console.warn("PackageViewLoader: failed to load", packageId,
                    source)
            }
        }
    }

    // Hot-reload: react to QML file changes on disk
    Connections {
        target: PackageLoader
        function onPackageUpdated(id) {
            if (id === packageId) {
                var url = PackageLoader.qmlPathUrl(packageId)
                viewLoader.source = ""
                viewLoader.source = url
            }
        }
    }

    // Fallback when view can't be loaded
    Rectangle {
        anchors.fill: parent
        visible: viewLoader.status !== Loader.Ready
        color: "transparent"

        ColumnLayout {
            anchors.centerIn: parent
            spacing: 16

            CText {
                variant: "h3"
                text: formatTitle(packageId)
                Layout.alignment: Qt.AlignHCenter
            }

            CText {
                variant: "body1"
                text: {
                    var meta = PackageLoader
                        ? PackageLoader.getPackage(packageId) : null
                    return meta && meta.description
                        ? meta.description : "Package view for " + packageId
                }
                Layout.alignment: Qt.AlignHCenter
            }

            CBadge {
                text: packageId
                Layout.alignment: Qt.AlignHCenter
            }

            CButton {
                text: "Load Package"
                variant: "primary"
                Layout.alignment: Qt.AlignHCenter
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name:
                    "Load package: "
                    + formatTitle(packageId)
                Keys.onReturnPressed:
                    if (PackageLoader)
                        PackageLoader.install(packageId)
                onClicked: {
                    if (PackageLoader)
                        PackageLoader.install(packageId)
                    console.log(
                        "Installed package:",
                        packageId)
                }
            }
        }
    }

    function formatTitle(id) {
        return id.split("_").map(function(w) {
            return w.charAt(0).toUpperCase() + w.slice(1)
        }).join(" ")
    }
}
