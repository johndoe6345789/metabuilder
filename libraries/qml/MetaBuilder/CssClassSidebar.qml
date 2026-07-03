import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property var cssClasses: []
    property int selectedIndex: 0

    signal itemClicked(int index)

    function swatchColor(properties) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].prop === "background-color")
                return properties[i].value
        }
        for (var j = 0; j < properties.length; j++) {
            if (properties[j].prop === "color")
                return properties[j].value
        }
        return Theme.surface
    }

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 10

        CText { variant: "h4"; text: "Classes" }

        ListView {
            id: classListView
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.cssClasses
            spacing: 4
            clip: true

            delegate: CListItem {
                width: classListView.width
                title: modelData.name
                subtitle: modelData.properties.length + " properties"
                selected: index === root.selectedIndex

                Row {
                    anchors.right: parent.right
                    anchors.rightMargin: 12
                    anchors.verticalCenter: parent.verticalCenter
                    spacing: 8

                    Rectangle {
                        width: 16; height: 16
                        radius: 3
                        color: swatchColor(modelData.properties)
                        border.color: Theme.border
                        border.width: 1
                    }

                    CBadge { text: modelData.usageCount.toString() }
                }

                onClicked: root.itemClicked(index)
            }
        }
    }
}
