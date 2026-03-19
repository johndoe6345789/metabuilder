import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"

    // ── Data ──
    property var pendingTransfers: []
    property var transferHistory: []

    // ── Signals ──
    signal transferSubmitted(string from, string to, string reason, string expiry)
    signal transferApproved(int index)
    signal transferDenied(int index)

    // ── Internal state ──
    property bool showForm: false
    property string transferFrom: ""
    property string transferTo: ""
    property string transferReason: ""
    property string transferExpiry: ""

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
                text: "Transfer elevated privileges between god-level users. All transfers require approval and are logged for audit."
                wrapMode: Text.Wrap; Layout.fillWidth: true; color: Theme.textSecondary
            }

            // ── Transfer form ──
            CCard {
                Layout.fillWidth: true
                visible: root.showForm

                CText { variant: "h4"; text: "New Transfer Request" }
                CDivider { Layout.fillWidth: true }

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 16
                    CTextField {
                        Layout.fillWidth: true; label: "From User"
                        placeholderText: "e.g. admin"; text: root.transferFrom
                        onTextChanged: root.transferFrom = text
                    }
                    CTextField {
                        Layout.fillWidth: true; label: "To User"
                        placeholderText: "e.g. devops"; text: root.transferTo
                        onTextChanged: root.transferTo = text
                    }
                }

                CTextField {
                    Layout.fillWidth: true; label: "Reason"
                    placeholderText: "Describe the reason for this transfer"
                    text: root.transferReason; onTextChanged: root.transferReason = text
                }

                CTextField {
                    Layout.fillWidth: true; label: "Expiry Date"
                    placeholderText: "YYYY-MM-DD"
                    text: root.transferExpiry; onTextChanged: root.transferExpiry = text
                }

                FlexRow {
                    Layout.fillWidth: true; spacing: 8
                    Item { Layout.fillWidth: true }
                    CButton {
                        text: "Submit Transfer"; variant: "primary"; size: "sm"
                        onClicked: {
                            if (root.transferFrom && root.transferTo && root.transferReason) {
                                root.transferSubmitted(root.transferFrom, root.transferTo, root.transferReason, root.transferExpiry || "No expiry");
                                root.transferFrom = ""; root.transferTo = ""; root.transferReason = ""; root.transferExpiry = "";
                                root.showForm = false;
                            }
                        }
                    }
                }
            }

            CDivider { Layout.fillWidth: true }

            // ── Pending transfers ──
            CText { variant: "h4"; text: "Pending Transfers (" + root.pendingTransfers.length + ")" }

            Repeater {
                model: root.pendingTransfers
                delegate: CTransferCard {
                    transfer: modelData
                    onApprove: root.transferApproved(index)
                    onDeny: root.transferDenied(index)
                }
            }

            CAlert { severity: "info"; text: "No pending transfers."; visible: root.pendingTransfers.length === 0 }

            CDivider { Layout.fillWidth: true }

            // ── Transfer history ──
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
                                CText { variant: "subtitle1"; text: modelData.from + " -> " + modelData.to }
                                CStatusBadge { status: modelData.status === "approved" ? "success" : "error"; text: modelData.status }
                            }
                            CText { variant: "body2"; text: modelData.reason; wrapMode: Text.Wrap; Layout.fillWidth: true }
                        }
                        CText { variant: "caption"; text: modelData.date; color: Theme.textSecondary }
                    }
                }
            }
        }
    }
}
