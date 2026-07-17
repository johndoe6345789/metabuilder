import QtQuick
import QtQuick.Controls

Rectangle {
    id: root
    height: 36; color: "#161b22"

    required property var model
    property int currentIndex: -1

    signal tabSelected(int index)
    signal tabClosed(int index)
    signal tabPinToggled(int index)
    signal tabReordered(int from, int to)
    signal newAudioRequested()
    signal newVideoRequested()
    signal newStreamRequested()

    Rectangle {
        anchors { bottom: parent.bottom; left: parent.left; right: parent.right }
        height: 1; color: "#30363d"
    }

    ListView {
        id: tabList
        orientation: Qt.Horizontal
        anchors { left: parent.left; leftMargin: 4
                  top: parent.top; topMargin: 2; bottom: parent.bottom }
        width: Math.min(parent.width - plusBtn.width - 16,
                        contentWidth + 4)
        interactive: false; clip: true; spacing: 2

        moveDisplaced: Transition {
            NumberAnimation { properties: "x"; duration: 130
                easing.type: Easing.OutQuad }
        }

        model: root.model

        delegate: Item {
            id: dg
            required property var   model
            required property int   index
            property int  _lastIdx: dg.index
            width: tab.implicitWidth; height: tabList.height
            z: dragger.active ? 2 : 0

            TabItem {
                id: tab; anchors.fill: parent
                fileName: dg.model.fileName
                tabType:  dg.model.tabType
                isActive: dg.index === root.currentIndex
                pinned:   dg.model.pinned
                onClicked:      root.tabSelected(dg.index)
                onCloseClicked: root.tabClosed(dg.index)
                onPinToggled:   root.tabPinToggled(dg.index)
            }

            DragHandler {
                id: dragger
                xAxis.enabled: true; yAxis.enabled: false
                target: null
                grabPermissions:
                    PointerHandler.CanTakeOverFromItems |
                    PointerHandler.CanTakeOverFromHandlersOfDifferentType
                dragThreshold: 8

                onActiveChanged: if (!active) dg._lastIdx = dg.index

                onCentroidChanged: {
                    if (!active || dg.model.pinned) return
                    var lx = tabList.mapFromScene(
                        centroid.scenePosition).x + tabList.contentX
                    var ni = tabList.indexAt(lx, tabList.height / 2)
                    if (ni < 0) ni = root.model.count - 1
                    ni = Math.max(0, Math.min(ni, root.model.count - 1))
                    if (ni !== dg._lastIdx) {
                        root.model.move(dg._lastIdx, ni, 1)
                        root.tabReordered(dg._lastIdx, ni)
                        dg._lastIdx = ni
                    }
                }
            }
        }
    }

    Rectangle {
        id: plusBtn
        anchors { left: tabList.right; leftMargin: 4
                  verticalCenter: parent.verticalCenter }
        width: 28; height: 28; radius: 4
        color: plusHov.hovered ? "#1c2128" : "transparent"
        Text { anchors.centerIn: parent; text: "+"
            color: "#8b949e"; font.pixelSize: 18 }
        HoverHandler { id: plusHov }
        TapHandler { onTapped: {
            dropDown.x = plusBtn.x; dropDown.y = root.height
            dropDown.open()
        }}
    }

    Popup {
        id: dropDown; padding: 6; width: 210
        closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
        background: Rectangle { color: "#1c2128"; radius: 8
            border.color: "#30363d"; border.width: 1 }

        Column {
            width: parent.width; spacing: 2

            component DropItem : Rectangle {
                id: di
                property string icon: ""
                property string label: ""
                property color  iconColor: "#e6edf3"
                signal chosen()
                width: dropDown.width - 12; height: 36; radius: 6
                color: dih.hovered ? "#2d333b" : "transparent"
                Row {
                    anchors.left: parent.left; anchors.leftMargin: 10
                    anchors.verticalCenter: parent.verticalCenter
                    spacing: 8
                    Text { text: di.icon; color: di.iconColor
                        font.pixelSize: 14
                        anchors.verticalCenter: parent.verticalCenter }
                    Text { text: di.label; color: "#e6edf3"; font.pixelSize: 13
                        anchors.verticalCenter: parent.verticalCenter }
                }
                HoverHandler { id: dih }
                TapHandler { onTapped: { dropDown.close(); di.chosen() } }
            }

            DropItem { icon: "♪"; label: "Open Audio File…  Ctrl+1"
                onChosen: root.newAudioRequested() }
            DropItem { icon: "▶"; label: "Open Video File…  Ctrl+2"
                onChosen: root.newVideoRequested() }
            Rectangle { width: parent.width; height: 1; color: "#30363d" }
            DropItem { icon: "↑"; label: "New Stream Tab…  Ctrl+3"
                iconColor: "#f97316"; onChosen: root.newStreamRequested() }
        }
    }
}
