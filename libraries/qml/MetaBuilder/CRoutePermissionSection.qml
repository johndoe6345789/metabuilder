import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root

    property string permissions: ""
    property int level: 1

    signal permissionsEdited(string value)

    Layout.fillWidth: true
    spacing: 14

    CDivider { Layout.fillWidth: true }

    CText { variant: "caption"; text: "Permission Rules" }
    CTextField {
        Layout.fillWidth: true
        text: root.permissions
        onTextChanged: {
            if (text !== root.permissions)
                root.permissionsChanged(text)
        }
    }

    CAlert {
        Layout.fillWidth: true
        severity: root.level >= 4 ? "warning" : "info"
        text: root.level >= 4
              ? "High privilege route (level " + root.level + ")"
              : "Standard access route"
    }
}
