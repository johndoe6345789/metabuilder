import QtQuick
import QtQuick.Controls
import QmlComponents 1.0

/**
 * CPaper.qml - Material Design 3 surface container
 *
 * A simple themed rectangle that provides a paper-like background.
 * Serves as the base surface for dialogs, drawers, side-panels, etc.
 */
Rectangle {
    id: paper

    property int elevation: 0

    color: Theme.paper
    radius: 12
    border.width: 0
    border.color: "transparent"

    Behavior on color {
        ColorAnimation { duration: StyleVariables.transitionFast } }
}
