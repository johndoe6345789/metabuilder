import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: sidebarRoot
    Layout.preferredWidth: 260
    Layout.fillHeight: true

    property var componentList: []
    property string selectedComponent: "Button"
    property bool outlinedMode: false
    property bool showSnackbar: true

    signal componentSelected(string name)
    signal outlinedModeChanged(bool value)
    signal showSnackbarChanged(bool value)

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 18
        spacing: 12

        CText { variant: "h4"; text: "Components" }

        ListView {
            Layout.fillHeight: true
            Layout.fillWidth: true
            model: sidebarRoot.componentList
            spacing: 4
            delegate: CListItem {
                width: parent ? parent.width : 220
                title: modelData.name
                subtitle: modelData.desc
                selected: sidebarRoot.selectedComponent === modelData.name
                onClicked: sidebarRoot.componentSelected(modelData.name)
            }
        }

        CDivider { Layout.fillWidth: true }

        ColumnLayout {
            spacing: 8
            CText { variant: "caption"; text: "Playground knobs" }
            CSwitch {
                text: "Outlined mode"
                checked: sidebarRoot.outlinedMode
                onCheckedChanged: sidebarRoot.outlinedModeChanged(checked)
            }
            CSwitch {
                text: "Show snackbar"
                checked: sidebarRoot.showSnackbar
                onCheckedChanged: sidebarRoot.showSnackbarChanged(checked)
            }
        }
    }
}
