import QtQuick
import QtQuick.Controls

ListView {
    id: list
    model: []
    delegate: Item { width: list.width; height: 40 }
}
