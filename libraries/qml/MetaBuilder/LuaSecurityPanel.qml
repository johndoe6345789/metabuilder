import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    Layout.preferredWidth: 200
    Layout.fillHeight: true
    spacing: 8

    property string securityScanResult: ""

    CText { variant: "h4"; text: "Security" }

    CAlert {
        Layout.fillWidth: true
        severity: securityScanResult
                  ? (securityScanResult.indexOf("WARN") !== -1 ? "warning" :
                      "success")
                  : "info"
        text: securityScanResult
              ? (securityScanResult.indexOf("WARN") !== -1 ? "Advisories found"
                  : "All checks passed")
              : "Not scanned yet"
    }

    CText { variant: "caption"; text: "SCAN CHECKS" }
    CText { variant: "body2"; text: "os.execute() calls" }
    CText { variant: "body2"; text: "Raw SQL injection" }
    CText { variant: "body2"; text: "File system access" }
    CText { variant: "body2"; text: "Global pollution" }
    CText { variant: "body2"; text: "Unsafe concat" }

    Item { Layout.fillHeight: true }
}
