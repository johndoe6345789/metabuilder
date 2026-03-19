import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CPaper {
    id: root

    Layout.fillWidth: true
    implicitHeight: 60

    property string label: ""
    property string value: ""
    property string valueVariant: "h4"

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 2

        CText { variant: "caption"; text: root.label }
        CText {
            variant: root.valueVariant
            text: root.value
            elide: Text.ElideRight
            Layout.fillWidth: true
        }
    }
}
