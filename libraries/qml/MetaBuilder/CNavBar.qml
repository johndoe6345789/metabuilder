import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

// Centered level navigation buttons for the app bar
Item {
    id: root
    Accessible.role: Accessible.MenuBar
    Accessible.name: "Level navigation"

    property string currentView: "frontpage"
    property int currentLevel: 1
    property var levels: [
        { label: "Home",   level: 1, view: "frontpage" },
        { label: "User",   level: 2, view: "dashboard" },
        { label: "Mod",    level: 3, view: "moderator" },
        { label: "Admin",  level: 4, view: "admin" },
        { label: "God",    level: 5, view: "god-panel" },
        { label: "Super",  level: 6, view: "supergod" }
    ]

    signal navigate(string view)

    implicitWidth: navRow.implicitWidth
    implicitHeight: navRow.implicitHeight

    RowLayout {
        id: navRow
        anchors.fill: parent
        spacing: 6

        Repeater {
            model: root.levels
            delegate: CButton {
                activeFocusOnTab: true
                Accessible.role: Accessible.Link
                Accessible.name: modelData.label
                Accessible.description:
                    "Navigate to "
                    + modelData.label + " view"
                visible:
                    modelData.level <= root.currentLevel
                text: modelData.label
                variant:
                    root.currentView === modelData.view
                    ? "default" : "text"
                size: "sm"
                Keys.onReturnPressed:
                    root.navigate(modelData.view)
                Keys.onSpacePressed:
                    root.navigate(modelData.view)
                onClicked: root.navigate(modelData.view)
            }
        }
    }
}
