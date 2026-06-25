"""
FakeMUI Stylesheet - Material UI-inspired styles for PyQt6.

This stylesheet provides consistent styling across all FakeMUI components.
Import and apply with QApplication.setStyleSheet() or use apply_theme().
"""

LIGHT_STYLESHEET = """
/* ============================================
   FAKEMUI STYLESHEET - LIGHT THEME
   ============================================ */

/* Base Typography */
* {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* ============================================
   BUTTONS
   ============================================ */

/* Base Button */
QPushButton[objectName^="btn"] {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    background-color: #e0e0e0;
    color: rgba(0, 0, 0, 0.87);
    font-weight: 500;
    min-height: 36px;
}

QPushButton[objectName^="btn"]:hover {
    background-color: #d5d5d5;
}

QPushButton[objectName^="btn"]:pressed {
    background-color: #c0c0c0;
}

QPushButton[objectName^="btn"]:disabled {
    background-color: #e0e0e0;
    color: rgba(0, 0, 0, 0.38);
}

/* Primary Button */
QPushButton[objectName*="--primary"] {
    background-color: #1976d2;
    color: white;
}

QPushButton[objectName*="--primary"]:hover {
    background-color: #1565c0;
}

QPushButton[objectName*="--primary"]:pressed {
    background-color: #0d47a1;
}

/* Secondary Button */
QPushButton[objectName*="--secondary"] {
    background-color: #9c27b0;
    color: white;
}

QPushButton[objectName*="--secondary"]:hover {
    background-color: #7b1fa2;
}

/* Outline Button */
QPushButton[objectName*="--outline"] {
    background-color: transparent;
    border: 1px solid #1976d2;
    color: #1976d2;
}

QPushButton[objectName*="--outline"]:hover {
    background-color: rgba(25, 118, 210, 0.08);
}

/* Ghost Button */
QPushButton[objectName*="--ghost"] {
    background-color: transparent;
    color: #1976d2;
}

QPushButton[objectName*="--ghost"]:hover {
    background-color: rgba(25, 118, 210, 0.08);
}

/* Small Button */
QPushButton[objectName*="--sm"] {
    padding: 4px 10px;
    font-size: 13px;
    min-height: 30px;
}

/* Large Button */
QPushButton[objectName*="--lg"] {
    padding: 12px 24px;
    font-size: 15px;
    min-height: 44px;
}

/* Icon Button */
QToolButton[objectName^="icon-btn"] {
    border: none;
    border-radius: 50%;
    background-color: transparent;
}

QToolButton[objectName^="icon-btn"]:hover {
    background-color: rgba(0, 0, 0, 0.08);
}

/* FAB */
QPushButton[objectName^="fab"] {
    border-radius: 28px;
    background-color: #1976d2;
    color: white;
    font-weight: 500;
}

QPushButton[objectName^="fab"]:hover {
    background-color: #1565c0;
}

/* ============================================
   INPUTS
   ============================================ */

/* Text Input */
QLineEdit[objectName^="input"] {
    padding: 10px 12px;
    border: 1px solid #bdbdbd;
    border-radius: 4px;
    background-color: white;
    selection-background-color: #1976d2;
}

QLineEdit[objectName^="input"]:focus {
    border-color: #1976d2;
    border-width: 2px;
    padding: 9px 11px;
}

QLineEdit[objectName*="--error"] {
    border-color: #d32f2f;
}

QLineEdit[objectName*="--error"]:focus {
    border-color: #d32f2f;
}

/* Text Area */
QTextEdit[objectName^="textarea"] {
    padding: 10px 12px;
    border: 1px solid #bdbdbd;
    border-radius: 4px;
    background-color: white;
}

QTextEdit[objectName^="textarea"]:focus {
    border-color: #1976d2;
    border-width: 2px;
}

/* Select / ComboBox */
QComboBox[objectName^="select"] {
    padding: 8px 12px;
    border: 1px solid #bdbdbd;
    border-radius: 4px;
    background-color: white;
    min-height: 40px;
}

QComboBox[objectName^="select"]:focus {
    border-color: #1976d2;
}

QComboBox[objectName^="select"]::drop-down {
    border: none;
    width: 24px;
}

QComboBox[objectName^="select"] QAbstractItemView {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: white;
    selection-background-color: #e3f2fd;
}

/* Checkbox */
QCheckBox[objectName^="checkbox"] {
    spacing: 8px;
}

QCheckBox[objectName^="checkbox"]::indicator {
    width: 18px;
    height: 18px;
    border: 2px solid #757575;
    border-radius: 2px;
    background-color: white;
}

QCheckBox[objectName^="checkbox"]::indicator:checked {
    background-color: #1976d2;
    border-color: #1976d2;
}

QCheckBox[objectName^="checkbox"]::indicator:hover {
    border-color: #1976d2;
}

/* Radio Button */
QRadioButton[objectName^="radio"] {
    spacing: 8px;
}

QRadioButton[objectName^="radio"]::indicator {
    width: 18px;
    height: 18px;
    border: 2px solid #757575;
    border-radius: 9px;
    background-color: white;
}

QRadioButton[objectName^="radio"]::indicator:checked {
    background-color: white;
    border-color: #1976d2;
    border-width: 6px;
}

/* Slider */
QSlider[objectName^="slider"]::groove:horizontal {
    height: 4px;
    background-color: #e0e0e0;
    border-radius: 2px;
}

QSlider[objectName^="slider"]::handle:horizontal {
    width: 20px;
    height: 20px;
    margin: -8px 0;
    background-color: #1976d2;
    border-radius: 10px;
}

QSlider[objectName^="slider"]::sub-page:horizontal {
    background-color: #1976d2;
    border-radius: 2px;
}

/* Form Label */
QLabel[objectName^="form-label"] {
    color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
    margin-bottom: 4px;
}

QLabel[objectName*="--error"] {
    color: #d32f2f;
}

/* Form Helper Text */
QLabel[objectName^="form-helper-text"] {
    color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
    margin-top: 4px;
}

/* ============================================
   CARDS & PAPERS
   ============================================ */

/* Paper */
QFrame[objectName^="paper"] {
    background-color: white;
    border-radius: 4px;
}

QFrame[objectName*="elevation-1"] {
    border: 1px solid rgba(0, 0, 0, 0.12);
}

QFrame[objectName*="elevation-2"] {
    border: none;
}

/* Card */
QFrame[objectName^="card"] {
    background-color: white;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.12);
}

QFrame[objectName*="--raised"] {
    border: none;
}

QFrame[objectName*="--clickable"]:hover {
    background-color: #fafafa;
}

/* Card Header */
QFrame[objectName^="card-header"] {
    padding: 16px;
}

QLabel[objectName="card-header-title"] {
    font-size: 16px;
    font-weight: 500;
}

QLabel[objectName="card-header-subheader"] {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
}

/* Card Content */
QFrame[objectName^="card-content"] {
    padding: 16px;
}

/* Card Actions */
QFrame[objectName^="card-actions"] {
    padding: 8px;
}

/* ============================================
   LISTS
   ============================================ */

QFrame[objectName^="list"] {
    background-color: white;
}

QFrame[objectName^="list-item"] {
    padding: 8px 16px;
    min-height: 48px;
}

QFrame[objectName*="--clickable"]:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

QFrame[objectName*="--selected"] {
    background-color: rgba(25, 118, 210, 0.12);
}

QLabel[objectName="list-item-title"] {
    font-size: 14px;
}

QLabel[objectName="list-item-meta"] {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
}

QLabel[objectName="list-subheader"] {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.6);
}

/* ============================================
   ALERTS
   ============================================ */

QFrame[objectName^="alert"] {
    padding: 12px 16px;
    border-radius: 4px;
}

QFrame[objectName*="--info"] {
    background-color: #e3f2fd;
    color: #0d47a1;
}

QFrame[objectName*="--success"] {
    background-color: #e8f5e9;
    color: #1b5e20;
}

QFrame[objectName*="--warning"] {
    background-color: #fff3e0;
    color: #e65100;
}

QFrame[objectName*="--error"] {
    background-color: #ffebee;
    color: #c62828;
}

QLabel[objectName="alert-title"] {
    font-weight: bold;
}

/* ============================================
   CHIPS
   ============================================ */

QPushButton[objectName^="chip"] {
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 13px;
    background-color: #e0e0e0;
}

QPushButton[objectName*="--outlined"] {
    background-color: transparent;
    border: 1px solid #bdbdbd;
}

QPushButton[objectName*="--primary"] {
    background-color: #e3f2fd;
    color: #1976d2;
}

/* ============================================
   TABS
   ============================================ */

QPushButton[objectName^="tab"] {
    padding: 12px 16px;
    border: none;
    border-bottom: 2px solid transparent;
    background-color: transparent;
    color: rgba(0, 0, 0, 0.6);
    font-weight: 500;
}

QPushButton[objectName^="tab"]:hover {
    color: rgba(0, 0, 0, 0.87);
    background-color: rgba(0, 0, 0, 0.04);
}

QPushButton[objectName*="--active"] {
    color: #1976d2;
    border-bottom-color: #1976d2;
}

/* ============================================
   DIVIDER
   ============================================ */

QFrame[objectName^="divider"] {
    background-color: rgba(0, 0, 0, 0.12);
    max-height: 1px;
}

QFrame[objectName*="vertical"] {
    max-height: none;
    max-width: 1px;
}

/* ============================================
   PROGRESS
   ============================================ */

QProgressBar {
    background-color: #e0e0e0;
    border: none;
    border-radius: 2px;
    max-height: 4px;
}

QProgressBar::chunk {
    background-color: #1976d2;
    border-radius: 2px;
}

/* ============================================
   SKELETON
   ============================================ */

QFrame[objectName^="skeleton"] {
    background-color: #e0e0e0;
    border-radius: 4px;
}

QFrame[objectName*="--circular"] {
    border-radius: 50%;
}

/* ============================================
   DRAWER
   ============================================ */

QFrame[objectName^="drawer"] {
    background-color: white;
}

QFrame[objectName*="--left"] {
    border-right: 1px solid rgba(0, 0, 0, 0.12);
}

QFrame[objectName*="--right"] {
    border-left: 1px solid rgba(0, 0, 0, 0.12);
}

/* ============================================
   APP BAR
   ============================================ */

QFrame[objectName^="app-bar"] {
    background-color: #1976d2;
    color: white;
}

QFrame[objectName^="app-bar"] QLabel {
    color: white;
}

QFrame[objectName^="app-bar"] QPushButton {
    color: white;
    background-color: transparent;
}

/* ============================================
   TYPOGRAPHY
   ============================================ */

QLabel[objectName*="--textSecondary"] {
    color: rgba(0, 0, 0, 0.6);
}

QLabel[objectName*="--textDisabled"] {
    color: rgba(0, 0, 0, 0.38);
}

/* ============================================
   DIALOGS
   ============================================ */

QFrame[objectName^="dialog"] {
    background-color: white;
    border-radius: 4px;
}

QFrame[objectName^="dialog-content"] {
    padding: 20px 24px;
}

QFrame[objectName^="dialog-actions"] {
    padding: 8px;
}

/* ============================================
   TOOLTIPS
   ============================================ */

QToolTip {
    background-color: #616161;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 12px;
}

/* ============================================
   SCROLLBARS
   ============================================ */

QScrollBar:vertical {
    width: 8px;
    background-color: transparent;
}

QScrollBar::handle:vertical {
    background-color: #bdbdbd;
    border-radius: 4px;
    min-height: 24px;
}

QScrollBar::handle:vertical:hover {
    background-color: #9e9e9e;
}

QScrollBar::add-line:vertical,
QScrollBar::sub-line:vertical {
    height: 0;
}

QScrollBar:horizontal {
    height: 8px;
    background-color: transparent;
}

QScrollBar::handle:horizontal {
    background-color: #bdbdbd;
    border-radius: 4px;
    min-width: 24px;
}

QScrollBar::handle:horizontal:hover {
    background-color: #9e9e9e;
}

QScrollBar::add-line:horizontal,
QScrollBar::sub-line:horizontal {
    width: 0;
}
"""

