import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Item {
    id: root

    // ── Create tenant dialog ──
    property bool showCreateTenant: false
    property string newTenantName: ""
    property string newTenantOwner: ""
    property string newTenantHomepage: ""
    signal tenantCreated(
        string name, string owner, string homepage
    )

    // ── System dialogs ──
    property bool showReseed: false
    property bool showClearCache: false
    property bool showRestart: false
    property string restartTarget: ""

    signal reseedConfirmed()
    signal clearCacheConfirmed()
    signal restartConfirmed(string target)

    CDialog {
        id: createTenantDialog
        visible: root.showCreateTenant
        title: "Create Tenant"
        ColumnLayout {
            spacing: 12; width: 400
            CText {
                variant: "body2"
                text: "Provision a new isolated tenant"
                    + " with its own schemas, users,"
                    + " and data store."
                wrapMode: Text.Wrap
                Layout.fillWidth: true
            }
            CTextField {
                Layout.fillWidth: true
                label: "Tenant Name"
                placeholderText: "e.g. acme-corp"
                text: root.newTenantName
                onTextChanged: root.newTenantName = text
            }
            CTextField {
                Layout.fillWidth: true
                label: "Owner"
                placeholderText: "e.g. admin@acme.com"
                text: root.newTenantOwner
                onTextChanged: root.newTenantOwner = text
            }
            CTextField {
                Layout.fillWidth: true
                label: "Homepage"
                placeholderText: "e.g. /acme"
                text: root.newTenantHomepage
                onTextChanged: {
                    root.newTenantHomepage = text
                }
            }
            FlexRow {
                Layout.fillWidth: true; spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"; size: "sm"
                    onClicked: {
                        root.showCreateTenant = false
                    }
                }
                CButton {
                    text: "Create"
                    variant: "primary"; size: "sm"
                    onClicked: {
                        if (root.newTenantName
                            && root.newTenantOwner) {
                            root.tenantCreated(
                                root.newTenantName,
                                root.newTenantOwner,
                                root.newTenantHomepage
                                    || "/")
                            root.newTenantName = ""
                            root.newTenantOwner = ""
                            root.newTenantHomepage = ""
                            root.showCreateTenant = false
                        }
                    }
                }
            }
        }
    }

    CDialog {
        id: reseedDialog
        visible: root.showReseed
        title: "Force Re-seed"
        ColumnLayout {
            spacing: 12; width: 400
            CAlert {
                severity: "warning"
                text: "This will re-run all seed"
                    + " data scripts. Existing seed"
                    + " records will be skipped"
                    + " (idempotent), but this may"
                    + " take several minutes."
            }
            FlexRow {
                Layout.fillWidth: true; spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"; size: "sm"
                    onClicked: {
                        root.showReseed = false
                    }
                }
                CButton {
                    text: "Re-seed"
                    variant: "primary"; size: "sm"
                    onClicked: {
                        root.reseedConfirmed()
                        root.showReseed = false
                    }
                }
            }
        }
    }

    CDialog {
        id: clearCacheDialog
        visible: root.showClearCache
        title: "Clear Cache"
        ColumnLayout {
            spacing: 12; width: 400
            CAlert {
                severity: "warning"
                text: "This will flush all Redis"
                    + " caches across all tenants."
                    + " Subsequent requests will"
                    + " experience cache misses"
                    + " until the cache is"
                    + " repopulated."
            }
            FlexRow {
                Layout.fillWidth: true; spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"; size: "sm"
                    onClicked: {
                        root.showClearCache = false
                    }
                }
                CButton {
                    text: "Clear Cache"
                    variant: "danger"; size: "sm"
                    onClicked: {
                        root.clearCacheConfirmed()
                        root.showClearCache = false
                    }
                }
            }
        }
    }

    CDialog {
        id: restartDaemonDialog
        visible: root.showRestart
        title: "Restart " + root.restartTarget
        ColumnLayout {
            spacing: 12; width: 400
            CAlert {
                severity: "error"
                text: "Restarting "
                    + root.restartTarget
                    + " will cause a brief service"
                    + " interruption. All active"
                    + " connections will be"
                    + " dropped. Are you sure?"
            }
            FlexRow {
                Layout.fillWidth: true; spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"; size: "sm"
                    onClicked: {
                        root.showRestart = false
                    }
                }
                CButton {
                    text: "Restart"
                    variant: "danger"; size: "sm"
                    onClicked: {
                        root.restartConfirmed(
                            root.restartTarget)
                        root.showRestart = false
                    }
                }
            }
        }
    }
}
