"""Base classes and utilities for FakeMUI widgets."""

from PyQt6.QtWidgets import QWidget, QFrame, QVBoxLayout, QHBoxLayout
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QColor, QPalette


class StyleMixin:
    """Mixin for applying CSS-like styling to widgets."""
    
    _base_class = ''
    
    def _build_class_string(self, *modifiers: str) -> str:
        """Build a CSS-like class string from modifiers."""
        classes = [self._base_class] if self._base_class else []
        classes.extend(f"{self._base_class}--{mod}" for mod in modifiers if mod)
        return ' '.join(classes)
    
    def set_style_class(self, *modifiers: str):
        """Set the object name to reflect CSS-like classes."""
        self.setObjectName(self._build_class_string(*modifiers))
    
    def add_modifier(self, modifier: str):
        """Add a modifier to the current class string."""
        current = self.objectName()
        if f"--{modifier}" not in current:
            self.setObjectName(f"{current} {self._base_class}--{modifier}")
    
    def remove_modifier(self, modifier: str):
        """Remove a modifier from the current class string."""
        current = self.objectName()
        self.setObjectName(current.replace(f" {self._base_class}--{modifier}", ""))


class FakeMUIWidget(QFrame, StyleMixin):
    """Base class for all FakeMUI widgets."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName(self._base_class)
    
    def set_padding(self, padding: int):
        """Set padding via content margins."""
        if self.layout():
            self.layout().setContentsMargins(padding, padding, padding, padding)
    
    def set_margin(self, margin: int):
        """Set external margin via stylesheet."""
        self.setStyleSheet(f"margin: {margin}px;")


class FakeMUIContainer(FakeMUIWidget):
    """Base container with layout support."""
    
    def __init__(self, parent=None, layout_type='vertical'):
        super().__init__(parent)
        if layout_type == 'vertical':
            self._layout = QVBoxLayout(self)
        else:
            self._layout = QHBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
        self._layout.setSpacing(0)
    
    def add_widget(self, widget: QWidget, stretch: int = 0):
        """Add a widget to the container."""
        self._layout.addWidget(widget, stretch)
    
    def add_spacing(self, spacing: int):
        """Add spacing between widgets."""
        self._layout.addSpacing(spacing)
    
    def add_stretch(self, stretch: int = 1):
        """Add stretch to fill remaining space."""
        self._layout.addStretch(stretch)
    
    def set_spacing(self, spacing: int):
        """Set spacing between all items."""
        self._layout.setSpacing(spacing)
    
    def clear(self):
        """Remove all widgets from the container."""
        while self._layout.count():
            item = self._layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()


# Theme colors
THEME_COLORS = {
    'primary': '#1976d2',
    'primary_light': '#42a5f5',
    'primary_dark': '#1565c0',
    'secondary': '#9c27b0',
    'secondary_light': '#ba68c8',
    'secondary_dark': '#7b1fa2',
    'error': '#d32f2f',
    'error_light': '#ef5350',
    'error_dark': '#c62828',
    'warning': '#ed6c02',
    'warning_light': '#ff9800',
    'warning_dark': '#e65100',
    'info': '#0288d1',
    'info_light': '#03a9f4',
    'info_dark': '#01579b',
    'success': '#2e7d32',
    'success_light': '#4caf50',
    'success_dark': '#1b5e20',
    'grey_50': '#fafafa',
    'grey_100': '#f5f5f5',
    'grey_200': '#eeeeee',
    'grey_300': '#e0e0e0',
    'grey_400': '#bdbdbd',
    'grey_500': '#9e9e9e',
    'grey_600': '#757575',
    'grey_700': '#616161',
    'grey_800': '#424242',
    'grey_900': '#212121',
    'text_primary': 'rgba(0, 0, 0, 0.87)',
    'text_secondary': 'rgba(0, 0, 0, 0.6)',
    'text_disabled': 'rgba(0, 0, 0, 0.38)',
    'background_default': '#fafafa',
    'background_paper': '#ffffff',
    'divider': 'rgba(0, 0, 0, 0.12)',
}

DARK_THEME_COLORS = {
    'primary': '#90caf9',
    'primary_light': '#e3f2fd',
    'primary_dark': '#42a5f5',
    'secondary': '#ce93d8',
    'secondary_light': '#f3e5f5',
    'secondary_dark': '#ab47bc',
    'error': '#f44336',
    'error_light': '#e57373',
    'error_dark': '#d32f2f',
    'warning': '#ffa726',
    'warning_light': '#ffb74d',
    'warning_dark': '#f57c00',
    'info': '#29b6f6',
    'info_light': '#4fc3f7',
    'info_dark': '#0288d1',
    'success': '#66bb6a',
    'success_light': '#81c784',
    'success_dark': '#388e3c',
    'grey_50': '#212121',
    'grey_100': '#303030',
    'grey_200': '#424242',
    'grey_300': '#616161',
    'grey_400': '#757575',
    'grey_500': '#9e9e9e',
    'grey_600': '#bdbdbd',
    'grey_700': '#e0e0e0',
    'grey_800': '#eeeeee',
    'grey_900': '#f5f5f5',
    'text_primary': 'rgba(255, 255, 255, 0.87)',
    'text_secondary': 'rgba(255, 255, 255, 0.6)',
    'text_disabled': 'rgba(255, 255, 255, 0.38)',
    'background_default': '#121212',
    'background_paper': '#1e1e1e',
    'divider': 'rgba(255, 255, 255, 0.12)',
}
