import QtQuick
import QtQuick.Controls

/**
 * CSelect.qml - simple select (ComboBox wrapper)
 */
ComboBox {
    id: root
    model: []
    property alias currentIndex: root.currentIndex
    property alias currentText: root.currentText
    Layout.preferredWidth: 200
}
