import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    Layout.fillWidth: true

    property string transferFrom: ""
    property string transferTo: ""
    property string transferReason: ""
    property string transferExpiry: ""

    signal submitted(string from, string to, string reason, string expiry)

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
                if (root.transferFrom &&
                    root.transferTo && root.transferReason) {
                    root.submitted(root.transferFrom, root.transferTo,
                        root.transferReason, root.transferExpiry || "No expiry")
                    root.transferFrom = ""; root.transferTo = ""
                    root.transferReason = ""; root.transferExpiry = ""
                }
            }
        }
    }
}
