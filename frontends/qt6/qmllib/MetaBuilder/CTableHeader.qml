import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CTableHeader.qml - Column header row with select-all checkbox
 *
 * Usage:
 *   CTableHeader {
 *       headers: ["ID", "Username", "Email"]
 *       selectAll: false
 *       onSelectAllToggled: function(checked) { ... }
 *   }
 */
Rectangle {
    id: root

    property var headers: []
    property bool selectAll: false

    signal selectAllToggled(bool checked)

    Layout.fillWidth: true
    height: 44
    color: Theme.surfaceVariant
    radius: 0

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 12
        anchors.rightMargin: 12
        spacing: 0

        CheckBox {
            Layout.preferredWidth: 36
            checked: root.selectAll
            onCheckedChanged: {
                root.selectAllToggled(checked);
            }
        }

        Repeater {
            model: root.headers
            delegate: CText {
                Layout.fillWidth: index > 0
                Layout.preferredWidth: index === 0 ? 80 : -1
                variant: "subtitle2"
                text: modelData
            }
        }

        CText {
            Layout.preferredWidth: 110
            variant: "subtitle2"
            text: "Actions"
            horizontalAlignment: Text.AlignRight
        }
    }
}
