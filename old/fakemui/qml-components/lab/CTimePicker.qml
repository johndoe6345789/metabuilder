import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: timePicker
    
    property date value: new Date()
    property string label: ""
    property bool ampm: false
    property bool disabled: false
    property bool readOnly: false
    property bool error: false
    property string helperText: ""
    property string placeholder: "Select time"
    
    signal timeChanged(date newTime)
    
    implicitWidth: 150
    implicitHeight: contentColumn.implicitHeight
    
    function formatTime(d) {
        if (!d || isNaN(d.getTime())) return ""
        var hours = d.getHours()
        var minutes = String(d.getMinutes()).padStart(2, '0')
        
        if (ampm) {
            var period = hours >= 12 ? "PM" : "AM"
            hours = hours % 12 || 12
            return hours + ":" + minutes + " " + period
        }
        return String(hours).padStart(2, '0') + ":" + minutes
    }
    
    ColumnLayout {
        id: contentColumn
        anchors.fill: parent
        spacing: 4
        
        // Label
        Text {
            visible: timePicker.label
            text: timePicker.label
            font.pixelSize: 12
            color: timePicker.error ? "#d32f2f" : "#666666"
        }
        
        // Time input
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 40
            radius: 4
            color: timePicker.disabled ? "#f5f5f5" : "#ffffff"
            border.width: 1
            border.color: {
                if (timePicker.error) return "#d32f2f"
                if (inputMouse.containsMouse) return "#1976d2"
                return "#c4c4c4"
            }
            
            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 12
                anchors.rightMargin: 12
                spacing: 4
                
                // Hours
                SpinBox {
                    id: hoursSpinner
                    from: timePicker.ampm ? 1 : 0
                    to: timePicker.ampm ? 12 : 23
                    value: {
                        var h = timePicker.value.getHours()
                        if (timePicker.ampm) {
                            return h % 12 || 12
                        }
                        return h
                    }
                    editable: true
                    implicitWidth: 50
                    enabled: !timePicker.disabled && !timePicker.readOnly
                    
                    onValueModified: updateTime()
                }
                
                Text {
                    text: ":"
                    font.pixelSize: 16
                    font.weight: Font.Medium
                }
                
                // Minutes
                SpinBox {
                    id: minutesSpinner
                    from: 0
                    to: 59
                    value: timePicker.value.getMinutes()
                    editable: true
                    implicitWidth: 50
                    enabled: !timePicker.disabled && !timePicker.readOnly
                    
                    textFromValue: function(value) {
                        return String(value).padStart(2, '0')
                    }
                    
                    onValueModified: updateTime()
                }
                
                // AM/PM toggle
                ComboBox {
                    visible: timePicker.ampm
                    model: ["AM", "PM"]
                    currentIndex: timePicker.value.getHours() >= 12 ? 1 : 0
                    implicitWidth: 60
                    enabled: !timePicker.disabled && !timePicker.readOnly
                    
                    onCurrentIndexChanged: updateTime()
                }
                
                // Clock icon
                Text {
                    visible: !timePicker.ampm
                    text: "🕐"
                    font.pixelSize: 16
                }
            }
            
            MouseArea {
                id: inputMouse
                anchors.fill: parent
                hoverEnabled: true
                propagateComposedEvents: true
                z: -1
            }
        }
        
        // Helper text
        Text {
            visible: timePicker.helperText
            text: timePicker.helperText
            font.pixelSize: 12
            color: timePicker.error ? "#d32f2f" : "#666666"
        }
    }
    
    function updateTime() {
        var hours = hoursSpinner.value
        if (timePicker.ampm) {
            var isPM = (ampmCombo ? ampmCombo.currentIndex === 1 : timePicker.value.getHours() >= 12)
            if (isPM && hours < 12) hours += 12
            if (!isPM && hours === 12) hours = 0
        }
        
        var newDate = new Date(timePicker.value)
        newDate.setHours(hours, minutesSpinner.value, 0, 0)
        timePicker.value = newDate
        timeChanged(newDate)
    }
    
    property var ampmCombo: null
    
    Component.onCompleted: {
        // Find AM/PM combo if exists
        for (var i = 0; i < contentColumn.children.length; i++) {
            var child = contentColumn.children[i]
            if (child instanceof ComboBox) {
                ampmCombo = child
                break
            }
        }
    }
}
