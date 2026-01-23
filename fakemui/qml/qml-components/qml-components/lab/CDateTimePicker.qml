import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: dateTimePicker
    
    property date value: new Date()
    property string label: ""
    property bool disabled: false
    
    signal dateTimeChanged(date newDateTime)
    
    implicitWidth: datePickerItem.implicitWidth + timePickerItem.implicitWidth + 16
    implicitHeight: contentColumn.implicitHeight
    
    ColumnLayout {
        id: contentColumn
        anchors.fill: parent
        spacing: 4
        
        // Label
        Text {
            visible: dateTimePicker.label
            text: dateTimePicker.label
            font.pixelSize: 12
            color: "#666666"
        }
        
        RowLayout {
            Layout.fillWidth: true
            spacing: 8
            
            CDatePicker {
                id: datePickerItem
                value: dateTimePicker.value
                disabled: dateTimePicker.disabled
                
                onDateChanged: function(newDate) {
                    if (newDate && !isNaN(newDate.getTime())) {
                        var current = dateTimePicker.value
                        newDate.setHours(current.getHours(), current.getMinutes())
                        dateTimePicker.value = newDate
                        dateTimeChanged(newDate)
                    }
                }
            }
            
            CTimePicker {
                id: timePickerItem
                value: dateTimePicker.value
                disabled: dateTimePicker.disabled
                
                onTimeChanged: function(newTime) {
                    if (newTime && !isNaN(newTime.getTime())) {
                        var current = dateTimePicker.value
                        var newDate = new Date(current)
                        newDate.setHours(newTime.getHours(), newTime.getMinutes())
                        dateTimePicker.value = newDate
                        dateTimeChanged(newDate)
                    }
                }
            }
        }
    }
}
