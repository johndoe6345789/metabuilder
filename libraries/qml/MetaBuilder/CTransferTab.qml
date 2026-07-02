import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"

    property var pendingTransfers: []
    property var transferHistory: []

    signal transferSubmitted(
        string from, string to,
        string reason, string expiry)
    signal transferApproved(int index)
    signal transferDenied(int index)

    property bool showForm: false

    ScrollView {
        anchors.fill: parent
        clip: true
        ColumnLayout {
            width: parent.width
            spacing: 16

            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                CText { variant: "h3"; text: "Power Transfer" }
                Item { Layout.fillWidth: true }
                CButton {
                    text: root.showForm ? "Cancel" : "Initiate Transfer"
                    variant: root.showForm ? "ghost" : "primary"; size: "sm"
                    onClicked: root.showForm = !root.showForm
                }
            }

            CText {
                variant: "body2"
                text: "Transfer elevated privileges"
                    + " between god-level users."
                    + " All transfers require"
                    + " approval and are logged"
                    + " for audit."
                wrapMode: Text.Wrap
                Layout.fillWidth: true
                color: Theme.textSecondary
            }

            CTransferForm {
                visible: root.showForm
                onSubmitted: function(from, to, reason, expiry) {
                    root.transferSubmitted(
                        from, to, reason, expiry)
                    root.showForm = false
                }
            }

            CDivider { Layout.fillWidth: true }

            CText {
                variant: "h4"
                text: "Pending Transfers ("
                    + root.pendingTransfers.length
                    + ")"
            }

            Repeater {
                model: root.pendingTransfers
                delegate: CTransferCard {
                    required property var modelData
                    required property int index
                    transfer: modelData
                    onApprove: root.transferApproved(index)
                    onDeny: root.transferDenied(index)
                }
            }

            CAlert {
                severity: "info"
                text: "No pending transfers."
                visible: {
                    return root.pendingTransfers
                        .length === 0
                }
            }

            CDivider { Layout.fillWidth: true }

            CText { variant: "h4"; text: "Transfer History" }

            Repeater {
                model: root.transferHistory
                delegate: CCard {
                    Layout.fillWidth: true; variant: "outlined"
                    RowLayout {
                        Layout.fillWidth: true; spacing: 16
                        ColumnLayout {
                            spacing: 4; Layout.fillWidth: true
                            FlexRow {
                                spacing: 8
                                CText {
                                    variant: "subtitle1"
                                    text: modelData.from
                                        + " -> "
                                        + modelData.to
                                }
                                CStatusBadge {
                                    status: modelData.status
                                        === "approved"
                                        ? "success"
                                        : "error"
                                    text: modelData.status
                                }
                            }
                            CText {
                                variant: "body2"
                                text: modelData.reason
                                wrapMode: Text.Wrap
                                Layout.fillWidth: true
                            }
                        }
                        CText {
                            variant: "caption"
                            text: modelData.date
                            color: Theme.textSecondary
                        }
                    }
                }
            }
        }
    }
}
