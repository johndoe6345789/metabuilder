import QtQuick

/**
 * CRadio.qml - radio control
 */
Item {
    id: root
    property bool checked: false
    property alias text: label.text
    signal toggled(bool checked)

    width: 160
    height: 28

    Row {
        anchors.fill: parent
        spacing: StyleVariables.spacingSm
        anchors.verticalCenter: parent.verticalCenter

        Canvas {
            id: circle
            width: 18; height: 18
            onPaint: {
                var ctx = getContext("2d");
                ctx.clearRect(0,0,width,height);
                ctx.beginPath();
                ctx.arc(width/2, height/2, 8, 0, 2*Math.PI);
                ctx.fillStyle = root.checked ? Theme.primary : Theme.surfaceVariant;
                ctx.fill();
                ctx.strokeStyle = Theme.divider;
                ctx.stroke();
                if (root.checked) {
                    ctx.beginPath(); ctx.arc(width/2, height/2, 4, 0, 2*Math.PI); ctx.fillStyle = Theme.onPrimary; ctx.fill();
                }
            }
            MouseArea { anchors.fill: parent; onClicked: { root.checked = true; root.toggled(true) } }
        }

        Text { id: label; text: "Option"; color: Theme.onSurface; font.pixelSize: StyleVariables.fontSizeSm }
    }
}
