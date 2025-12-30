import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: dataGrid
    
    property var rows: []
    property var columns: []
    property int pageSize: 10
    property var rowsPerPageOptions: [5, 10, 25, 50]
    property bool pagination: true
    property bool checkboxSelection: false
    property bool disableSelectionOnClick: false
    property string density: "standard" // compact, standard, comfortable
    property bool loading: false
    property string error: ""
    
    property var selectedIds: []
    property string sortField: ""
    property string sortDirection: "asc"
    property int currentPage: 0
    
    signal selectionChanged(var selectedIds)
    signal sortChanged(string field, string direction)
    signal rowClicked(var row)
    signal cellClicked(string field, var value)
    signal pageChanged(int page)
    
    implicitWidth: parent ? parent.width : 600
    implicitHeight: contentColumn.implicitHeight
    
    property int rowHeight: {
        switch(density) {
            case "compact": return 36
            case "comfortable": return 64
            default: return 52
        }
    }
    
    // Sort and paginate rows
    property var sortedRows: {
        var result = rows.slice()
        if (sortField) {
            result.sort(function(a, b) {
                var aVal = a[sortField]
                var bVal = b[sortField]
                if (aVal === bVal) return 0
                if (aVal === null || aVal === undefined) return 1
                if (bVal === null || bVal === undefined) return -1
                var cmp = aVal < bVal ? -1 : 1
                return sortDirection === "desc" ? -cmp : cmp
            })
        }
        return result
    }
    
    property var paginatedRows: {
        if (!pagination) return sortedRows
        var start = currentPage * pageSize
        return sortedRows.slice(start, start + pageSize)
    }
    
    property int totalPages: Math.ceil(rows.length / pageSize)
    
    function getRowId(row) {
        return row.id !== undefined ? row.id : rows.indexOf(row)
    }
    
    function toggleSelection(rowId) {
        var idx = selectedIds.indexOf(rowId)
        if (idx !== -1) {
            selectedIds.splice(idx, 1)
        } else {
            selectedIds.push(rowId)
        }
        selectedIds = selectedIds.slice()
        selectionChanged(selectedIds)
    }
    
    function selectAll(select) {
        if (select) {
            selectedIds = rows.map(getRowId)
        } else {
            selectedIds = []
        }
        selectionChanged(selectedIds)
    }
    
    function handleSort(field) {
        if (sortField === field) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc"
        } else {
            sortField = field
            sortDirection = "asc"
        }
        sortChanged(sortField, sortDirection)
    }
    
    ColumnLayout {
        id: contentColumn
        anchors.fill: parent
        spacing: 0
        
        // Header
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 48
            color: "#fafafa"
            
            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 8
                anchors.rightMargin: 8
                spacing: 0
                
                // Checkbox column header
                CheckBox {
                    visible: dataGrid.checkboxSelection
                    Layout.preferredWidth: 48
                    checked: selectedIds.length === rows.length && rows.length > 0
                    onClicked: selectAll(checked)
                }
                
                // Column headers
                Repeater {
                    model: dataGrid.columns
                    
                    Item {
                        Layout.fillWidth: modelData.flex ? true : false
                        Layout.preferredWidth: modelData.width || 100
                        Layout.fillHeight: true
                        
                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 8
                            spacing: 4
                            
                            Text {
                                text: modelData.headerName || modelData.field
                                font.pixelSize: 14
                                font.weight: Font.Medium
                                color: "#1a1a1a"
                            }
                            
                            Text {
                                visible: dataGrid.sortField === modelData.field
                                text: dataGrid.sortDirection === "asc" ? "↑" : "↓"
                                font.pixelSize: 12
                                color: "#666666"
                            }
                        }
                        
                        MouseArea {
                            anchors.fill: parent
                            cursorShape: modelData.sortable !== false ? Qt.PointingHandCursor : Qt.ArrowCursor
                            onClicked: {
                                if (modelData.sortable !== false) {
                                    dataGrid.handleSort(modelData.field)
                                }
                            }
                        }
                        
                        Rectangle {
                            anchors.right: parent.right
                            anchors.top: parent.top
                            anchors.bottom: parent.bottom
                            width: 1
                            color: "#e0e0e0"
                        }
                    }
                }
            }
            
            Rectangle {
                anchors.bottom: parent.bottom
                width: parent.width
                height: 1
                color: "#e0e0e0"
            }
        }
        
        // Body
        Item {
            Layout.fillWidth: true
            Layout.fillHeight: true
            Layout.minimumHeight: Math.min(paginatedRows.length, 5) * rowHeight
            
            // Loading overlay
            Rectangle {
                anchors.fill: parent
                color: Qt.rgba(1, 1, 1, 0.8)
                visible: dataGrid.loading
                z: 10
                
                BusyIndicator {
                    anchors.centerIn: parent
                    running: dataGrid.loading
                }
            }
            
            // Error overlay
            Rectangle {
                anchors.fill: parent
                color: "#fff"
                visible: dataGrid.error && !dataGrid.loading
                
                Text {
                    anchors.centerIn: parent
                    text: dataGrid.error
                    color: "#d32f2f"
                    font.pixelSize: 14
                }
            }
            
            // No rows
            Rectangle {
                anchors.fill: parent
                color: "#fff"
                visible: paginatedRows.length === 0 && !dataGrid.loading && !dataGrid.error
                
                Text {
                    anchors.centerIn: parent
                    text: "No rows"
                    color: "#9e9e9e"
                    font.pixelSize: 14
                }
            }
            
            // Data rows
            ListView {
                anchors.fill: parent
                model: dataGrid.paginatedRows
                clip: true
                
                delegate: Rectangle {
                    width: ListView.view.width
                    height: dataGrid.rowHeight
                    color: {
                        var rowId = dataGrid.getRowId(modelData)
                        if (dataGrid.selectedIds.indexOf(rowId) !== -1) {
                            return Qt.rgba(0.1, 0.46, 0.82, 0.08)
                        }
                        return index % 2 === 0 ? "#ffffff" : "#fafafa"
                    }
                    
                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 8
                        anchors.rightMargin: 8
                        spacing: 0
                        
                        // Checkbox
                        CheckBox {
                            visible: dataGrid.checkboxSelection
                            Layout.preferredWidth: 48
                            checked: dataGrid.selectedIds.indexOf(dataGrid.getRowId(modelData)) !== -1
                            onClicked: dataGrid.toggleSelection(dataGrid.getRowId(modelData))
                        }
                        
                        // Cell values
                        Repeater {
                            model: dataGrid.columns
                            
                            Item {
                                Layout.fillWidth: modelData.flex ? true : false
                                Layout.preferredWidth: modelData.width || 100
                                Layout.fillHeight: true
                                
                                Text {
                                    anchors.fill: parent
                                    anchors.leftMargin: 8
                                    text: {
                                        var row = dataGrid.paginatedRows[index]
                                        var value = row ? row[modelData.field] : ""
                                        return value !== undefined && value !== null ? String(value) : ""
                                    }
                                    font.pixelSize: 14
                                    color: "#1a1a1a"
                                    elide: Text.ElideRight
                                    verticalAlignment: Text.AlignVCenter
                                }
                                
                                MouseArea {
                                    anchors.fill: parent
                                    onClicked: {
                                        var row = dataGrid.paginatedRows[index]
                                        dataGrid.cellClicked(modelData.field, row[modelData.field])
                                    }
                                }
                            }
                        }
                    }
                    
                    MouseArea {
                        anchors.fill: parent
                        z: -1
                        onClicked: {
                            dataGrid.rowClicked(modelData)
                            if (!dataGrid.disableSelectionOnClick && dataGrid.checkboxSelection) {
                                dataGrid.toggleSelection(dataGrid.getRowId(modelData))
                            }
                        }
                    }
                    
                    Rectangle {
                        anchors.bottom: parent.bottom
                        width: parent.width
                        height: 1
                        color: "#e0e0e0"
                    }
                }
            }
        }
        
        // Footer with pagination
        Rectangle {
            visible: dataGrid.pagination
            Layout.fillWidth: true
            Layout.preferredHeight: 52
            color: "#fafafa"
            
            Rectangle {
                anchors.top: parent.top
                width: parent.width
                height: 1
                color: "#e0e0e0"
            }
            
            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 16
                anchors.rightMargin: 16
                spacing: 16
                
                Text {
                    text: "Rows per page:"
                    font.pixelSize: 14
                    color: "#666666"
                }
                
                ComboBox {
                    model: dataGrid.rowsPerPageOptions
                    currentIndex: rowsPerPageOptions.indexOf(pageSize)
                    implicitWidth: 70
                    onCurrentIndexChanged: {
                        dataGrid.pageSize = rowsPerPageOptions[currentIndex]
                        dataGrid.currentPage = 0
                    }
                }
                
                Item { Layout.fillWidth: true }
                
                Text {
                    text: {
                        var start = currentPage * pageSize + 1
                        var end = Math.min((currentPage + 1) * pageSize, rows.length)
                        return start + "–" + end + " of " + rows.length
                    }
                    font.pixelSize: 14
                    color: "#666666"
                }
                
                Button {
                    text: "‹"
                    implicitWidth: 32
                    implicitHeight: 32
                    enabled: currentPage > 0
                    onClicked: {
                        currentPage--
                        pageChanged(currentPage)
                    }
                }
                
                Button {
                    text: "›"
                    implicitWidth: 32
                    implicitHeight: 32
                    enabled: currentPage < totalPages - 1
                    onClicked: {
                        currentPage++
                        pageChanged(currentPage)
                    }
                }
            }
        }
    }
    
    Rectangle {
        anchors.fill: parent
        color: "transparent"
        border.width: 1
        border.color: "#e0e0e0"
        radius: 4
    }
}
