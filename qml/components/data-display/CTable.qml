import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CTable.qml - Material Design 3 data table
 * Surface container header, 48px rows, hover state layer, outlineVariant
 // borders
 *
 * Usage:
 *   CTable {
 *       headers: ["Name", "Email", "Role"]
 *       rows: [["Alice", "alice@co", "Admin"], ["Bob", "bob@co", "User"]]
 *       sortColumn: 0; sortAscending: true
 *   }
 */
Rectangle {
    id: root

    property var headers: []             // Array of header strings
    property var rows: []                // Array of row arrays
    property var columnWidths: []        // Optional column width ratios
    property bool striped: true
    property bool bordered: true

    // MD3 sort support
    // Column index currently sorted (-1 = none)
    property int sortColumn: -1
    property bool sortAscending: true
    signal headerClicked(int columnIndex)

    Accessible.role: Accessible.Table

    color: "transparent"
    radius: StyleVariables.radiusSm
    border.width: bordered ? 1 : 0
    border.color: Theme.border

    implicitWidth: parent ? parent.width : 400
    implicitHeight: tableCol.implicitHeight

    clip: true

    ColumnLayout {
        id: tableCol
        anchors.fill: parent
        spacing: 0

        // Header row - MD3 surfaceContainer background
        Rectangle {
            Layout.fillWidth: true
            implicitHeight: 48
            color: Theme.mode === "dark"
                ? Qt.rgba(1, 1, 1, 0.08)
                : Qt.rgba(0, 0, 0, 0.04)

            RowLayout {
                id: headerRow
                anchors.fill: parent
                spacing: 0

                Repeater {
                    model: root.headers

                    Item {
                        Layout.fillWidth: root.columnWidths.length === 0
                        Layout.preferredWidth: root.columnWidths.length > index
                            ? root.columnWidths[index] : -1
                        implicitHeight: 48

                        // MD3 header cell content
                        Row {
                            anchors.verticalCenter: parent.verticalCenter
                            anchors.left: parent.left
                            anchors.right: parent.right
                            anchors.leftMargin: 16
                            anchors.rightMargin: 16
                            spacing: 4

                            Text {
                                text: modelData
                                color: Theme.textSecondary
                                font.pixelSize: 14
                                font.weight: Font.DemiBold
                                font.family: Theme.fontFamily
                                elide: Text.ElideRight
                                anchors.verticalCenter: parent.verticalCenter
                            }

                            // Sort indicator arrow
                            Text {
                                visible: root.sortColumn === index
                                text: root.sortAscending ? "\u25B2" : "\u25BC"
                                color: Theme.textSecondary
                                font.pixelSize: 10
                                anchors.verticalCenter: parent.verticalCenter
                            }
                        }

                        // Clickable area for sorting
                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: root.headerClicked(index)
                        }

                        // Column separator
                        Rectangle {
                            visible: root.bordered && index > 0
                            width: 1
                            height: parent.height
                            anchors.left: parent.left
                            color: Theme.border
                        }
                    }
                }
            }
        }

        // Bottom border under header
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: Theme.border
        }

        // Data rows
        Repeater {
            model: root.rows

            Rectangle {
                id: rowDelegate
                Layout.fillWidth: true
                implicitHeight: 48

                Accessible.role: Accessible.Row

                property bool hovered: rowMouse.containsMouse

                // MD3: alternating tint + hover state layer (4%)
                color: {
                    if (hovered)
                        return Theme.mode === "dark"
                            ? Qt.rgba(1, 1, 1, 0.04)
                            : Qt.rgba(0, 0, 0, 0.04)
                    if (root.striped && index % 2 === 1)
                        return Theme.mode === "dark"
                            ? Qt.rgba(1, 1, 1, 0.02)
                            : Qt.rgba(0, 0, 0, 0.02)
                    return "transparent"
                }

                MouseArea {
                    id: rowMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    acceptedButtons: Qt.NoButton
                }

                // Row border (outlineVariant between rows)
                Rectangle {
                    width: parent.width
                    height: root.bordered ? 1 : 0
                    anchors.bottom: parent.bottom
                    color: Theme.border
                }

                RowLayout {
                    id: dataRow
                    anchors.fill: parent
                    spacing: 0

                    Repeater {
                        model: modelData

                        Item {
                            Layout.fillWidth: root.columnWidths.length === 0
                            Layout.preferredWidth: root.columnWidths.length >
                                index ? root.columnWidths[index] : -1
                            implicitHeight: 48

                            Text {
                                anchors.verticalCenter: parent.verticalCenter
                                anchors.left: parent.left
                                anchors.right: parent.right
                                anchors.leftMargin: 16
                                anchors.rightMargin: 16
                                text: modelData
                                color: Theme.text
                                font.pixelSize: 14
                                font.family: Theme.fontFamily
                                elide: Text.ElideRight
                                verticalAlignment: Text.AlignVCenter
                            }

                            // Column separator
                            Rectangle {
                                visible: root.bordered && index > 0
                                width: 1
                                height: parent.height
                                anchors.left: parent.left
                                color: Theme.border
                            }
                        }
                    }
                }
            }
        }
    }
}
