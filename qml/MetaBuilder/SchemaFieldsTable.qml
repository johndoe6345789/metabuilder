import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property var schema: null
    property var fields: []
    property int selectedFieldIndex: -1

    signal fieldClicked(int index)
    signal addFieldClicked()
    signal removeFieldClicked()

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12

        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CText {
                variant: "h4"
                text: root.schema ? root.schema.name + " Fields" : "No Schema Selected"
            }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Add Field"
                variant: "primary"
                size: "sm"
                onClicked: root.addFieldClicked()
                visible: root.schema !== null
            }
            CButton {
                text: "Remove Field"
                variant: "danger"
                size: "sm"
                enabled: root.selectedFieldIndex >= 0
                visible: root.schema !== null
                onClicked: root.removeFieldClicked()
            }
        }

        Rectangle {
            Layout.fillWidth: true
            height: 36
            color: Theme.surface
            radius: 4

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 12
                anchors.rightMargin: 12
                spacing: 8

                CText { variant: "caption"; text: "NAME";     Layout.preferredWidth: 140; font.bold: true }
                CText { variant: "caption"; text: "TYPE";     Layout.preferredWidth: 100; font.bold: true }
                CText { variant: "caption"; text: "REQUIRED"; Layout.preferredWidth: 80;  font.bold: true }
                CText { variant: "caption"; text: "DEFAULT";  Layout.fillWidth: true;     font.bold: true }
            }
        }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.fields
            spacing: 2
            clip: true

            delegate: Rectangle {
                width: parent ? parent.width : 400
                height: 40
                radius: 4
                color: index === root.selectedFieldIndex
                    ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12)
                    : (fieldMouse.containsMouse ? Theme.surface : "transparent")

                MouseArea {
                    id: fieldMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    onClicked: root.fieldClicked(index)
                }

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 12
                    anchors.rightMargin: 12
                    spacing: 8

                    CText {
                        variant: "body2"
                        text: modelData.name
                        Layout.preferredWidth: 140
                        font.bold: index === root.selectedFieldIndex
                    }
                    CChip {
                        text: modelData.type
                        Layout.preferredWidth: 100
                    }
                    CText {
                        variant: "body2"
                        text: modelData.required ? "Yes" : "No"
                        color: modelData.required ? Theme.primary : Theme.border
                        Layout.preferredWidth: 80
                    }
                    CText {
                        variant: "caption"
                        text: modelData.defaultValue || "-"
                        Layout.fillWidth: true
                        elide: Text.ElideRight
                    }
                }
            }
        }

        CDivider { Layout.fillWidth: true }

        CText {
            variant: "caption"
            text: root.schema ? root.schema.description : ""
            color: Theme.border
        }
    }
}
