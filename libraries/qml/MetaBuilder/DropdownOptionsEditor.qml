import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    objectName: "dropdownOptionsEditor"
    Accessible.role: Accessible.Form
    Accessible.name: "Dropdown options editor"
    spacing: 16
    property var dropdown: null
    signal addOptionClicked()
    signal removeOptionClicked(int optIndex)
    signal moveOptionClicked(int optIndex, int direction)
    signal optionFieldChanged(
        int optIndex, string field, string value)

    FlexRow {
        Layout.fillWidth: true; spacing: 8
        CText { variant: "body2"; text: "Options"; font.bold: true }
        CBadge {
            text: root.dropdown
                ? root.dropdown.options.length
                    + " items"
                : "0 items"
        }
        Item { Layout.fillWidth: true }
        CButton {
            text: "+ Add Option"; variant: "primary"; size: "sm"
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: "Add option"
            Keys.onReturnPressed: root.addOptionClicked()
            Keys.onSpacePressed: root.addOptionClicked()
            onClicked: root.addOptionClicked()
        }
    }

    Repeater {
        model: root.dropdown ? root.dropdown.options : []
        CPaper {
            Layout.fillWidth: true
            implicitHeight: optionRow.implicitHeight + 24
            RowLayout {
                id: optionRow
                anchors.fill: parent; anchors.margins: 12; spacing: 8
                CText {
                    variant: "caption"; text: (index + 1) + "."
                    Layout.preferredWidth: 24; color: Theme.text; opacity: 0.5
                }
                CTextField {
                    label: "Label"
                    placeholderText: "Display label"
                    text: modelData.label
                    Layout.fillWidth: true
                    Accessible.role: Accessible.EditableText
                    Accessible.name: "Option "
                        + (index + 1) + " label"
                    onTextChanged: {
                        if (text !== modelData.label)
                            root.optionFieldChanged(
                                index, "label", text)
                    }
                }
                CTextField {
                    label: "Value"
                    placeholderText: "stored_value"
                    text: modelData.value
                    Layout.fillWidth: true
                    Accessible.role: Accessible.EditableText
                    Accessible.name: "Option "
                        + (index + 1) + " value"
                    onTextChanged: {
                        if (text !== modelData.value)
                            root.optionFieldChanged(
                                index, "value", text)
                    }
                }
                ColumnLayout {
                    spacing: 2
                    CButton {
                        text: "\u25B2"
                        variant: "ghost"; size: "sm"
                        enabled: index > 0
                        activeFocusOnTab: true
                        Accessible.role: Accessible.Button
                        Accessible.name: "Move option "
                            + (index + 1) + " up"
                        Keys.onReturnPressed:
                            root.moveOptionClicked(
                                index, -1)
                        Keys.onSpacePressed:
                            root.moveOptionClicked(
                                index, -1)
                        onClicked:
                            root.moveOptionClicked(
                                index, -1)
                    }
                    CButton {
                        text: "\u25BC"
                        variant: "ghost"; size: "sm"
                        enabled: root.dropdown
                            ? index < root.dropdown
                                .options.length - 1
                            : false
                        activeFocusOnTab: true
                        Accessible.role: Accessible.Button
                        Accessible.name: "Move option "
                            + (index + 1) + " down"
                        Keys.onReturnPressed:
                            root.moveOptionClicked(
                                index, 1)
                        Keys.onSpacePressed:
                            root.moveOptionClicked(
                                index, 1)
                        onClicked:
                            root.moveOptionClicked(
                                index, 1)
                    }
                }
                CButton {
                    text: "X"; variant: "danger"; size: "sm"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Remove option "
                        + (index + 1)
                    Keys.onReturnPressed:
                        root.removeOptionClicked(index)
                    Keys.onSpacePressed:
                        root.removeOptionClicked(index)
                    onClicked:
                        root.removeOptionClicked(index)
                }
            }
        }
    }
}
