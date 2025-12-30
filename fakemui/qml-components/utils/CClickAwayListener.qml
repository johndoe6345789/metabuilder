import QtQuick 2.15

QtObject {
    id: root
    signal clickedAway()
    // Consumers should wire MouseArea on top-level windows to call clickedAway
}
