import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    objectName: "panel_dropdown_editor"
    Accessible.role: Accessible.Pane
    Accessible.name: "Dropdown Editor"
    Layout.fillWidth: true
    Layout.fillHeight: true

    property var dropdown: null
    property int selectedIndex: -1

    signal deleteClicked()
    signal fieldChanged(string field, var value)
    signal addOptionClicked()
    signal removeOptionClicked(int idx)
    signal moveOptionClicked(int idx, int dir)
    signal optionFieldChanged(
        int idx, string field, var val
    )

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 12

        Item {
            Layout.fillWidth: true
            Layout.fillHeight: true
            visible: root.selectedIndex < 0
            CText {
                anchors.centerIn: parent
                variant: "body1"
                text: "Select a dropdown from the "
                    + "list to edit its "
                    + "configuration."
                color: Theme.text
                opacity: 0.5
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 12
            visible: root.selectedIndex >= 0

            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                CText {
                    variant: "h4"
                    text: root.dropdown
                        ? root.dropdown.name : ""
                }
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Delete"
                    variant: "danger"
                    size: "sm"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Delete dropdown"
                    Accessible.description:
                        "Delete the selected dropdown"
                    Keys.onReturnPressed:
                        root.deleteClicked()
                    Keys.onSpacePressed:
                        root.deleteClicked()
                    onClicked: root.deleteClicked()
                }
            }

            CDivider { Layout.fillWidth: true }

            Flickable {
                Layout.fillWidth: true
                Layout.fillHeight: true
                contentHeight:
                    editorColumn.implicitHeight
                clip: true
                boundsBehavior:
                    Flickable.StopAtBounds

                ColumnLayout {
                    id: editorColumn
                    width: parent.width
                    spacing: 16

                    DropdownGeneralForm {
                        Layout.fillWidth: true
                        dropdown: root.dropdown
                        onFieldChanged:
                            function(field, value) {
                            root.fieldChanged(
                                field, value)
                        }
                    }
                    CDivider {
                        Layout.fillWidth: true
                    }
                    DropdownOptionsEditor {
                        Layout.fillWidth: true
                        dropdown: root.dropdown
                        onAddOptionClicked:
                            root.addOptionClicked()
                        onRemoveOptionClicked:
                            function(idx) {
                            root.removeOptionClicked(
                                idx)
                        }
                        onMoveOptionClicked:
                            function(idx, dir) {
                            root.moveOptionClicked(
                                idx, dir)
                        }
                        onOptionFieldChanged:
                            function(idx, field, val) {
                            root.optionFieldChanged(
                                idx, field, val)
                        }
                    }
                    CDivider {
                        Layout.fillWidth: true
                    }
                    CText {
                        variant: "body2"
                        text: "Preview"
                        font.bold: true
                    }
                    DropdownPreview {
                        Layout.fillWidth: true
                        dropdown: root.dropdown
                    }
                    Item {
                        Layout.preferredHeight: 16
                    }
                }
            }
        }
    }
}
