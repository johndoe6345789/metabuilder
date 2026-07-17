import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

RowLayout {
    signal addClicked()

    Label {
        text: "Files"
        font.bold: true
        font.pixelSize: 14
        color: "#e6edf3"
        Layout.fillWidth: true
    }

    Button {
        text: "+"
        implicitWidth: 32
        implicitHeight: 28
        onClicked: addClicked()
        contentItem: Text {
            text: parent.text
            color: "#e6edf3"
            horizontalAlignment:
                Text.AlignHCenter
            verticalAlignment:
                Text.AlignVCenter
        }
        background: Rectangle {
            color: "#7c3aed"
            radius: 4
        }
    }
}
