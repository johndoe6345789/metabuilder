"""Surface components for FakeMUI."""

from PyQt6.QtWidgets import (
    QWidget, QFrame, QLabel, QVBoxLayout, QHBoxLayout,
    QPushButton, QScrollArea, QSizePolicy
)
from PyQt6.QtCore import Qt, pyqtSignal, QPropertyAnimation, QEasingCurve, QSize
from PyQt6.QtGui import QPixmap, QIcon

from .base import FakeMUIWidget, FakeMUIContainer, StyleMixin


class Paper(QFrame, StyleMixin):
    """Base surface component with elevation."""
    
    _base_class = 'paper'
    
    def __init__(
        self,
        parent=None,
        elevation: int = 1,
        square: bool = False,
        variant: str = 'elevation',  # elevation, outlined
    ):
        super().__init__(parent)
        
        modifiers = [f'elevation-{elevation}', variant]
        if square:
            modifiers.append('square')
        self.set_style_class(*modifiers)
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
    
    def add_widget(self, widget: QWidget):
        """Add a widget to the paper."""
        self._layout.addWidget(widget)


class Card(Paper):
    """Card component for displaying content."""
    
    _base_class = 'card'
    
    clicked = pyqtSignal()
    
    def __init__(
        self,
        parent=None,
        clickable: bool = False,
        raised: bool = False,
    ):
        super().__init__(parent, elevation=2 if raised else 1)
        
        modifiers = []
        if clickable:
            modifiers.append('clickable')
            self.setCursor(Qt.CursorShape.PointingHandCursor)
        if raised:
            modifiers.append('raised')
        self.set_style_class(*modifiers)
        
        self._clickable = clickable
    
    def mousePressEvent(self, event):
        """Handle click."""
        if self._clickable:
            self.clicked.emit()
        super().mousePressEvent(event)


class CardHeader(FakeMUIContainer):
    """Header section of a card."""
    
    _base_class = 'card-header'
    
    def __init__(
        self,
        parent=None,
        title: str = '',
        subheader: str = '',
        avatar: QWidget = None,
        action: QWidget = None,
    ):
        super().__init__(parent, 'horizontal')
        
        self.set_spacing(16)
        self.set_padding(16)
        
        # Avatar
        if avatar:
            avatar.setObjectName('card-header-avatar')
            self.add_widget(avatar)
        
        # Content
        content = FakeMUIContainer(layout_type='vertical')
        content.setObjectName('card-header-content')
        if title:
            title_label = QLabel(title)
            title_label.setObjectName('card-header-title')
            content.add_widget(title_label)
        if subheader:
            sub_label = QLabel(subheader)
            sub_label.setObjectName('card-header-subheader')
            content.add_widget(sub_label)
        self.add_widget(content, stretch=1)
        
        # Action
        if action:
            action.setObjectName('card-header-action')
            self.add_widget(action)


class CardContent(FakeMUIContainer):
    """Content section of a card."""
    
    _base_class = 'card-content'
    
    def __init__(self, parent=None):
        super().__init__(parent, 'vertical')
        self.set_padding(16)


class CardActions(FakeMUIContainer):
    """Actions section of a card."""
    
    _base_class = 'card-actions'
    
    def __init__(self, parent=None, disableSpacing: bool = False):
        super().__init__(parent, 'horizontal')
        
        if not disableSpacing:
            self.set_spacing(8)
        self.set_padding(8)
        
        if disableSpacing:
            self.add_modifier('no-spacing')


class CardActionArea(QPushButton, StyleMixin):
    """Clickable area within a card."""
    
    _base_class = 'card-action-area'
    
    def __init__(self, parent=None):
        super().__init__(parent)
        
        self.setFlat(True)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
    
    def add_widget(self, widget: QWidget):
        """Add a widget to the action area."""
        self._layout.addWidget(widget)


class CardMedia(QLabel, StyleMixin):
    """Media section of a card."""
    
    _base_class = 'card-media'
    
    def __init__(
        self,
        parent=None,
        image: str = '',
        alt: str = '',
        height: int = 140,
    ):
        super().__init__(parent)
        
        self.setFixedHeight(height)
        self.setScaledContents(True)
        
        if image:
            self.set_image(image)
        
        if alt:
            self.setAccessibleName(alt)
    
    def set_image(self, image: str):
        """Set the media image."""
        pixmap = QPixmap(image)
        if not pixmap.isNull():
            self.setPixmap(pixmap)


