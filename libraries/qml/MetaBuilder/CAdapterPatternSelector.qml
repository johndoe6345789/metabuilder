import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    objectName: "selector_adapter_pattern"
    Accessible.role: Accessible.Pane
    Accessible.name: "Multi-Adapter Pattern"
    Layout.fillWidth: true
    spacing: 12

    property int selectedPattern: 0
    property var patterns: [
        "read-through", "write-through",
        "cache-aside", "dual-write"
    ]

    property var descriptions: [
        "Read-through: Reads check cache "
        + "first. On miss, the cache fetches "
        + "from the primary DB, stores the "
        + "result, and returns it. Best for "
        + "read-heavy workloads.",
        "Write-through: Every write goes to "
        + "both cache and primary DB "
        + "synchronously. Guarantees "
        + "consistency at the cost of write "
        + "latency.",
        "Cache-aside: Application manages "
        + "cache explicitly. Reads check "
        + "cache, fetch from DB on miss and "
        + "populate cache. Writes go directly "
        + "to DB and invalidate cache.",
        "Dual-write: Writes are sent to two "
        + "backends simultaneously (e.g., "
        + "primary DB + search index). "
        + "Requires conflict resolution "
        + "strategy."
    ]

    signal patternChanged(int index)

    CText {
        variant: "subtitle1"
        text: "Multi-Adapter Pattern"
    }
    CText {
        variant: "body2"
        text: "Select how the primary, "
            + "cache, and search adapters "
            + "coordinate data flow."
    }

    FlexRow {
        Layout.fillWidth: true
        spacing: 8

        Repeater {
            model: root.patterns
            delegate: CButton {
                text: modelData
                variant: index
                    === root.selectedPattern
                    ? "primary" : "ghost"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name:
                    modelData + " pattern"
                Accessible.description:
                    index === root.selectedPattern
                    ? "Selected"
                    : "Select " + modelData + " pattern"
                Keys.onReturnPressed:
                    root.patternChanged(index)
                Keys.onSpacePressed:
                    root.patternChanged(index)
                onClicked:
                    root.patternChanged(index)
            }
        }
    }

    CPaper {
        Layout.fillWidth: true
        implicitHeight:
            patternDesc.implicitHeight + 24

        CText {
            id: patternDesc
            anchors.fill: parent
            anchors.margins: 12
            variant: "body2"
            wrapMode: Text.Wrap
            Accessible.role: Accessible.StaticText
            Accessible.name: root.patterns[
                root.selectedPattern]
                + " pattern description"
            text: root.descriptions[
                root.selectedPattern]
        }
    }
}
