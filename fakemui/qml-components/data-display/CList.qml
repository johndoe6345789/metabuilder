import QtQuick 2.15
import QtQuick.Controls 2.15

ListView {
    id: list
    model: []
    delegate: Item { width: list.width; height: 40 }
}
