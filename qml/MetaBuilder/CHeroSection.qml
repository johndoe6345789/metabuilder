import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "section_hero"
    Accessible.role: Accessible.Pane
    Accessible.name: "MetaBuilder Hero"

    property string platformVersion: "0.9.1"
    property bool isDark: false

    signal getStarted()
    signal openStorybook()
    signal openPackages()

    readonly property color accentBlue: "#6366F1"
    readonly property color primaryContainer:
        isDark
            ? Qt.rgba(accentBlue.r,
                accentBlue.g, accentBlue.b, 0.15)
            : Qt.rgba(accentBlue.r,
                accentBlue.g, accentBlue.b, 0.12)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary

    color: "transparent"
    implicitHeight: 400

    Rectangle {
        anchors.fill: parent; gradient: Gradient {
            GradientStop {
                position: 0.0
                color: isDark
                    ? Qt.rgba(0.39,0.4,0.95,0.06)
                    : Qt.rgba(0.30,0.40,0.90,0.12)
            }
            GradientStop {
                position: 0.7
                color: isDark
                    ? "transparent"
                    : Qt.rgba(0.35,0.45,0.88,0.04)
            }
            GradientStop { position: 1.0; color: "transparent" }
    } }

    ColumnLayout {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.verticalCenter: parent.verticalCenter
        anchors.verticalCenterOffset: 16
        width: Math.min(parent.width - 80, 720)
        spacing: 16

        CVersionPill {
            Layout.alignment: Qt.AlignHCenter
            version: platformVersion
            accent: accentBlue
            containerColor: primaryContainer
        }

        CText {
            text: "MetaBuilder"
            font.pixelSize: 52
            font.weight: Font.Black
            font.letterSpacing: -2
            color: onSurface
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
        }

        CText {
            text: "The universal platform for"
                + " building data-driven"
                + " applications."
            font.pixelSize: 17
            color: onSurfaceVariant
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
        }

        CText {
            text: "95% JSON config  \u00B7  "
                + "5% infrastructure  \u00B7  "
                + "Desktop + Web + CLI"
            font.pixelSize: 13
            font.family: "monospace"
            color: onSurfaceVariant
            opacity: isDark ? 0.4 : 0.55
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
        }

        RowLayout {
            Layout.alignment: Qt.AlignHCenter
            Layout.topMargin: 20
            spacing: 12

            CButton {
                text: "Get Started"
                variant: "primary"; size: "lg"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Get Started"
                Keys.onReturnPressed: root.getStarted()
                Keys.onSpacePressed: root.getStarted()
                onClicked: root.getStarted()
            }
            CButton {
                text: "Storybook"
                variant: "ghost"; size: "lg"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Open Storybook"
                Keys.onReturnPressed:
                    root.openStorybook()
                Keys.onSpacePressed:
                    root.openStorybook()
                onClicked: root.openStorybook()
            }
            CButton {
                text: "Packages"
                variant: "ghost"; size: "lg"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Open Packages"
                Keys.onReturnPressed:
                    root.openPackages()
                Keys.onSpacePressed:
                    root.openPackages()
                onClicked: root.openPackages()
            }
        }
    }
}