DARK_STYLESHEET = """
/* ============================================
   FAKEMUI STYLESHEET - DARK THEME
   ============================================ */

/* Base Typography */
* {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: rgba(255, 255, 255, 0.87);
}

QWidget {
    background-color: #121212;
}

/* ============================================
   BUTTONS
   ============================================ */

QPushButton[objectName^="btn"] {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    background-color: #424242;
    color: rgba(255, 255, 255, 0.87);
    font-weight: 500;
    min-height: 36px;
}

QPushButton[objectName^="btn"]:hover {
    background-color: #616161;
}

QPushButton[objectName^="btn"]:disabled {
    background-color: #424242;
    color: rgba(255, 255, 255, 0.38);
}

QPushButton[objectName*="--primary"] {
    background-color: #90caf9;
    color: rgba(0, 0, 0, 0.87);
}

QPushButton[objectName*="--primary"]:hover {
    background-color: #42a5f5;
}

QPushButton[objectName*="--secondary"] {
    background-color: #ce93d8;
    color: rgba(0, 0, 0, 0.87);
}

QPushButton[objectName*="--outline"] {
    background-color: transparent;
    border: 1px solid #90caf9;
    color: #90caf9;
}

QPushButton[objectName*="--ghost"] {
    background-color: transparent;
    color: #90caf9;
}

/* ============================================
   INPUTS
   ============================================ */

QLineEdit[objectName^="input"] {
    padding: 10px 12px;
    border: 1px solid #616161;
    border-radius: 4px;
    background-color: #1e1e1e;
    color: rgba(255, 255, 255, 0.87);
}

QLineEdit[objectName^="input"]:focus {
    border-color: #90caf9;
}

QTextEdit[objectName^="textarea"] {
    padding: 10px 12px;
    border: 1px solid #616161;
    border-radius: 4px;
    background-color: #1e1e1e;
    color: rgba(255, 255, 255, 0.87);
}

QComboBox[objectName^="select"] {
    padding: 8px 12px;
    border: 1px solid #616161;
    border-radius: 4px;
    background-color: #1e1e1e;
    color: rgba(255, 255, 255, 0.87);
}

QCheckBox[objectName^="checkbox"]::indicator {
    border-color: #9e9e9e;
    background-color: #1e1e1e;
}

QCheckBox[objectName^="checkbox"]::indicator:checked {
    background-color: #90caf9;
    border-color: #90caf9;
}

/* ============================================
   CARDS & PAPERS
   ============================================ */

QFrame[objectName^="paper"], QFrame[objectName^="card"] {
    background-color: #1e1e1e;
    border-color: rgba(255, 255, 255, 0.12);
}

QLabel[objectName="card-header-subheader"] {
    color: rgba(255, 255, 255, 0.6);
}

/* ============================================
   LISTS
   ============================================ */

QFrame[objectName^="list"] {
    background-color: #1e1e1e;
}

QFrame[objectName*="--clickable"]:hover {
    background-color: rgba(255, 255, 255, 0.08);
}

QFrame[objectName*="--selected"] {
    background-color: rgba(144, 202, 249, 0.16);
}

QLabel[objectName="list-item-meta"] {
    color: rgba(255, 255, 255, 0.6);
}

/* ============================================
   ALERTS
   ============================================ */

QFrame[objectName*="--info"] {
    background-color: #0d47a1;
    color: #e3f2fd;
}

QFrame[objectName*="--success"] {
    background-color: #1b5e20;
    color: #e8f5e9;
}

QFrame[objectName*="--warning"] {
    background-color: #e65100;
    color: #fff3e0;
}

QFrame[objectName*="--error"] {
    background-color: #c62828;
    color: #ffebee;
}

/* ============================================
   CHIPS
   ============================================ */

QPushButton[objectName^="chip"] {
    background-color: #424242;
}

QPushButton[objectName*="--primary"] {
    background-color: rgba(144, 202, 249, 0.16);
    color: #90caf9;
}

/* ============================================
   TABS
   ============================================ */

QPushButton[objectName^="tab"] {
    color: rgba(255, 255, 255, 0.6);
}

QPushButton[objectName^="tab"]:hover {
    color: rgba(255, 255, 255, 0.87);
    background-color: rgba(255, 255, 255, 0.08);
}

QPushButton[objectName*="--active"] {
    color: #90caf9;
    border-bottom-color: #90caf9;
}

/* ============================================
   DIVIDER
   ============================================ */

QFrame[objectName^="divider"] {
    background-color: rgba(255, 255, 255, 0.12);
}

/* ============================================
   PROGRESS
   ============================================ */

QProgressBar {
    background-color: #424242;
}

QProgressBar::chunk {
    background-color: #90caf9;
}

/* ============================================
   SKELETON
   ============================================ */

QFrame[objectName^="skeleton"] {
    background-color: #424242;
}

/* ============================================
   DRAWER & APP BAR
   ============================================ */

QFrame[objectName^="drawer"] {
    background-color: #1e1e1e;
    border-color: rgba(255, 255, 255, 0.12);
}

QFrame[objectName^="app-bar"] {
    background-color: #272727;
}

/* ============================================
   TYPOGRAPHY
   ============================================ */

QLabel[objectName*="--textSecondary"] {
    color: rgba(255, 255, 255, 0.6);
}

QLabel[objectName*="--textDisabled"] {
    color: rgba(255, 255, 255, 0.38);
}

/* ============================================
   DIALOGS
   ============================================ */

QFrame[objectName^="dialog"] {
    background-color: #1e1e1e;
}

/* ============================================
   TOOLTIPS
   ============================================ */

QToolTip {
    background-color: #616161;
    color: white;
}

/* ============================================
   SCROLLBARS
   ============================================ */

QScrollBar::handle:vertical, QScrollBar::handle:horizontal {
    background-color: #616161;
}

QScrollBar::handle:vertical:hover, QScrollBar::handle:horizontal:hover {
    background-color: #757575;
}
"""


def get_stylesheet(theme: str = 'light') -> str:
    """Get the stylesheet for the specified theme."""
    if theme == 'dark':
        return DARK_STYLESHEET
    return LIGHT_STYLESHEET
