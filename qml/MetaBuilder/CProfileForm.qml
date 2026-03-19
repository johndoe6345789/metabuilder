import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CProfileForm - Editable profile fields (display name, email, bio).
 *
 * Expects profile: { displayName, email, bio }.
 * Emits save(data) with the edited field values.
 */
CCard {
    id: root
    Layout.fillWidth: true
    Layout.leftMargin: 24
    Layout.rightMargin: 24
    variant: "filled"

    property var profile: ({ displayName: "", email: "", bio: "" })
    property bool isDark: Theme.mode === "dark"

    signal save(var data)

    // ── Local editable copies ──────────
    property string editDisplayName: profile.displayName || ""
    property string editEmail: profile.email || ""
    property string editBio: profile.bio || ""

    onProfileChanged: {
        editDisplayName = (profile && profile.displayName)
            ? profile.displayName : ""
        editEmail = (profile && profile.email) ? profile.email : ""
        editBio = (profile && profile.bio) ? profile.bio : ""
    }

    CText {
        Layout.fillWidth: true
        variant: "h4"
        text: "Edit Profile"
    }

    Item { Layout.preferredHeight: 8 }

    CDivider { Layout.fillWidth: true }

    Item { Layout.preferredHeight: 14 }

    CTextField {
        Layout.fillWidth: true
        label: "Display Name"
        placeholderText: "Enter display name"
        text: root.editDisplayName
        onTextChanged: root.editDisplayName = text
    }

    Item { Layout.preferredHeight: 14 }

    CTextField {
        Layout.fillWidth: true
        label: "Email"
        placeholderText: "Enter email address"
        text: root.editEmail
        onTextChanged: root.editEmail = text
    }

    Item { Layout.preferredHeight: 14 }

    CTextField {
        Layout.fillWidth: true
        label: "Bio"
        placeholderText: "Tell us about yourself..."
        text: root.editBio
        onTextChanged: root.editBio = text
    }

    function getData() {
        return {
            displayName: editDisplayName,
            email: editEmail,
            bio: editBio
        }
    }
}
