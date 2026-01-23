import QtQuick

QtObject {
    id: root
    signal clickedAway()
    // Consumers should wire MouseArea on top-level windows to call clickedAway
}
