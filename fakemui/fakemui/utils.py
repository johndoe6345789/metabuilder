"""Utility components for FakeMUI."""

from PyQt6.QtWidgets import (
    QWidget, QFrame, QDialog, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QGraphicsOpacityEffect, QApplication
)
from PyQt6.QtCore import (
    Qt, pyqtSignal, QPropertyAnimation, QEasingCurve,
    QPoint, QTimer, QEvent, QObject
)
from PyQt6.QtGui import QColor

from .base import FakeMUIWidget, FakeMUIContainer, StyleMixin, THEME_COLORS, DARK_THEME_COLORS


class Modal(QDialog, StyleMixin):
    """Modal dialog component."""
    
    _base_class = 'modal'
    
    onClose = pyqtSignal()
    
    def __init__(
        self,
        parent=None,
        open: bool = False,
        closeOnBackdropClick: bool = True,
        closeOnEscape: bool = True,
    ):
        super().__init__(parent)
        
        self._close_on_backdrop = closeOnBackdropClick
        self._close_on_escape = closeOnEscape
        
        self.setModal(True)
        self.setWindowFlags(
            Qt.WindowType.Dialog |
            Qt.WindowType.FramelessWindowHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        
        # Main layout with backdrop
        self._main_layout = QVBoxLayout(self)
        self._main_layout.setContentsMargins(0, 0, 0, 0)
        
        # Backdrop
        self._backdrop = QFrame()
        self._backdrop.setStyleSheet('background-color: rgba(0, 0, 0, 0.5);')
        self._backdrop.mousePressEvent = self._backdrop_clicked
        
        # Content container
        self._content = QFrame()
        self._content.setObjectName('modal-content')
        self._content_layout = QVBoxLayout(self._content)
        
        if open:
            self.show()
    
    def _backdrop_clicked(self, event):
        """Handle backdrop click."""
        if self._close_on_backdrop:
            self.close_modal()
    
    def keyPressEvent(self, event):
        """Handle key press."""
        if event.key() == Qt.Key.Key_Escape and self._close_on_escape:
            self.close_modal()
        else:
            super().keyPressEvent(event)
    
    def close_modal(self):
        """Close the modal."""
        self.onClose.emit()
        self.hide()
    
    def add_widget(self, widget: QWidget):
        """Add widget to modal content."""
        self._content_layout.addWidget(widget)


class Dialog(Modal):
    """Dialog component (alias for Modal with additional structure)."""
    
    _base_class = 'dialog'
    
    def __init__(
        self,
        parent=None,
        open: bool = False,
        fullWidth: bool = False,
        maxWidth: str = 'sm',  # xs, sm, md, lg, xl
        fullScreen: bool = False,
    ):
        super().__init__(parent, open)
        
        modifiers = [maxWidth]
        if fullWidth:
            modifiers.append('full-width')
        if fullScreen:
            modifiers.append('full-screen')
        self.set_style_class(*modifiers)
        
        # Max widths
        max_widths = {
            'xs': 444,
            'sm': 600,
            'md': 900,
            'lg': 1200,
            'xl': 1536,
        }
        
        if fullScreen:
            self.showFullScreen()
        elif maxWidth in max_widths:
            self._content.setMaximumWidth(max_widths[maxWidth])


class DialogOverlay(QFrame, StyleMixin):
    """Dialog backdrop/overlay."""
    
    _base_class = 'dialog-overlay'
    
    clicked = pyqtSignal()
    
    def __init__(self, parent=None):
        super().__init__(parent)
        
        self.setStyleSheet('background-color: rgba(0, 0, 0, 0.5);')
    
    def mousePressEvent(self, event):
        """Handle click."""
        self.clicked.emit()


class DialogHeader(FakeMUIContainer):
    """Dialog header section."""
    
    _base_class = 'dialog-header'
    
    def __init__(self, parent=None):
        super().__init__(parent, 'horizontal')
        self.set_padding(16)


class DialogTitle(QLabel, StyleMixin):
    """Dialog title."""
    
    _base_class = 'dialog-title'
    
    def __init__(self, text: str = '', parent=None):
        super().__init__(text, parent)
        
        font = self.font()
        font.setPointSize(18)
        font.setBold(True)
        self.setFont(font)


class DialogContent(FakeMUIContainer):
    """Dialog content section."""
    
    _base_class = 'dialog-content'
    
    def __init__(self, parent=None, dividers: bool = False):
        super().__init__(parent, 'vertical')
        self.set_padding(16)
        
        if dividers:
            self.add_modifier('dividers')


class DialogActions(FakeMUIContainer):
    """Dialog actions section."""
    
    _base_class = 'dialog-actions'
    
    def __init__(self, parent=None):
        super().__init__(parent, 'horizontal')
        self.set_padding(8)
        self.set_spacing(8)
        self._layout.addStretch()  # Right-align buttons


class Popover(QFrame, StyleMixin):
    """Popover component for displaying content near an anchor."""
    
    _base_class = 'popover'
    
    onClose = pyqtSignal()
    
    def __init__(
        self,
        parent=None,
        anchorEl: QWidget = None,
        open: bool = False,
        anchorOrigin: dict = None,  # {'vertical': 'bottom', 'horizontal': 'left'}
        transformOrigin: dict = None,
    ):
        super().__init__(parent, Qt.WindowType.Popup)
        
        self._anchor = anchorEl
        self._anchor_origin = anchorOrigin or {'vertical': 'bottom', 'horizontal': 'left'}
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
        
        self.setWindowFlags(Qt.WindowType.Popup | Qt.WindowType.FramelessWindowHint)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        
        if open:
            self.show_popover()
    
    def add_widget(self, widget: QWidget):
        """Add widget to popover."""
        self._layout.addWidget(widget)
    
    def show_popover(self):
        """Show popover at anchor position."""
        if self._anchor:
            pos = self._anchor.mapToGlobal(QPoint(0, 0))
            
            v = self._anchor_origin.get('vertical', 'bottom')
            h = self._anchor_origin.get('horizontal', 'left')
            
            if v == 'bottom':
                pos.setY(pos.y() + self._anchor.height())
            elif v == 'center':
                pos.setY(pos.y() + self._anchor.height() // 2)
            
            if h == 'right':
                pos.setX(pos.x() + self._anchor.width())
            elif h == 'center':
                pos.setX(pos.x() + self._anchor.width() // 2)
            
            self.move(pos)
        
        self.show()
    
    def close_popover(self):
        """Close popover."""
        self.onClose.emit()
        self.hide()


class Collapse(QFrame, StyleMixin):
    """Collapsible content component."""
    
    _base_class = 'collapse'
    
    def __init__(
        self,
        parent=None,
        expanded: bool = False,
        collapsedSize: int = 0,
        orientation: str = 'vertical',
    ):
        super().__init__(parent)
        
        self._expanded = expanded
        self._collapsed_size = collapsedSize
        self._orientation = orientation
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
        
        self._content = QFrame()
        self._content_layout = QVBoxLayout(self._content)
        self._layout.addWidget(self._content)
        
        # Animation
        self._animation = QPropertyAnimation(self, b"maximumHeight")
        self._animation.setDuration(300)
        self._animation.setEasingCurve(QEasingCurve.Type.InOutQuad)
        
        if not expanded:
            self.setMaximumHeight(collapsedSize)
    
    def add_widget(self, widget: QWidget):
        """Add widget to collapsible content."""
        self._content_layout.addWidget(widget)
    
    def set_expanded(self, expanded: bool):
        """Set expanded state with animation."""
        self._expanded = expanded
        
        if expanded:
            self._animation.setStartValue(self.height())
            self._animation.setEndValue(self._content.sizeHint().height())
        else:
            self._animation.setStartValue(self.height())
            self._animation.setEndValue(self._collapsed_size)
        
        self._animation.start()
    
    def toggle(self):
        """Toggle expanded state."""
        self.set_expanded(not self._expanded)


class Fade(QWidget, StyleMixin):
    """Fade transition component."""
    
    _base_class = 'fade'
    
    def __init__(
        self,
        parent=None,
        visible: bool = True,
        duration: int = 225,
    ):
        super().__init__(parent)
        
        self._duration = duration
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
        
        self._opacity_effect = QGraphicsOpacityEffect(self)
        self.setGraphicsEffect(self._opacity_effect)
        
        self._animation = QPropertyAnimation(self._opacity_effect, b"opacity")
        self._animation.setDuration(duration)
        self._animation.setEasingCurve(QEasingCurve.Type.InOutQuad)
        
        self._opacity_effect.setOpacity(1.0 if visible else 0.0)
    
    def add_widget(self, widget: QWidget):
        """Add widget to fade container."""
        self._layout.addWidget(widget)
    
    def fade_in(self):
        """Fade in animation."""
        self._animation.setStartValue(0.0)
        self._animation.setEndValue(1.0)
        self.show()
        self._animation.start()
    
    def fade_out(self):
        """Fade out animation."""
        self._animation.setStartValue(1.0)
        self._animation.setEndValue(0.0)
        self._animation.finished.connect(self.hide)
        self._animation.start()


class ClickAwayListener(QObject):
    """Detects clicks outside of a component."""
    
    clickedAway = pyqtSignal()
    
    def __init__(self, target: QWidget, parent=None):
        super().__init__(parent)
        
        self._target = target
        QApplication.instance().installEventFilter(self)
    
    def eventFilter(self, obj: QObject, event: QEvent) -> bool:
        """Filter events to detect clicks outside target."""
        if event.type() == QEvent.Type.MouseButtonPress:
            if not self._target.geometry().contains(event.globalPosition().toPoint()):
                self.clickedAway.emit()
        return False
    
    def stop(self):
        """Stop listening for clicks."""
        QApplication.instance().removeEventFilter(self)


# Theme management
_current_theme = 'light'
_theme_colors = THEME_COLORS.copy()


def apply_theme(theme: str = 'light'):
    """Apply a theme to the application."""
    global _current_theme, _theme_colors
    
    _current_theme = theme
    if theme == 'dark':
        _theme_colors = DARK_THEME_COLORS.copy()
    else:
        _theme_colors = THEME_COLORS.copy()
    
    # Generate and apply stylesheet
    app = QApplication.instance()
    if app:
        stylesheet = _generate_stylesheet()
        app.setStyleSheet(stylesheet)


def get_theme() -> str:
    """Get the current theme name."""
    return _current_theme


def _generate_stylesheet() -> str:
    """Generate the complete stylesheet based on current theme."""
    colors = _theme_colors
    
    return f"""
    /* Base styles */
    QWidget {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        color: {colors['text_primary']};
    }}
    
    /* Button styles */
    QPushButton[objectName^="btn"] {{
        padding: 8px 16px;
        border-radius: 4px;
        border: none;
        background-color: {colors['grey_200']};
    }}
    
    QPushButton[objectName*="--primary"] {{
        background-color: {colors['primary']};
        color: white;
    }}
    
    QPushButton[objectName*="--secondary"] {{
        background-color: {colors['secondary']};
        color: white;
    }}
    
    QPushButton[objectName*="--outline"] {{
        background-color: transparent;
        border: 1px solid {colors['primary']};
        color: {colors['primary']};
    }}
    
    QPushButton[objectName*="--ghost"] {{
        background-color: transparent;
        color: {colors['primary']};
    }}
    
    QPushButton:hover {{
        background-color: {colors['grey_300']};
    }}
    
    QPushButton[objectName*="--primary"]:hover {{
        background-color: {colors['primary_dark']};
    }}
    
    QPushButton:disabled {{
        background-color: {colors['grey_200']};
        color: {colors['text_disabled']};
    }}
    
    /* Input styles */
    QLineEdit[objectName^="input"], QTextEdit[objectName^="textarea"] {{
        padding: 8px 12px;
        border: 1px solid {colors['grey_400']};
        border-radius: 4px;
        background-color: {colors['background_paper']};
    }}
    
    QLineEdit[objectName*="--error"], QTextEdit[objectName*="--error"] {{
        border-color: {colors['error']};
    }}
    
    QLineEdit:focus, QTextEdit:focus {{
        border-color: {colors['primary']};
    }}
    
    /* Card styles */
    QFrame[objectName^="card"] {{
        background-color: {colors['background_paper']};
        border-radius: 4px;
        border: 1px solid {colors['divider']};
    }}
    
    QFrame[objectName*="--raised"] {{
        border: none;
    }}
    
    /* Paper styles */
    QFrame[objectName^="paper"] {{
        background-color: {colors['background_paper']};
        border-radius: 4px;
    }}
    
    /* Alert styles */
    QFrame[objectName^="alert"] {{
        padding: 12px;
        border-radius: 4px;
    }}
    
    QFrame[objectName*="--info"] {{
        background-color: {colors['info_light']};
        color: {colors['info_dark']};
    }}
    
    QFrame[objectName*="--success"] {{
        background-color: {colors['success_light']};
        color: {colors['success_dark']};
    }}
    
    QFrame[objectName*="--warning"] {{
        background-color: {colors['warning_light']};
        color: {colors['warning_dark']};
    }}
    
    QFrame[objectName*="--error"] {{
        background-color: {colors['error_light']};
        color: {colors['error_dark']};
    }}
    
    /* Chip styles */
    QPushButton[objectName^="chip"] {{
        padding: 4px 12px;
        border-radius: 16px;
    }}
    
    /* List styles */
    QFrame[objectName^="list"] {{
        background-color: {colors['background_paper']};
    }}
    
    QFrame[objectName^="list-item"]:hover {{
        background-color: {colors['grey_100']};
    }}
    
    QFrame[objectName*="--selected"] {{
        background-color: {colors['primary_light']};
    }}
    
    /* Tab styles */
    QPushButton[objectName^="tab"] {{
        padding: 12px 16px;
        border: none;
        border-bottom: 2px solid transparent;
        background-color: transparent;
    }}
    
    QPushButton[objectName*="--active"] {{
        border-bottom-color: {colors['primary']};
        color: {colors['primary']};
    }}
    
    /* Divider */
    QFrame[objectName^="divider"] {{
        background-color: {colors['divider']};
    }}
    
    /* Typography */
    QLabel[objectName*="--textSecondary"] {{
        color: {colors['text_secondary']};
    }}
    
    QLabel[objectName*="--textDisabled"] {{
        color: {colors['text_disabled']};
    }}
    
    /* Skeleton */
    QFrame[objectName^="skeleton"] {{
        background-color: {colors['grey_300']};
        border-radius: 4px;
    }}
    
    /* Progress bar */
    QProgressBar {{
        background-color: {colors['grey_200']};
        border: none;
        border-radius: 2px;
    }}
    
    QProgressBar::chunk {{
        background-color: {colors['primary']};
        border-radius: 2px;
    }}
    
    /* Drawer */
    QFrame[objectName^="drawer"] {{
        background-color: {colors['background_paper']};
        border-right: 1px solid {colors['divider']};
    }}
    
    /* AppBar */
    QFrame[objectName^="app-bar"] {{
        background-color: {colors['primary']};
        color: white;
    }}
    """


class ThemeProvider(QWidget):
    """Context provider for theming."""
    
    def __init__(self, parent=None, theme: str = 'light'):
        super().__init__(parent)
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
        
        apply_theme(theme)
    
    def add_widget(self, widget: QWidget):
        """Add widget to theme provider."""
        self._layout.addWidget(widget)
    
    def set_theme(self, theme: str):
        """Change the theme."""
        apply_theme(theme)
