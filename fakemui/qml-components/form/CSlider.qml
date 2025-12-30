import QtQuick
import QtQuick.Controls

Slider {
    id: slider
    from: 0
    to: 100
    stepSize: 1
    property alias value: slider.value
    Layout.preferredWidth: 160
}
