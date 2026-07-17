import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    Layout.preferredWidth: 280
    Layout.fillHeight: true

    property var templates: []
    property int selectedIndex: -1

    signal templateSelected(int index)

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 8

        CText { variant: "h4"; text: "Templates" }
        CText { variant: "caption"; text: root.templates.length + " templates" }
        CDivider { Layout.fillWidth: true }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            Layout.minimumHeight: 200
            model: root.templates
            spacing: 2
            clip: true

            delegate: CListItem {
                width: parent ? parent.width : 248
                title: modelData.name
                subtitle: modelData.id
                selected: root.selectedIndex === index
                onClicked: root.templateSelected(index)
            }
        }
    }
}
