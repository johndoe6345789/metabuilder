import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root

    property string currentCode: ""

    Layout.fillWidth: true
    spacing: 12

    CDivider { Layout.fillWidth: true }

    CText { variant: "h4"; text: "Info" }
    CText { variant: "caption"; text: "LINES OF CODE" }
    CText { variant: "body2"; text: currentCode.split("\n").length.toString() }
    CText { variant: "caption"; text: "SIZE" }
    CText { variant: "body2"
    text: (currentCode.length / 1024).toFixed(1) + " KB" }
}