class Accordion(FakeMUIContainer):
    """Expandable panel component."""
    
    _base_class = 'accordion'
    
    expanded_changed = pyqtSignal(bool)
    
    def __init__(
        self,
        parent=None,
        expanded: bool = False,
        disabled: bool = False,
    ):
        super().__init__(parent, 'vertical')
        
        self._expanded = expanded
        self._summary = None
        self._details = None
        
        modifiers = []
        if expanded:
            modifiers.append('expanded')
        if disabled:
            modifiers.append('disabled')
        self.set_style_class(*modifiers)
    
    def set_summary(self, summary: 'AccordionSummary'):
        """Set the accordion summary."""
        self._summary = summary
        self.add_widget(summary)
        summary.clicked.connect(self.toggle)
    
    def set_details(self, details: 'AccordionDetails'):
        """Set the accordion details."""
        self._details = details
        self.add_widget(details)
        details.setVisible(self._expanded)
    
    def toggle(self):
        """Toggle expanded state."""
        self._expanded = not self._expanded
        if self._details:
            self._details.setVisible(self._expanded)
        if self._expanded:
            self.add_modifier('expanded')
        else:
            self.remove_modifier('expanded')
        self.expanded_changed.emit(self._expanded)
    
    def is_expanded(self) -> bool:
        """Get expanded state."""
        return self._expanded


class AccordionSummary(QPushButton, StyleMixin):
    """Summary/header of an accordion."""
    
    _base_class = 'accordion-summary'
    
    def __init__(
        self,
        parent=None,
        expandIcon: QIcon = None,
    ):
        super().__init__(parent)
        
        self.setFlat(True)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        
        self._layout = QHBoxLayout(self)
        self._layout.setContentsMargins(16, 12, 16, 12)
        
        self._content = QLabel()
        self._layout.addWidget(self._content, stretch=1)
        
        if expandIcon:
            self._icon = QLabel()
            self._icon.setPixmap(expandIcon.pixmap(24, 24))
            self._layout.addWidget(self._icon)
    
    def set_content(self, text: str):
        """Set summary text."""
        self._content.setText(text)


class AccordionDetails(FakeMUIContainer):
    """Details/content of an accordion."""
    
    _base_class = 'accordion-details'
    
    def __init__(self, parent=None):
        super().__init__(parent, 'vertical')
        self.set_padding(16)


class AccordionActions(FakeMUIContainer):
    """Actions section of an accordion."""
    
    _base_class = 'accordion-actions'
    
    def __init__(self, parent=None):
        super().__init__(parent, 'horizontal')
        self.set_spacing(8)
        self.set_padding(8)


class AppBar(QFrame, StyleMixin):
    """Top application bar."""
    
    _base_class = 'app-bar'
    
    def __init__(
        self,
        parent=None,
        position: str = 'fixed',  # fixed, absolute, sticky, static
        color: str = 'primary',
    ):
        super().__init__(parent)
        
        self.set_style_class(position, color)
        
        self._layout = QHBoxLayout(self)
        self._layout.setContentsMargins(16, 0, 16, 0)
        
        self.setFixedHeight(64)
    
    def add_widget(self, widget: QWidget, stretch: int = 0):
        """Add a widget to the app bar."""
        self._layout.addWidget(widget, stretch)


class Toolbar(FakeMUIContainer):
    """Toolbar component."""
    
    _base_class = 'toolbar'
    
    def __init__(
        self,
        parent=None,
        variant: str = 'regular',  # regular, dense
        disableGutters: bool = False,
    ):
        super().__init__(parent, 'horizontal')
        
        modifiers = [variant]
        if disableGutters:
            modifiers.append('no-gutters')
        self.set_style_class(*modifiers)
        
        if variant == 'dense':
            self.setMinimumHeight(48)
        else:
            self.setMinimumHeight(64)
        
        if not disableGutters:
            self.set_padding(16)


class Drawer(QFrame, StyleMixin):
    """Side navigation drawer."""
    
    _base_class = 'drawer'
    
    onClose = pyqtSignal()
    
    def __init__(
        self,
        parent=None,
        anchor: str = 'left',  # left, right, top, bottom
        variant: str = 'temporary',  # permanent, persistent, temporary
        open: bool = False,
        width: int = 256,
    ):
        super().__init__(parent)
        
        self._anchor = anchor
        self._variant = variant
        self._width = width
        
        self.set_style_class(anchor, variant)
        
        if anchor in ('left', 'right'):
            self.setFixedWidth(width)
        else:
            self.setFixedHeight(width)
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
        
        if variant == 'temporary':
            self.setVisible(open)
    
    def add_widget(self, widget: QWidget):
        """Add a widget to the drawer."""
        self._layout.addWidget(widget)
    
    def set_open(self, open: bool):
        """Set drawer visibility."""
        if self._variant == 'temporary':
            self.setVisible(open)
            if not open:
                self.onClose.emit()
    
    def toggle(self):
        """Toggle drawer visibility."""
        self.set_open(not self.isVisible())
