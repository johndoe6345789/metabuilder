import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CEntityForm.qml - Create/edit entity form dialog
 *
 * Usage:
 *   CEntityForm {
 *       visible: createDialogOpen
 *       entity: "User"
 *       fields: [{ field: "username", label: "Username" }, ...]
 *       isEdit: false
 *       editId: ""
 *       onSave: function(data) { addRecord(data) }
 *       onCancel: createDialogOpen = false
 *   }
 */
CDialog {
    id: root

    property string entity: ""     // Entity type name (e.g. "User")
    property var fields: []        // Array of { field, label, value? }
    property bool isEdit: false
    property string editId: ""     // ID of record being edited (display only)
    property bool isDark: Theme.mode === "dark"

    signal save(var data)
    signal cancel()

    title: (isEdit ? "Edit " : "Create ") + entity
        + (isEdit && editId ? " - " + editId : "")

    // Internal form data store
    property var _formData: ({})

    function _setField(key, val) {
        var d = Object.assign({}, _formData);
        d[key] = val;
        _formData = d;
    }

    function _resetForm() {
        var d = {};
        for (var i = 0; i < fields.length; i++) {
            d[fields[i].field] = fields[i].value || "";
        }
        _formData = d;
    }

    onVisibleChanged: {
        if (visible) _resetForm();
    }

    ColumnLayout {
        width: 400
        spacing: 12

        // Show ID in edit mode
        Loader {
            Layout.fillWidth: true
            active: root.isEdit && root.editId.length > 0
            sourceComponent: CText {
                variant: "caption"
                text: "ID: " + root.editId
                color: Theme.textSecondary
            }
        }

        Repeater {
            model: root.fields

            delegate: CTextField {
                Layout.fillWidth: true
                label: modelData.label
                text: modelData.value || ""
                placeholderText: "Enter "
                    + modelData.label.toLowerCase()
                    + "..."
                onTextChanged: root._setField(modelData.field, text)
            }
        }

        FlexRow {
            Layout.fillWidth: true
            Layout.topMargin: 8
            spacing: 8
            Item { Layout.fillWidth: true }
            CButton {
                text: "Cancel"
                variant: "ghost"
                size: "sm"
                onClicked: root.cancel()
            }
            CButton {
                text: root.isEdit ? "Save" : "Create"
                variant: "primary"
                size: "sm"
                onClicked: {
                    var data = Object.assign({}, root._formData);
                    // Fill in any fields not yet touched
                    for (var i = 0; i < root.fields.length; i++) {
                        var f = root.fields[i];
                        if (data[f.field] === undefined
                            || data[f.field] === "") {
                            data[f.field] = f.value || "";
                        }
                    }
                    root.save(data);
                }
            }
        }
    }
}
