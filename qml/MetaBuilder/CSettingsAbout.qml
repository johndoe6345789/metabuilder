import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

CSettingsSection {
    title: "About"

    property var aboutConfig: []

    Repeater {
        model: aboutConfig
        delegate: FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText { variant: "body2"; text: modelData.label; opacity: 0.6
            Layout.preferredWidth: 120 }
            CText { variant: "body1"; text: modelData.value }
        }
    }
    FlexRow {
        Layout.fillWidth: true; spacing: 12
        CText { variant: "body2"; text: "Platform"; opacity: 0.6
        Layout.preferredWidth: 120 }
        CText { variant: "body1"; text: Qt.platform.os }
    }
    CDivider { Layout.fillWidth: true }
    FlexRow {
        Layout.fillWidth: true; spacing: 12
        CButton { text: "View Documentation"; variant: "default"; size: "sm";
            onClicked: Qt.openUrlExternally(
                "https://github.com/nicholasgriffintn/metabuilder") }
        CButton { text: "Report Issue"; variant: "ghost"; size: "sm";
            onClicked: Qt.openUrlExternally(
                "https://github.com/nicholasgriffintn/metabuilder/issues") }
    }
}
