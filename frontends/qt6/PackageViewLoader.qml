import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: loader
    color: "transparent"

    property string packageId: ""

    // Try to load the package's QML view from disk
    Loader {
        id: viewLoader
        anchors.fill: parent
        source: resolvePackageView()
        onStatusChanged: {
            if (status === Loader.Error) {
                console.warn("PackageViewLoader: failed to load", packageId, source)
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
                    var meta = PackageRegistry.metadata(packageId)
                    return meta && meta.description ? meta.description : "Package view for " + packageId
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
                onClicked: {
                    if (PackageRegistry.loadPackage(packageId)) {
                        console.log("Loaded package:", packageId)
                    }
                }
            }
        }
    }

    function resolvePackageView() {
        // Try to find the PackageView.qml from package directories
        var paths = [
            "packages/" + packageId + "/PackageView.qml",
            "../packages/" + packageId + "/PackageView.qml"
        ]
        // Return first candidate; QML Loader handles missing gracefully
        return paths[0]
    }

    function formatTitle(id) {
        return id.split("-").map(function(w) {
            return w.charAt(0).toUpperCase() + w.slice(1)
        }).join(" ")
    }
}
