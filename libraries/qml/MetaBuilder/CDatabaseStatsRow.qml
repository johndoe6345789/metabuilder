import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

FlexRow {
    id: root
    objectName: "row_database_stats"
    Accessible.role: Accessible.Pane
    Accessible.name: "Database Statistics"
    Layout.fillWidth: true
    spacing: 12

    property string totalRecords: "0"
    property string totalSize: "0 KB"
    property string activeBackend: ""
    property string adapterPattern: ""

    CCard {
        Layout.fillWidth: true
        implicitHeight: 72
        Accessible.role: Accessible.StaticText
        Accessible.name: "Total Records: " + root.totalRecords

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4
            CText { variant: "caption"; text: "Total Records" }
            CText { variant: "h4"; text: root.totalRecords }
        }
    }

    CCard {
        Layout.fillWidth: true
        implicitHeight: 72
        Accessible.role: Accessible.StaticText
        Accessible.name: "Total Size: " + root.totalSize

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4
            CText { variant: "caption"; text: "Total Size" }
            CText { variant: "h4"; text: root.totalSize }
        }
    }

    CCard {
        Layout.fillWidth: true
        implicitHeight: 72
        Accessible.role: Accessible.StaticText
        Accessible.name: "Active Backend: " + root.activeBackend

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4
            CText { variant: "caption"; text: "Active Backend" }
            CText { variant: "h4"; text: root.activeBackend }
        }
    }

    CCard {
        Layout.fillWidth: true
        implicitHeight: 72
        Accessible.role: Accessible.StaticText
        Accessible.name: "Adapter Pattern: " + root.adapterPattern

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4
            CText { variant: "caption"; text: "Adapter Pattern" }
            CText { variant: "h4"; text: root.adapterPattern }
        }
    }
}
