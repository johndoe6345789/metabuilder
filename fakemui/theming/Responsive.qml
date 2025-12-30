pragma Singleton
import QtQuick
import QtQuick.Window

/**
 * Responsive.qml - Responsive design utilities for QML
 * Mirrors React's _responsive.scss media query mixins
 * 
 * Usage:
 *   - Responsive.isMobile    // true when width < 600
 *   - Responsive.isTablet    // true when 600 <= width < 900
 *   - Responsive.isDesktop   // true when width >= 900
 *   - Responsive.breakpoint  // "mobile" | "tablet" | "desktop" | "large"
 *   - Responsive.columns(base, mobile, tablet) // responsive column count
 */
QtObject {
    id: responsive

    // ============================================
    // Breakpoints (same as StyleVariables)
    // ============================================
    
    readonly property int breakpointSm: 600
    readonly property int breakpointMd: 900
    readonly property int breakpointLg: 1200
    readonly property int breakpointXl: 1536

    // ============================================
    // Window reference - set this from your main window
    // ============================================
    
    property var targetWindow: null
    property real windowWidth: targetWindow ? targetWindow.width : 1200
    property real windowHeight: targetWindow ? targetWindow.height : 800

    // ============================================
    // Breakpoint Detection (like @media queries)
    // ============================================
    
    // Mobile: < 600px
    readonly property bool isMobile: windowWidth < breakpointSm
    
    // Tablet: 600px - 899px
    readonly property bool isTablet: windowWidth >= breakpointSm && windowWidth < breakpointMd
    
    // Desktop: 900px - 1199px
    readonly property bool isDesktop: windowWidth >= breakpointMd && windowWidth < breakpointLg
    
    // Large: >= 1200px
    readonly property bool isLarge: windowWidth >= breakpointLg
    
    // XLarge: >= 1536px
    readonly property bool isXLarge: windowWidth >= breakpointXl
    
    // At least tablet (>= 600px)
    readonly property bool isTabletUp: windowWidth >= breakpointSm
    
    // At least desktop (>= 900px)
    readonly property bool isDesktopUp: windowWidth >= breakpointMd
    
    // At most tablet (< 900px)
    readonly property bool isTabletDown: windowWidth < breakpointMd

    // Current breakpoint name
    readonly property string breakpoint: {
        if (windowWidth < breakpointSm) return "mobile"
        if (windowWidth < breakpointMd) return "tablet"
        if (windowWidth < breakpointLg) return "desktop"
        return "large"
    }

    // ============================================
    // Responsive Value Helpers
    // ============================================
    
    /**
     * Pick value based on current breakpoint
     * Usage: Responsive.pick({ mobile: 1, tablet: 2, desktop: 3, large: 4 })
     */
    function pick(values) {
        if (isMobile && values.mobile !== undefined) return values.mobile
        if (isTablet && values.tablet !== undefined) return values.tablet
        if (isDesktop && values.desktop !== undefined) return values.desktop
        if (isLarge && values.large !== undefined) return values.large
        // Fallback cascade
        if (isLarge) return values.desktop || values.tablet || values.mobile
        if (isDesktop) return values.tablet || values.mobile
        if (isTablet) return values.mobile
        return values.mobile
    }

    /**
     * Responsive column count
     * Usage: Responsive.columns(4, 1, 2) => 4 on desktop, 2 on tablet, 1 on mobile
     */
    function columns(desktop, mobile, tablet) {
        if (isMobile) return mobile || 1
        if (isTablet) return tablet || mobile || 2
        return desktop || 4
    }

    /**
     * Responsive spacing
     * Usage: Responsive.space(24, 8, 16) => 24 on desktop, 16 on tablet, 8 on mobile
     */
    function space(desktop, mobile, tablet) {
        if (isMobile) return mobile || 8
        if (isTablet) return tablet || mobile || 16
        return desktop || 24
    }

    /**
     * Responsive font size
     * Usage: Responsive.fontSize(16, 12, 14)
     */
    function fontSize(desktop, mobile, tablet) {
        if (isMobile) return mobile || 12
        if (isTablet) return tablet || mobile || 14
        return desktop || 16
    }

    /**
     * Responsive visibility - returns opacity (1 or 0)
     * Usage: opacity: Responsive.showOn("desktop")
     */
    function showOn(breakpointName) {
        switch (breakpointName) {
            case "mobile": return isMobile ? 1 : 0
            case "tablet": return isTablet ? 1 : 0
            case "desktop": return isDesktop ? 1 : 0
            case "large": return isLarge ? 1 : 0
            case "tabletUp": return isTabletUp ? 1 : 0
            case "desktopUp": return isDesktopUp ? 1 : 0
            case "tabletDown": return isTabletDown ? 1 : 0
            default: return 1
        }
    }

    /**
     * Hide on specific breakpoint
     * Usage: visible: Responsive.hideOn("mobile")
     */
    function hideOn(breakpointName) {
        return showOn(breakpointName) === 0
    }

    /**
     * Clamp value between min/max based on window size
     * Usage: Responsive.clamp(200, 100, 400) 
     */
    function clamp(preferred, min, max) {
        return Math.max(min, Math.min(preferred, max))
    }

    /**
     * Fluid value that scales with window width
     * Usage: Responsive.fluid(16, 24) => scales from 16 at mobile to 24 at desktop
     */
    function fluid(minValue, maxValue) {
        var ratio = (windowWidth - breakpointSm) / (breakpointLg - breakpointSm)
        ratio = Math.max(0, Math.min(1, ratio))
        return minValue + (maxValue - minValue) * ratio
    }

    /**
     * Container max-width based on breakpoint (like CSS container queries)
     */
    readonly property int containerMaxWidth: {
        if (windowWidth < breakpointSm) return windowWidth - 32  // 16px padding each side
        if (windowWidth < breakpointMd) return breakpointSm - 48
        if (windowWidth < breakpointLg) return breakpointMd - 64
        return breakpointLg - 80
    }

    /**
     * Sidebar visibility helper
     */
    readonly property bool shouldCollapseSidebar: windowWidth < breakpointMd
    
    /**
     * Grid auto columns based on min item width
     */
    function autoColumns(minItemWidth) {
        return Math.max(1, Math.floor(windowWidth / minItemWidth))
    }
}
