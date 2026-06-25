import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

FlexRow {
    id: root
    objectName: "status_execution"
    Accessible.role: Accessible.StaticText
    Accessible.name: {
        if (root.status === "running")
            return "Execution status: Running"
        if (root.status === "success")
            return "Execution status: Passed"
        if (root.status !== "")
            return "Execution status: Failed"
        return "Execution status"
    }

    property string status: ""

    spacing: 4
    visible: status !== ""

    Rectangle {
        width: 10; height: 10; radius: 5
        color: {
            if (root.status === "running") return Theme.warning
            if (root.status === "success") return Theme.success
            return Theme.error
        }
    }

    CText {
        variant: "caption"
        text: {
            if (root.status === "running") return "Running..."
            if (root.status === "success") return "Passed"
            return "Failed"
        }
    }
}
