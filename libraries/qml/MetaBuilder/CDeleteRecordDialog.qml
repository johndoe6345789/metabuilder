import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CDialog {
    id: deleteRecordDialog
    objectName: "dialog_delete_record"
    title: "Delete " + entity

    property string entity: ""
    property string recordId: ""
    property bool useLiveData: false

    signal confirmed()
    signal cancelled()

    ColumnLayout {
        width: 360; spacing: 16
        CAlert { Layout.fillWidth: true; severity: "warning"
        text: "This action cannot be undone." }
        CText {
            Layout.fillWidth: true; variant: "body1"
            text: recordId
                ? "Are you sure you want to delete record " + recordId + "?"
                : "Delete this record?"
        }
        FlexRow {
            Layout.fillWidth: true; Layout.topMargin: 8; spacing: 8
            Item { Layout.fillWidth: true }
            CButton {
                text: "Cancel"
                variant: "ghost"
                size: "sm"
                Accessible.role: Accessible.Button
                Accessible.name: "Cancel"
                Keys.onReturnPressed: cancelled()
                Keys.onSpacePressed: cancelled()
                onClicked: cancelled()
            }
            CButton {
                text: "Delete"
                variant: "danger"
                size: "sm"
                Accessible.role: Accessible.Button
                Accessible.name: "Confirm delete"
                Accessible.description:
                    "Permanently delete record " +
                    recordId
                Keys.onReturnPressed: confirmed()
                Keys.onSpacePressed: confirmed()
                onClicked: confirmed()
            }
        }
    }
}
