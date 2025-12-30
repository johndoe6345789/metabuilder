import QtQuick 2.15
import QtQuick.Controls 2.15

Row {
    id: root
    property int pageCount: 1
    property int currentPage: 0
    spacing: 6
    Repeater {
        model: root.pageCount
        delegate: Button {
            text: (index+1).toString()
            onClicked: root.currentPage = index
        }
    }
}
