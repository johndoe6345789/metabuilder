import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    color: "#0f1117"

    property string selectedFile: ""
    property var    jobModel: null
    property var    uploader: null
    property int    uploadPct: 0
    property bool   uploading: false

    signal browseRequested()

    Connections {
        target: root.uploader
        function onUploadProgress(path, pct) {
            if (path !== root.selectedFile) return
            root.uploadPct = pct; root.uploading = true
        }
        function onUploadDone(path) {
            if (path === root.selectedFile) root.uploading = false
        }
        function onUploadError(path) {
            if (path === root.selectedFile) root.uploading = false
        }
    }

    readonly property string fileName:
        selectedFile !== "" ? selectedFile.split("/").pop() : ""
    readonly property string fileExt:
        fileName !== "" ? fileName.split(".").pop().toLowerCase() : ""

    ColumnLayout {
        anchors.fill: parent; spacing: 0

        // Header strip
        Rectangle {
            Layout.fillWidth: true; height: 68
            color: "#161b22"
            border.color: "#30363d"; border.width: 1

            RowLayout {
                anchors.fill: parent; anchors.margins: 14; spacing: 12

                Rectangle {
                    width: 40; height: 40; radius: 8
                    color: Qt.rgba(0.98, 0.45, 0.09, 0.12)
                    border.color: "#f97316"; border.width: 2
                    Text { anchors.centerIn: parent; text: "↑"
                        color: "#f97316"; font.pixelSize: 20; font.bold: true }
                }
                ColumnLayout {
                    spacing: 2; Layout.fillWidth: true
                    Label {
                        text: root.fileName || "New Stream"
                        color: "#e6edf3"; font.pixelSize: 14; font.bold: true
                        elide: Text.ElideMiddle; Layout.fillWidth: true
                    }
                    Label {
                        text: root.fileExt !== ""
                            ? root.fileExt.toUpperCase() + "  ·  Stream to MetaBuilder"
                            : "Select a file to stream"
                        color: "#8b949e"; font.pixelSize: 11
                    }
                }
            }
        }

        // Empty state — no file loaded yet
        Item {
            visible: root.selectedFile === ""
            Layout.fillWidth: true; Layout.fillHeight: true

            ColumnLayout {
                anchors.centerIn: parent; spacing: 16

                Rectangle {
                    Layout.alignment: Qt.AlignHCenter
                    width: 64; height: 64; radius: 32
                    color: Qt.rgba(0.98, 0.45, 0.09, 0.08)
                    border.color: Qt.rgba(0.98, 0.45, 0.09, 0.3); border.width: 2
                    Text { anchors.centerIn: parent; text: "↑"
                        color: "#f97316"; font.pixelSize: 28; font.bold: true }
                }

                Label {
                    text: "No file selected"
                    color: "#8b949e"; font.pixelSize: 15
                    Layout.alignment: Qt.AlignHCenter
                }
                Label {
                    text: "Click ↑ on a queue item, or browse below"
                    color: "#484f58"; font.pixelSize: 12
                    Layout.alignment: Qt.AlignHCenter
                }

                Rectangle {
                    Layout.alignment: Qt.AlignHCenter
                    width: 180; height: 40; radius: 8
                    color: browseMa.containsMouse
                        ? "#7c3300" : Qt.rgba(0.98, 0.45, 0.09, 0.15)
                    border.color: "#f97316"; border.width: 1

                    Text { anchors.centerIn: parent
                        text: "Browse…"; color: "#f97316"
                        font.pixelSize: 13; font.bold: true }

                    MouseArea { id: browseMa; anchors.fill: parent
                        hoverEnabled: true
                        onClicked: root.browseRequested() }
                }
            }
        }

        // File loaded state — upload controls
        Item {
            visible: root.selectedFile !== ""
            Layout.fillWidth: true; Layout.fillHeight: true

            ColumnLayout {
                anchors.centerIn: parent
                width: Math.min(parent.width - 48, 400); spacing: 14

                ProgressBar {
                    id: pb; visible: root.uploading
                    value: root.uploadPct / 100; Layout.fillWidth: true
                    background: Rectangle { color: "#21262d"; radius: 4 }
                    contentItem: Item {
                        Rectangle {
                            width: pb.visualPosition * parent.width
                            height: parent.height; color: "#f97316"; radius: 4
                        }
                    }
                }
                Label {
                    visible: root.uploading
                    text: "Uploading… " + root.uploadPct + "%"
                    color: "#f97316"; font.pixelSize: 12
                    Layout.alignment: Qt.AlignHCenter
                }
                Button {
                    text: "Stream to MetaBuilder"
                    enabled: !root.uploading
                    Layout.alignment: Qt.AlignHCenter
                    implicitWidth: 220; implicitHeight: 44
                    onClicked: root.uploader?.upload(root.selectedFile)
                    contentItem: Text {
                        text: parent.text
                        color: parent.enabled ? "#e6edf3" : "#8b949e"
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                        font.pixelSize: 14; font.bold: true
                    }
                    background: Rectangle {
                        color: parent.enabled ? "#f97316" : "#30363d"
                        radius: 8
                    }
                }
                // Switch file button
                Rectangle {
                    Layout.alignment: Qt.AlignHCenter
                    width: 140; height: 32; radius: 6
                    color: switchMa.containsMouse ? "#1c2128" : "transparent"
                    border.color: "#30363d"; border.width: 1
                    Text { anchors.centerIn: parent
                        text: "Change File…"; color: "#8b949e"
                        font.pixelSize: 12 }
                    MouseArea { id: switchMa; anchors.fill: parent
                        hoverEnabled: true
                        onClicked: root.browseRequested() }
                }
            }
        }

        Rectangle { Layout.fillWidth: true; height: 1; color: "#30363d" }

        JobQueue {
            model: root.jobModel
            Layout.fillWidth: true; Layout.preferredHeight: 200
        }
    }
}
