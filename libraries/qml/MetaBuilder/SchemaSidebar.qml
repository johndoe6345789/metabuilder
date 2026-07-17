import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property var schemas: []
    property int selectedIndex: 0

    signal itemClicked(int index)

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 10

        CText { variant: "subtitle1"; text: "Schemas" }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.schemas
            spacing: 4
            clip: true
            delegate: CListItem {
                width: parent ? parent.width : 200
                title: modelData.name
                subtitle: modelData.fields.length + " fields"
                selected: index === root.selectedIndex
                leadingIcon: "schema"
                onClicked: root.itemClicked(index)
            }
        }

        CDivider { Layout.fillWidth: true }

        CText {
            variant: "caption"
            text: (root.schemas || []).length + " schemas total"
            color: Theme.border
        }
    }
}
