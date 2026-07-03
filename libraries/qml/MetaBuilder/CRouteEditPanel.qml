import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property var route: null
    property var layoutOptions: ["default", "sidebar", "dashboard", "blank"]
    property var levelOptions: [1, 2, 3, 4, 5]

    signal fieldChanged(string field, var value)
    signal deleteRequested()

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 14

        CText { variant: "h4"; text: "Edit Route" }
        CDivider { Layout.fillWidth: true }

        CText { variant: "caption"; text: "Path" }
        CTextField {
            Layout.fillWidth: true
            text: root.route ? root.route.path : ""
            onTextChanged: {
                if (root.route && text !== root.route.path)
                    root.fieldChanged("path", text)
            }
        }

        CText { variant: "caption"; text: "Page Title" }
        CTextField {
            Layout.fillWidth: true
            text: root.route ? root.route.title : ""
            onTextChanged: {
                if (root.route && text !== root.route.title)
                    root.fieldChanged("title", text)
            }
        }

        CText { variant: "caption"; text: "Required Level (1-5)" }
        CSelect {
            Layout.fillWidth: true
            model: levelOptions
            currentIndex: root.route ? root.route.level - 1 : 0
            onCurrentIndexChanged: if (root.route && currentIndex + 1 !==
                root.route.level) root.fieldChanged("level", currentIndex + 1)
        }

        CText { variant: "caption"; text: "Layout Type" }
        CSelect {
            Layout.fillWidth: true
            model: layoutOptions
            currentIndex: root.route
                ? layoutOptions.indexOf(root.route.layout) : 0
            onCurrentIndexChanged: if (root.route &&
                layoutOptions[currentIndex] !== root.route.layout)
                    root.fieldChanged("layout", layoutOptions[currentIndex])
        }

        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CText { variant: "body2"; text: "Enabled" }
            Item { Layout.fillWidth: true }
            CSwitch {
                checked: root.route ? root.route.enabled : false
                onCheckedChanged: {
                    if (root.route && checked !== root.route.enabled)
                        root.fieldChanged("enabled", checked)
                }
            }
        }

        CRoutePermissionSection {
            permissions: root.route ? root.route.permissions : ""
            level: root.route ? root.route.level : 1
            onPermissionsEdited: function(
                value) { root.fieldChanged("permissions", value) }
        }

        Item { Layout.fillHeight: true }

        CButton {
            text: "Delete Route"
            variant: "danger"
            size: "sm"
            Layout.fillWidth: true
            onClicked: root.deleteRequested()
        }
    }
}
