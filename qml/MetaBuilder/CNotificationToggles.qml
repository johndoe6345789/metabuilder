import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CNotificationToggles - Data-driven notification preference toggles.
 *
 * model: JSON array of { id, title, description }
 * values: Object mapping id → bool (e.g. { emailNotifications: true })
 * Emits toggled(id, value) when any switch changes.
 */
ColumnLayout {
    id: root
    spacing: 0

    property var model: []
    property var values: ({})
    signal toggled(string id, bool value)

    Repeater {
        model: root.model

        delegate: ColumnLayout {
            Layout.fillWidth: true
            spacing: 0

            CDivider {
                Layout.fillWidth: true
                visible: index > 0
            }

            FlexRow {
                Layout.fillWidth: true
                Layout.topMargin: index === 0 ? 4 : 0
                spacing: 12

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 2
                    CText { variant: "subtitle2"; text: modelData.title }
                    CText { variant: "caption"; text: modelData.description
                    opacity: 0.6 }
                }

                CSwitch {
                    checked: root.values[modelData.id] || false
                    onToggled: function(value) {
                        root.toggled(modelData.id, value)
                    }
                }
            }
        }
    }
}
