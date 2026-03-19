import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    objectName: "dropdownGeneralForm"
    Accessible.role: Accessible.Form
    Accessible.name: "Dropdown general settings"
    spacing: 16

    property var dropdown: null
    signal fieldChanged(string field, var value)

    CText { variant: "body2"; text: "General"; font.bold: true }

    RowLayout {
        Layout.fillWidth: true
        spacing: 12

        CTextField {
            label: "Name"
            placeholderText: "dropdown_name"
            text: root.dropdown ? root.dropdown.name : ""
            Layout.fillWidth: true
            Accessible.role: Accessible.EditableText
            Accessible.name: "Dropdown name"
            onTextChanged: {
                if (root.dropdown && text !== root.dropdown.name)
                    root.fieldChanged("name", text)
            }
        }

        CTextField {
            label: "Description"
            placeholderText: "What is this dropdown for?"
            text: root.dropdown ? root.dropdown.description : ""
            Layout.fillWidth: true
            Accessible.role: Accessible.EditableText
            Accessible.name: "Dropdown description"
            onTextChanged: {
                if (root.dropdown
                    && text !== root.dropdown.description)
                    root.fieldChanged("description", text)
            }
        }
    }

    RowLayout {
        Layout.fillWidth: true
        spacing: 24

        RowLayout {
            spacing: 8
            Switch {
                checked: root.dropdown
                    ? root.dropdown.allowCustom : false
                activeFocusOnTab: true
                Accessible.role: Accessible.CheckBox
                Accessible.name: "Allow custom values"
                onCheckedChanged: {
                    if (root.dropdown
                        && checked !== root.dropdown.allowCustom)
                        root.fieldChanged("allowCustom", checked)
                }
            }
            CText {
                variant: "body2"; text: "Allow custom values"
            }
        }

        RowLayout {
            spacing: 8
            Switch {
                checked: root.dropdown
                    ? root.dropdown.required : false
                activeFocusOnTab: true
                Accessible.role: Accessible.CheckBox
                Accessible.name: "Required"
                onCheckedChanged: {
                    if (root.dropdown
                        && checked !== root.dropdown.required)
                        root.fieldChanged("required", checked)
                }
            }
            CText { variant: "body2"; text: "Required" }
        }

        Item { Layout.fillWidth: true }

        CBadge {
            text: (root.dropdown && root.dropdown.required
                ? "Required" : "Optional")
            accent: root.dropdown ? root.dropdown.required : false
        }
        CBadge {
            text: (root.dropdown && root.dropdown.allowCustom
                ? "Custom allowed" : "Fixed options")
        }
    }
}
