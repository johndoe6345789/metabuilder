import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

GridLayout {
    columns: 4
    columnSpacing: 8
    rowSpacing: 6

    signal mediaHostChanged(string host)
    signal mediaPortChanged(int port)
    signal s3HostChanged(string host)
    signal s3PortChanged(int port)

    Label {
        text: "Media Host"
        color: "#8b949e"; font.pixelSize: 12
    }
    TextField {
        text: "localhost"
        implicitWidth: 120
        color: "#e6edf3"
        font.pixelSize: 12
        background: Rectangle {
            color: "#0f1117"
            border.color: "#30363d"; radius: 4
        }
        onTextChanged:
            mediaHostChanged(text || "localhost")
    }
    Label {
        text: "Port"
        color: "#8b949e"; font.pixelSize: 12
    }
    TextField {
        text: "8090"
        implicitWidth: 60
        color: "#e6edf3"; font.pixelSize: 12
        background: Rectangle {
            color: "#0f1117"
            border.color: "#30363d"; radius: 4
        }
        onTextChanged:
            mediaPortChanged(
                parseInt(text) || 8090)
    }
    Label {
        text: "S3 Host"
        color: "#8b949e"; font.pixelSize: 12
    }
    TextField {
        text: "localhost"
        implicitWidth: 120
        color: "#e6edf3"; font.pixelSize: 12
        background: Rectangle {
            color: "#0f1117"
            border.color: "#30363d"; radius: 4
        }
        onTextChanged:
            s3HostChanged(text || "localhost")
    }
    Label {
        text: "Port"
        color: "#8b949e"; font.pixelSize: 12
    }
    TextField {
        text: "9000"
        implicitWidth: 60
        color: "#e6edf3"; font.pixelSize: 12
        background: Rectangle {
            color: "#0f1117"
            border.color: "#30363d"; radius: 4
        }
        onTextChanged:
            s3PortChanged(
                parseInt(text) || 9000)
    }
}
