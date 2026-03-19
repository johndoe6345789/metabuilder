import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CTablePagination.qml - Pagination controls with page info and prev/next
 // buttons
 *
 * Usage:
 *   CTablePagination {
 *       page: 0
 *       pageSize: 5
 *       totalFiltered: 24
 *       onPageChanged: function(newPage) { ... }
 *   }
 */
Rectangle {
    id: root

    property int page: 0
    property int pageSize: 5
    property int totalFiltered: 0

    signal pageRequested(int newPage)

    readonly property int _totalPages: Math.max(1,
        Math.ceil(totalFiltered / pageSize))

    Layout.fillWidth: true
    height: 48
    color: Theme.surfaceVariant
    radius: 0

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 16
        anchors.rightMargin: 16
        spacing: 8

        CText {
            variant: "caption"
            text: {
                var total = root.totalFiltered;
                if (total === 0) return "0 records";
                var start = root.page * root.pageSize + 1;
                var end = Math.min(start + root.pageSize - 1, total);
                return start + "-" + end + " of " + total + " records";
            }
            color: Theme.textSecondary
        }

        Item { Layout.fillWidth: true }

        CButton {
            text: "Previous"
            variant: "ghost"
            size: "sm"
            enabled: root.page > 0
            onClicked: root.pageRequested(root.page - 1)
        }

        CText {
            variant: "caption"
            text: "Page " + (root.page + 1) + " of " + root._totalPages
            color: Theme.textSecondary
        }

        CButton {
            text: "Next"
            variant: "ghost"
            size: "sm"
            enabled: root.page < root._totalPages - 1
            onClicked: root.pageRequested(root.page + 1)
        }
    }
}
