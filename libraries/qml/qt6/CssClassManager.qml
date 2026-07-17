import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/CssClassLogic.js" as Logic

Rectangle {
    id: root
    color: Theme.background
    objectName: "view_css_class_manager"
    Accessible.role: Accessible.Pane
    Accessible.name: "CSS Class Manager"

    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    property var cssClasses: []
    property int selectedClassIndex: 0
    property bool showAddClassDialog: false
    property bool showDeleteConfirm: false
    property string newClassName: ""
    property var propertySuggestions: []

    function selectedClass() {
        return Logic.selectedClass(root)
    }
    function loadSeedData() {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", Qt.resolvedUrl(
            "config/css-classes-seed.json"), false)
        xhr.send()
        if (xhr.status === 200) {
            var d = JSON.parse(xhr.responseText)
            cssClasses = d.cssClasses
            propertySuggestions = d.propertySuggestions
        }
    }
    onUseLiveDataChanged: {
        if (useLiveData)
            Logic.loadCssClasses(root, dbal)
    }
    Component.onCompleted: {
        loadSeedData()
        Logic.loadCssClasses(root, dbal)
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 16; anchors.margins: 20

        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText {
                variant: "h3"
                text: "CSS Class Manager"
            }
            Item { Layout.fillWidth: true }
            CBadge {
                text: cssClasses.length + " classes"
            }
            CButton {
                text: "Add Class"
                variant: "primary"; size: "sm"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Add CSS class"
                Keys.onReturnPressed: {
                    newClassName = ""
                    showAddClassDialog = true
                }
                onClicked: {
                    newClassName = ""
                    showAddClassDialog = true
                }
            }
        }

        CDivider { Layout.fillWidth: true }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true; spacing: 16
            CssClassSidebar {
                Layout.preferredWidth: 280
                Layout.fillHeight: true
                cssClasses: root.cssClasses
                selectedIndex:
                    root.selectedClassIndex
                onItemClicked: function(idx) {
                    root.selectedClassIndex = idx
                }
            }
            ColumnLayout {
                Layout.fillWidth: true
                Layout.fillHeight: true
                spacing: 16
                CssPropertyEditor {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    visible:
                        root.selectedClass() !== null
                    selectedClass:
                        root.selectedClass()
                    propertySuggestions:
                        root.propertySuggestions
                    onClassNameChanged:
                        function(name) {
                            Logic.setClassName(
                                root, dbal, name
                            )
                        }
                    onDeleteClassClicked:
                        showDeleteConfirm = true
                    onAddPropertyClicked:
                        Logic.addPropertyToSelected(
                            root, dbal
                        )
                    onRemovePropertyClicked:
                        function(idx) {
                            Logic.removePropertyFromSelected(
                                root, dbal, idx
                            )
                        }
                    onPropertyNameChanged:
                        function(idx, name) {
                            Logic.setPropertyName(
                                root, dbal, idx, name
                            )
                        }
                    onPropertyValueChanged:
                        function(idx, val) {
                            Logic.setPropertyValue(
                                root, dbal, idx, val
                            )
                        }
                }
                CssClassPreview {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 160
                    visible:
                        root.selectedClass() !== null
                    selectedClass:
                        root.selectedClass()
                }
            }
        }
    }

    CDialog {
        visible: showAddClassDialog
        title: "Add New Class"
        ColumnLayout {
            spacing: 16; width: 320
            CText {
                variant: "body1"
                text: "Enter a name for the"
                    + " new CSS class."
            }
            CTextField {
                Layout.fillWidth: true
                label: "Class Name"
                placeholderText: "my-class"
                text: newClassName
                Accessible.role: Accessible.EditableText
                Accessible.name: "New CSS class name"
                onTextChanged: newClassName = text
            }
            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"; size: "sm"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Cancel add class"
                    Keys.onReturnPressed:
                        showAddClassDialog = false
                    onClicked:
                        showAddClassDialog = false
                }
                CButton {
                    text: "Create"
                    variant: "primary"; size: "sm"
                    enabled:
                        newClassName.trim().length > 0
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Create CSS class"
                    Keys.onReturnPressed: {
                        Logic.addClass(root, dbal,
                            newClassName.trim())
                        showAddClassDialog = false
                    }
                    onClicked: {
                        Logic.addClass(root, dbal,
                            newClassName.trim())
                        showAddClassDialog = false
                    }
                }
            }
        }
    }

    CDialog {
        visible: showDeleteConfirm
        title: "Delete Class"
        ColumnLayout {
            spacing: 16; width: 320
            CAlert {
                Layout.fillWidth: true
                severity: "warning"
                text: selectedClass()
                    ? "Are you sure you want to"
                        + " delete \"."
                        + selectedClass().name
                        + "\"? This action cannot"
                        + " be undone."
                    : "No class selected."
            }
            CText {
                variant: "body2"
                text: selectedClass()
                    ? "This class is used in "
                        + selectedClass().usageCount
                        + " place(s)."
                    : ""
                visible: selectedClass() !== null
                    && selectedClass().usageCount > 0
            }
            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"; size: "sm"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Cancel delete"
                    Keys.onReturnPressed:
                        showDeleteConfirm = false
                    onClicked:
                        showDeleteConfirm = false
                }
                CButton {
                    text: "Delete"
                    variant: "danger"; size: "sm"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Confirm delete"
                    Keys.onReturnPressed: {
                        Logic.deleteSelectedClass(
                            root, dbal)
                        showDeleteConfirm = false
                    }
                    onClicked: {
                        Logic.deleteSelectedClass(
                            root, dbal
                        )
                        showDeleteConfirm = false
                    }
                }
            }
        }
    }
}
