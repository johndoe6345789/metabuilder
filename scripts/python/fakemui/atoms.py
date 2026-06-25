"""Atom components for FakeMUI - Higher-level composed components."""

from PyQt6.QtWidgets import (
    QWidget, QFrame, QLabel, QVBoxLayout, QHBoxLayout,
    QGridLayout, QPushButton, QSizePolicy
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QIcon

from .base import FakeMUIWidget, FakeMUIContainer, StyleMixin
from .feedback import Spinner


class Title(QLabel, StyleMixin):
    """Large title text."""
    
    _base_class = 'title'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        level: int = 1,  # 1-6, maps to h1-h6
    ):
        super().__init__(text, parent)
        
        self.set_style_class(f'h{level}')
        
        # Font sizes for heading levels
        sizes = {1: 32, 2: 28, 3: 24, 4: 20, 5: 18, 6: 16}
        font = self.font()
        font.setPointSize(sizes.get(level, 24))
        font.setBold(True)
        self.setFont(font)


class Subtitle(QLabel, StyleMixin):
    """Subtitle text."""
    
    _base_class = 'subtitle'
    
    def __init__(self, text: str = '', parent=None, level: int = 1):
        super().__init__(text, parent)
        
        self.set_style_class(f'level-{level}')
        
        font = self.font()
        font.setPointSize(16 if level == 1 else 14)
        self.setFont(font)


class Label(QLabel, StyleMixin):
    """Form label or small text label."""
    
    _base_class = 'label'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        required: bool = False,
        color: str = 'default',
    ):
        display_text = f"{text} *" if required else text
        super().__init__(display_text, parent)
        
        modifiers = [color]
        if required:
            modifiers.append('required')
        self.set_style_class(*modifiers)


class Text(QLabel, StyleMixin):
    """General purpose text component."""
    
    _base_class = 'text'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        variant: str = 'body',  # body, caption, overline
        color: str = 'primary',
        align: str = 'left',
        wrap: bool = True,
    ):
        super().__init__(text, parent)
        
        self.set_style_class(variant, f'color-{color}')
        
        # Variant font sizes
        sizes = {'body': 14, 'caption': 12, 'overline': 10}
        font = self.font()
        font.setPointSize(sizes.get(variant, 14))
        self.setFont(font)
        
        # Alignment
        alignments = {
            'left': Qt.AlignmentFlag.AlignLeft,
            'center': Qt.AlignmentFlag.AlignCenter,
            'right': Qt.AlignmentFlag.AlignRight,
        }
        self.setAlignment(alignments.get(align, Qt.AlignmentFlag.AlignLeft))
        self.setWordWrap(wrap)


class StatBadge(FakeMUIContainer):
    """Badge for displaying statistics."""
    
    _base_class = 'stat-badge'
    
    def __init__(
        self,
        label: str = '',
        value: str = '',
        parent=None,
        color: str = 'primary',
        size: str = 'medium',
    ):
        super().__init__(parent, 'vertical')
        
        self.set_style_class(color, size)
        self.set_spacing(4)
        
        # Value
        value_label = QLabel(str(value))
        value_label.setObjectName('stat-value')
        font = value_label.font()
        font.setPointSize(24 if size == 'large' else 18)
        font.setBold(True)
        value_label.setFont(font)
        value_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.add_widget(value_label)
        
        # Label
        label_widget = QLabel(label)
        label_widget.setObjectName('stat-label')
        label_widget.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.add_widget(label_widget)


class Section(FakeMUIContainer):
    """Section container with optional header."""
    
    _base_class = 'section'
    
    def __init__(
        self,
        parent=None,
        title: str = '',
        collapsible: bool = False,
    ):
        super().__init__(parent, 'vertical')
        
        self._collapsible = collapsible
        self._expanded = True
        
        self.set_spacing(16)
        
        if title:
            self._header = SectionHeader(title, collapsible=collapsible)
            if collapsible:
                self._header.clicked.connect(self._toggle)
            self.add_widget(self._header)
        else:
            self._header = None
        
        self._content = SectionContent()
        self.add_widget(self._content)
    
    def _toggle(self):
        """Toggle section visibility."""
        self._expanded = not self._expanded
        self._content.setVisible(self._expanded)
    
    def add_content(self, widget: QWidget):
        """Add widget to section content."""
        self._content.add_widget(widget)


class SectionHeader(FakeMUIContainer):
    """Header for a section."""
    
    _base_class = 'section-header'
    
    clicked = pyqtSignal()
    
    def __init__(
        self,
        title: str = '',
        parent=None,
        collapsible: bool = False,
        action: QWidget = None,
    ):
        super().__init__(parent, 'horizontal')
        
        self._collapsible = collapsible
        
        # Title
        self._title = SectionTitle(title)
        self.add_widget(self._title, stretch=1)
        
        # Action
        if action:
            self.add_widget(action)
        
        if collapsible:
            self.setCursor(Qt.CursorShape.PointingHandCursor)
    
    def mousePressEvent(self, event):
        """Handle click."""
        if self._collapsible:
            self.clicked.emit()
        super().mousePressEvent(event)


