import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    objectName: "section_backend_connection"
    Accessible.role: Accessible.Pane
    Accessible.name: "Backend Connection"
    Layout.fillWidth: true
    spacing: 16

    property string connectionString: ""
    property bool isActive: false
    property bool isTesting: false
    property bool isConnected: false
    property var testResult: undefined

    signal testConnectionRequested()
    signal setActiveRequested()

    CText { variant: "subtitle1"; text: "Connection" }

    CTextField {
        label: "Connection String"
        text: root.connectionString
        Layout.fillWidth: true
        activeFocusOnTab: true
        Accessible.role: Accessible.EditableText
        Accessible.name: "Connection String"
        Accessible.description:
            "Database connection string for this backend"
    }

    FlexRow {
        Layout.fillWidth: true
        spacing: 8

        CButton {
            text: root.isTesting ? "Testing..." : "Test Connection"
            variant: "primary"
            enabled: !root.isTesting
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: "Test Connection"
            Accessible.description:
                "Test the current connection string"
            Keys.onReturnPressed: root.testConnectionRequested()
            Keys.onSpacePressed: root.testConnectionRequested()
            onClicked: root.testConnectionRequested()
        }

        CButton {
            text: root.isActive ? "Active Backend" : "Set as Active"
            variant: root.isActive ? "ghost" : "primary"
            enabled: !root.isActive && root.isConnected
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: root.isActive
                ? "Active Backend" : "Set as Active"
            Accessible.description:
                "Set this backend as the active database"
            Keys.onReturnPressed: root.setActiveRequested()
            Keys.onSpacePressed: root.setActiveRequested()
            onClicked: root.setActiveRequested()
        }

        Item { Layout.fillWidth: true }

        Loader {
            active: root.testResult !== undefined
            sourceComponent: CStatusBadge {
                status: root.testResult === "success" ? "success" : "error"
                text: root.testResult === "success"
                    ? "Connection OK" : "Connection Failed"
            }
        }
    }
}
