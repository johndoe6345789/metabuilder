import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: datePicker
    
    property date value: new Date()
    property string label: ""
    property string format: "MM/dd/yyyy"
    property date minDate: new Date(1900, 0, 1)
    property date maxDate: new Date(2100, 11, 31)
    property bool disabled: false
    property bool readOnly: false
    property bool error: false
    property string helperText: ""
    property string placeholder: "Select date"
    property bool clearable: false
    
    signal dateChanged(date newDate)
    
    implicitWidth: 200
    implicitHeight: contentColumn.implicitHeight
    
    function formatDate(d) {
        if (!d || isNaN(d.getTime())) return ""
        var month = String(d.getMonth() + 1).padStart(2, '0')
        var day = String(d.getDate()).padStart(2, '0')
        var year = d.getFullYear()
        return format.replace("MM", month).replace("dd", day).replace("yyyy", year)
    }
    
    ColumnLayout {
        id: contentColumn
        anchors.fill: parent
        spacing: 4
        
        // Label
        Text {
            visible: datePicker.label
            text: datePicker.label
            font.pixelSize: 12
            color: datePicker.error ? "#d32f2f" : "#666666"
        }
        
        // Input container
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 40
            radius: 4
            color: datePicker.disabled ? "#f5f5f5" : "#ffffff"
            border.width: 1
            border.color: {
                if (datePicker.error) return "#d32f2f"
                if (inputMouse.containsMouse) return "#1976d2"
                return "#c4c4c4"
            }
            
            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 12
                anchors.rightMargin: 8
                spacing: 8
                
                Text {
                    Layout.fillWidth: true
                    text: formatDate(datePicker.value) || datePicker.placeholder
                    font.pixelSize: 14
                    color: formatDate(datePicker.value) ? "#1a1a1a" : "#9e9e9e"
                    elide: Text.ElideRight
                }
                
                // Clear button
                Text {
                    visible: datePicker.clearable && formatDate(datePicker.value)
                    text: "×"
                    font.pixelSize: 18
                    color: "#666666"
                    
                    MouseArea {
                        anchors.fill: parent
                        anchors.margins: -4
                        cursorShape: Qt.PointingHandCursor
                        onClicked: {
                            datePicker.value = new Date(NaN)
                            dateChanged(datePicker.value)
                        }
                    }
                }
                
                // Calendar icon
                Text {
                    text: "📅"
                    font.pixelSize: 16
                }
            }
            
            MouseArea {
                id: inputMouse
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                enabled: !datePicker.disabled && !datePicker.readOnly
                onClicked: calendarPopup.open()
            }
        }
        
        // Helper text
        Text {
            visible: datePicker.helperText
            text: datePicker.helperText
            font.pixelSize: 12
            color: datePicker.error ? "#d32f2f" : "#666666"
        }
    }
    
    // Calendar popup
    Popup {
        id: calendarPopup
        x: 0
        y: contentColumn.height + 4
        width: 280
        height: 300
        padding: 8
        
        background: Rectangle {
            color: "#ffffff"
            radius: 8
            border.width: 1
            border.color: "#e0e0e0"
            
            layer.enabled: true
            layer.effect: Item {
                // Shadow effect placeholder
            }
        }
        
        contentItem: ColumnLayout {
            spacing: 8
            
            // Header with month/year navigation
            RowLayout {
                Layout.fillWidth: true
                
                Button {
                    text: "‹"
                    implicitWidth: 32
                    implicitHeight: 32
                    flat: true
                    onClicked: {
                        var d = new Date(viewDate)
                        d.setMonth(d.getMonth() - 1)
                        viewDate = d
                    }
                }
                
                Text {
                    Layout.fillWidth: true
                    text: viewDate.toLocaleString(Qt.locale(), "MMMM yyyy")
                    font.pixelSize: 16
                    font.weight: Font.Medium
                    horizontalAlignment: Text.AlignHCenter
                }
                
                Button {
                    text: "›"
                    implicitWidth: 32
                    implicitHeight: 32
                    flat: true
                    onClicked: {
                        var d = new Date(viewDate)
                        d.setMonth(d.getMonth() + 1)
                        viewDate = d
                    }
                }
            }
            
            // Weekday headers
            RowLayout {
                Layout.fillWidth: true
                spacing: 0
                
                Repeater {
                    model: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
                    
                    Text {
                        Layout.fillWidth: true
                        text: modelData
                        font.pixelSize: 12
                        color: "#9e9e9e"
                        horizontalAlignment: Text.AlignHCenter
                    }
                }
            }
            
            // Days grid
            Grid {
                Layout.fillWidth: true
                Layout.fillHeight: true
                columns: 7
                spacing: 2
                
                // Empty cells before first day
                Repeater {
                    model: firstDayOfMonth
                    
                    Item {
                        width: 34
                        height: 34
                    }
                }
                
                // Days
                Repeater {
                    model: daysInMonth
                    
                    Rectangle {
                        width: 34
                        height: 34
                        radius: 17
                        
                        property int day: index + 1
                        property bool isSelected: {
                            return datePicker.value && 
                                   datePicker.value.getDate() === day &&
                                   datePicker.value.getMonth() === viewDate.getMonth() &&
                                   datePicker.value.getFullYear() === viewDate.getFullYear()
                        }
                        property bool isToday: {
                            var today = new Date()
                            return today.getDate() === day &&
                                   today.getMonth() === viewDate.getMonth() &&
                                   today.getFullYear() === viewDate.getFullYear()
                        }
                        property bool isDisabled: {
                            var d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
                            return d < datePicker.minDate || d > datePicker.maxDate
                        }
                        
                        color: {
                            if (isSelected) return "#1976d2"
                            if (dayMouse.containsMouse && !isDisabled) return "#e3f2fd"
                            return "transparent"
                        }
                        border.width: isToday && !isSelected ? 1 : 0
                        border.color: "#1976d2"
                        
                        Text {
                            anchors.centerIn: parent
                            text: day
                            font.pixelSize: 14
                            color: {
                                if (isDisabled) return "#bdbdbd"
                                if (isSelected) return "#ffffff"
                                return "#1a1a1a"
                            }
                        }
                        
                        MouseArea {
                            id: dayMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            enabled: !isDisabled
                            cursorShape: isDisabled ? Qt.ForbiddenCursor : Qt.PointingHandCursor
                            onClicked: {
                                datePicker.value = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
                                dateChanged(datePicker.value)
                                calendarPopup.close()
                            }
                        }
                    }
                }
            }
        }
    }
    
    property date viewDate: value && !isNaN(value.getTime()) ? value : new Date()
    property int daysInMonth: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
    property int firstDayOfMonth: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()
}