class SectionTitle(QLabel, StyleMixin):
    """Title for a section."""
    
    _base_class = 'section-title'
    
    def __init__(self, text: str = '', parent=None):
        super().__init__(text, parent)
        
        font = self.font()
        font.setPointSize(16)
        font.setBold(True)
        self.setFont(font)


class SectionContent(FakeMUIContainer):
    """Content area of a section."""
    
    _base_class = 'section-content'
    
    def __init__(self, parent=None):
        super().__init__(parent, 'vertical')
        self.set_spacing(8)


class EmptyState(FakeMUIContainer):
    """Empty state placeholder."""
    
    _base_class = 'empty-state'
    
    def __init__(
        self,
        parent=None,
        icon: QIcon = None,
        title: str = 'No data',
        description: str = '',
        action: QWidget = None,
    ):
        super().__init__(parent, 'vertical')
        
        self.set_spacing(16)
        self._layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # Icon
        if icon:
            icon_label = QLabel()
            icon_label.setPixmap(icon.pixmap(64, 64))
            icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            self.add_widget(icon_label)
        
        # Title
        title_label = Title(title, level=3)
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.add_widget(title_label)
        
        # Description
        if description:
            desc_label = Text(description, color='secondary', align='center')
            self.add_widget(desc_label)
        
        # Action
        if action:
            self.add_widget(action)


class LoadingState(FakeMUIContainer):
    """Loading state placeholder."""
    
    _base_class = 'loading-state'
    
    def __init__(
        self,
        parent=None,
        message: str = 'Loading...',
        size: int = 40,
    ):
        super().__init__(parent, 'vertical')
        
        self.set_spacing(16)
        self._layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # Spinner
        spinner = Spinner(size=size)
        self.add_widget(spinner)
        
        # Message
        if message:
            msg_label = Text(message, color='secondary', align='center')
            self.add_widget(msg_label)


class ErrorState(FakeMUIContainer):
    """Error state placeholder."""
    
    _base_class = 'error-state'
    
    retryClicked = pyqtSignal()
    
    def __init__(
        self,
        parent=None,
        title: str = 'Error',
        message: str = 'Something went wrong',
        retryText: str = 'Retry',
        showRetry: bool = True,
    ):
        super().__init__(parent, 'vertical')
        
        self.set_spacing(16)
        self._layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # Title
        title_label = Title(title, level=3)
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.add_widget(title_label)
        
        # Message
        msg_label = Text(message, color='secondary', align='center')
        self.add_widget(msg_label)
        
        # Retry button
        if showRetry:
            from .inputs import Button
            retry_btn = Button(retryText, primary=True)
            retry_btn.clicked.connect(self.retryClicked.emit)
            self.add_widget(retry_btn)


class Panel(FakeMUIContainer):
    """Panel container with optional header and footer."""
    
    _base_class = 'panel'
    
    def __init__(
        self,
        parent=None,
        title: str = '',
        elevation: int = 1,
    ):
        super().__init__(parent, 'vertical')
        
        self.set_style_class(f'elevation-{elevation}')
        
        # Header
        if title:
            header = FakeMUIContainer(layout_type='horizontal')
            header.setObjectName('panel-header')
            title_label = Title(title, level=4)
            header.add_widget(title_label)
            self.add_widget(header)
        
        # Content area
        self._content = FakeMUIContainer(layout_type='vertical')
        self._content.setObjectName('panel-content')
        self.add_widget(self._content, stretch=1)
    
    def add_content(self, widget: QWidget, stretch: int = 0):
        """Add widget to panel content."""
        self._content.add_widget(widget, stretch)


class AutoGrid(QFrame, StyleMixin):
    """Auto-sizing grid container."""
    
    _base_class = 'auto-grid'
    
    def __init__(
        self,
        parent=None,
        minChildWidth: int = 200,
        gap: int = 16,
        columns: int = None,  # If set, override auto calculation
    ):
        super().__init__(parent)
        
        self._min_child_width = minChildWidth
        self._gap = gap
        self._columns = columns
        self._items = []
        
        self._layout = QGridLayout(self)
        self._layout.setSpacing(gap)
        self._layout.setContentsMargins(0, 0, 0, 0)
    
    def add_widget(self, widget: QWidget):
        """Add a widget to the grid."""
        self._items.append(widget)
        self._relayout()
    
    def _relayout(self):
        """Recalculate grid layout."""
        # Clear current layout
        while self._layout.count():
            self._layout.takeAt(0)
        
        # Calculate columns
        if self._columns:
            cols = self._columns
        else:
            width = self.width() or 600
            cols = max(1, width // (self._min_child_width + self._gap))
        
        # Add items
        for i, item in enumerate(self._items):
            row = i // cols
            col = i % cols
            self._layout.addWidget(item, row, col)
    
    def resizeEvent(self, event):
        """Handle resize to recalculate grid."""
        super().resizeEvent(event)
        self._relayout()
