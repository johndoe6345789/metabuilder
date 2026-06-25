import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Item {
    id: root
    objectName: "container_admin_dialogs"
    Accessible.role: Accessible.Pane
    Accessible.name: "Admin Dialogs"

    property bool createDialogOpen: false
    property bool editDialogOpen: false
    property bool deleteDialogOpen: false
    property string selectedEntity: ""
    property var fields: []
    property bool isEditMode: false
    property string editId: ""
    property string deleteRecordId: ""
    property bool useLiveData: false

    signal createSaved(var data)
    signal editSaved(var data)
    signal createCancelled()
    signal editCancelled()
    signal deleteConfirmed()
    signal deleteCancelled()

    CEntityForm {
        visible: root.createDialogOpen; entity: root.selectedEntity
        fields: root.fields; isEdit: false
        onSave: function(data) { root.createSaved(data) }
        onCancel: root.createCancelled()
    }

    CEntityForm {
        visible: root.editDialogOpen; entity: root.selectedEntity
        fields: root.fields; isEdit: true; editId: root.editId
        onSave: function(data) { root.editSaved(data) }
        onCancel: root.editCancelled()
    }

    CDeleteRecordDialog {
        visible: root.deleteDialogOpen
        entity: root.selectedEntity
        recordId: root.deleteRecordId
        useLiveData: root.useLiveData
        onConfirmed: root.deleteConfirmed()
        onCancelled: root.deleteCancelled()
    }
}
