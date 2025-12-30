pragma Singleton
import QtQuick

/**
 * NerdModeContext - Toggle for showing technical details
 * Mirrors React's NerdModeContext from App.jsx
 */
QtObject {
    id: nerdModeContext
    
    // Nerd mode state - shows raw JSON, task IDs, debug info
    property bool nerdMode: false
    
    /**
     * Set nerd mode
     */
    function setNerdMode(enabled) {
        nerdMode = enabled
    }
    
    /**
     * Toggle nerd mode
     */
    function toggle() {
        setNerdMode(!nerdMode)
    }
}
