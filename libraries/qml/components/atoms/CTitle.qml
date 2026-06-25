import QtQuick
import QmlComponents 1.0

/**
 * CTitle.qml - Material Design 3 heading wrapper
 * Convenience component around CText for section headings
 *
 * Usage:
 *   CTitle { text: "Page Title" }
 *   CTitle { level: "h3"; text: "Section" }
 *   CTitle { level: "h5"; text: "Subsection"; gutterBottom: false }
 */
CText {
    id: root

    property string level: "h1"          // h1-h6
    property bool gutterBottom: true      // Add bottom margin

    variant: level
    wrapMode: Text.Wrap

    bottomPadding: gutterBottom ? StyleVariables.spacingSm : 0
}
