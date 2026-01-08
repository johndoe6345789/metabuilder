"""Data display components for FakeMUI."""

from PyQt6.QtWidgets import (
    QWidget, QLabel, QFrame, QVBoxLayout, QHBoxLayout,
    QListWidget, QListWidgetItem, QTableWidget, QTableWidgetItem,
    QHeaderView, QToolTip, QPushButton, QSizePolicy
)
from PyQt6.QtCore import Qt, pyqtSignal, QSize, QPoint
from PyQt6.QtGui import QPixmap, QColor, QPainter, QBrush, QPen, QFont, QIcon

from .base import FakeMUIWidget, FakeMUIContainer, StyleMixin


class Avatar(QLabel, StyleMixin):
    """Circular avatar component."""
    
    _base_class = 'avatar'
    
    def __init__(
        self,
        parent=None,
        src: str = '',
        alt: str = '',
        size: int = 40,
        variant: str = 'circular',  # circular, rounded, square
        color: str = 'default',
    ):
        super().__init__(parent)
        
        self._size = size
        self._variant = variant
        self._alt = alt
        
        self.set_style_class(variant, color)
        self.setFixedSize(size, size)
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        if src:
            self.set_image(src)
        elif alt:
            self._show_initials(alt)
    
    def set_image(self, src: str):
        """Set avatar image from file path."""
        pixmap = QPixmap(src)
        if not pixmap.isNull():
            scaled = pixmap.scaled(
                self._size, self._size,
                Qt.AspectRatioMode.KeepAspectRatioByExpanding,
                Qt.TransformationMode.SmoothTransformation
            )
            self.setPixmap(scaled)
    
    def _show_initials(self, text: str):
        """Show initials when no image."""
        initials = ''.join(word[0].upper() for word in text.split()[:2])
        self.setText(initials)


class AvatarGroup(FakeMUIContainer):
    """Group of overlapping avatars."""
    
    _base_class = 'avatar-group'
    
    def __init__(self, parent=None, max_count: int = 5, spacing: int = -8):
        super().__init__(parent, 'horizontal')
        self._max_count = max_count
        self._spacing = spacing
        self._avatars = []
    
    def add_avatar(self, avatar: Avatar):
        """Add an avatar to the group."""
        if len(self._avatars) < self._max_count:
            self._avatars.append(avatar)
            self.add_widget(avatar)


class Badge(FakeMUIContainer):
    """Badge component to display status or count."""
    
    _base_class = 'badge'
    
    def __init__(
        self,
        parent=None,
        content: str = '',
        color: str = 'primary',
        variant: str = 'standard',  # standard, dot
        invisible: bool = False,
        max_count: int = 99,
    ):
        super().__init__(parent, 'horizontal')
        
        self._badge_label = QLabel()
        self._badge_label.setObjectName('badge-content')
        self._max_count = max_count
        
        self.set_style_class(color, variant)
        self.set_content(content)
        self.set_invisible(invisible)
    
    def set_content(self, content: str):
        """Set badge content."""
        if content.isdigit():
            num = int(content)
            if num > self._max_count:
                content = f"{self._max_count}+"
        self._badge_label.setText(content)
    
    def set_invisible(self, invisible: bool):
        """Set badge visibility."""
        self._badge_label.setVisible(not invisible)


class Chip(QPushButton, StyleMixin):
    """Compact element for input, attributes, or actions."""
    
    _base_class = 'chip'
    
    onDelete = pyqtSignal()
    
    def __init__(
        self,
        label: str = '',
        parent=None,
        icon: QIcon = None,
        avatar: Avatar = None,
        color: str = 'default',
        variant: str = 'filled',  # filled, outlined
        size: str = 'medium',
        clickable: bool = False,
        deletable: bool = False,
    ):
        super().__init__(label, parent)
        
        modifiers = [color, variant, size]
        if clickable:
            modifiers.append('clickable')
        if deletable:
            modifiers.append('deletable')
        self.set_style_class(*modifiers)
        
        if icon:
            self.setIcon(icon)
        
        self._apply_style()
    
    def _apply_style(self):
        """Apply chip styling."""
        self.setMinimumHeight(32)


class Divider(QFrame, StyleMixin):
    """Visual divider line."""
    
    _base_class = 'divider'
    
    def __init__(
        self,
        parent=None,
        orientation: str = 'horizontal',
        variant: str = 'fullWidth',  # fullWidth, inset, middle
        text: str = '',
    ):
        super().__init__(parent)
        
        if orientation == 'vertical':
            self.setFrameShape(QFrame.Shape.VLine)
        else:
            self.setFrameShape(QFrame.Shape.HLine)
        
        self.setFrameShadow(QFrame.Shadow.Sunken)
        self.set_style_class(orientation, variant)


class Icon(QLabel, StyleMixin):
    """Icon display component."""
    
    _base_class = 'icon'
    
    def __init__(
        self,
        name: str = '',
        parent=None,
        size: str = 'medium',
        color: str = 'inherit',
    ):
        super().__init__(parent)
        
        self.set_style_class(size, color)
        self._name = name
        
        sizes = {'small': 18, 'medium': 24, 'large': 36, 'inherit': 24}
        s = sizes.get(size, 24)
        self.setFixedSize(s, s)
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)
    
    def set_icon(self, icon: QIcon):
        """Set icon from QIcon."""
        pixmap = icon.pixmap(self.size())
        self.setPixmap(pixmap)


class ListWidget(QFrame, StyleMixin):
    """Material-style list container."""
    
    _base_class = 'list'
    
    itemClicked = pyqtSignal(object)
    
    def __init__(
        self,
        parent=None,
        dense: bool = False,
        spaced: bool = False,
    ):
        super().__init__(parent)
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
        self._layout.setSpacing(0)
        self._items = []
        
        modifiers = []
        if dense:
            modifiers.append('dense')
        if spaced:
            modifiers.append('spaced')
        self.set_style_class(*modifiers)
    
    def add_item(self, item: 'ListItem'):
        """Add a list item."""
        self._items.append(item)
        self._layout.addWidget(item)
        item.clicked.connect(lambda: self.itemClicked.emit(item))
    
    def clear(self):
        """Remove all items."""
        for item in self._items:
            item.deleteLater()
        self._items.clear()


class ListItem(FakeMUIContainer):
    """List item component."""
    
    _base_class = 'list-item'
    
    clicked = pyqtSignal()
    
    def __init__(
        self,
        parent=None,
        clickable: bool = False,
        selected: bool = False,
        disabled: bool = False,
        borderless: bool = False,
    ):
        super().__init__(parent, 'horizontal')
        
        modifiers = []
        if clickable:
            modifiers.append('clickable')
        if selected:
            modifiers.append('selected')
        if disabled:
            modifiers.append('disabled')
        if borderless:
            modifiers.append('borderless')
        self.set_style_class(*modifiers)
        
        self._clickable = clickable
        if clickable:
            self.setCursor(Qt.CursorShape.PointingHandCursor)
    
    def mousePressEvent(self, event):
        """Handle click."""
        if self._clickable:
            self.clicked.emit()
        super().mousePressEvent(event)


class ListItemButton(QPushButton, StyleMixin):
    """Clickable list item."""
    
    _base_class = 'list-item-button'
    
    def __init__(
        self,
        parent=None,
        selected: bool = False,
    ):
        super().__init__(parent)
        
        modifiers = []
        if selected:
            modifiers.append('selected')
        self.set_style_class(*modifiers)
        
        self._apply_style()
    
    def _apply_style(self):
        """Apply list item button styling."""
        self.setFlat(True)
        self.setCursor(Qt.CursorShape.PointingHandCursor)


class ListItemIcon(QLabel, StyleMixin):
    """Icon for list item."""
    
    _base_class = 'list-item-icon'
    
    def __init__(self, icon: QIcon = None, parent=None):
        super().__init__(parent)
        
        self.setObjectName('list-item-icon')
        self.setFixedSize(40, 40)
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        if icon:
            self.setPixmap(icon.pixmap(24, 24))


class ListItemText(FakeMUIContainer):
    """Text content for list item."""
    
    _base_class = 'list-item-text'
    
    def __init__(
        self,
        primary: str = '',
        secondary: str = '',
        parent=None,
    ):
        super().__init__(parent, 'vertical')
        
        self.setObjectName('list-item-text')
        
        if primary:
            self._primary = QLabel(primary)
            self._primary.setObjectName('list-item-title')
            self.add_widget(self._primary)
        else:
            self._primary = None
        
        if secondary:
            self._secondary = QLabel(secondary)
            self._secondary.setObjectName('list-item-meta')
            self.add_widget(self._secondary)
        else:
            self._secondary = None
    
    def set_primary(self, text: str):
        """Set primary text."""
        if self._primary:
            self._primary.setText(text)
    
    def set_secondary(self, text: str):
        """Set secondary text."""
        if self._secondary:
            self._secondary.setText(text)


class ListItemAvatar(QFrame, StyleMixin):
    """Avatar container for list item."""
    
    _base_class = 'list-item-avatar'
    
    def __init__(self, avatar: Avatar = None, parent=None):
        super().__init__(parent)
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        if avatar:
            layout.addWidget(avatar)


class ListSubheader(QLabel, StyleMixin):
    """Subheader for list sections."""
    
    _base_class = 'list-subheader'
    
    def __init__(self, text: str = '', parent=None):
        super().__init__(text, parent)
        self.setObjectName('list-subheader')


class TableWidget(QTableWidget, StyleMixin):
    """Material-style table."""
    
    _base_class = 'table'
    
    def __init__(
        self,
        parent=None,
        columns: list = None,
        dense: bool = False,
        hover: bool = True,
    ):
        super().__init__(parent)
        
        if columns:
            self.setColumnCount(len(columns))
            self.setHorizontalHeaderLabels(columns)
        
        modifiers = []
        if dense:
            modifiers.append('dense')
        if hover:
            modifiers.append('hover')
        self.set_style_class(*modifiers)
        
        self._apply_style()
    
    def _apply_style(self):
        """Apply table styling."""
        self.horizontalHeader().setStretchLastSection(True)
        self.setAlternatingRowColors(True)
        self.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)


class TableHeader(QWidget):
    """Table header container (for compatibility)."""
    pass


class TableBody(QWidget):
    """Table body container (for compatibility)."""
    pass


class TableRow(QWidget):
    """Table row container (for compatibility)."""
    pass


class TableCell(QTableWidgetItem):
    """Table cell item."""
    
    def __init__(self, text: str = '', align: str = 'left'):
        super().__init__(text)
        
        alignments = {
            'left': Qt.AlignmentFlag.AlignLeft,
            'center': Qt.AlignmentFlag.AlignCenter,
            'right': Qt.AlignmentFlag.AlignRight,
        }
        self.setTextAlignment(alignments.get(align, Qt.AlignmentFlag.AlignLeft) | Qt.AlignmentFlag.AlignVCenter)


class Tooltip(QWidget):
    """Tooltip component - uses Qt's built-in tooltip."""
    
    @staticmethod
    def show(widget: QWidget, text: str, position: str = 'bottom'):
        """Show tooltip on a widget."""
        widget.setToolTip(text)
    
    @staticmethod
    def show_at(text: str, pos: QPoint):
        """Show tooltip at position."""
        QToolTip.showText(pos, text)


class Typography(QLabel, StyleMixin):
    """Text display with variants."""
    
    _base_class = 'typography'
    
    VARIANTS = {
        'h1': ('bold', 32),
        'h2': ('bold', 28),
        'h3': ('bold', 24),
        'h4': ('bold', 20),
        'h5': ('bold', 18),
        'h6': ('bold', 16),
        'subtitle1': ('medium', 16),
        'subtitle2': ('medium', 14),
        'body1': ('normal', 16),
        'body2': ('normal', 14),
        'caption': ('normal', 12),
        'overline': ('normal', 10),
        'button': ('bold', 14),
    }
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        variant: str = 'body1',
        color: str = 'textPrimary',
        align: str = 'left',
        noWrap: bool = False,
        gutterBottom: bool = False,
    ):
        super().__init__(text, parent)
        
        modifiers = [variant, color]
        if noWrap:
            modifiers.append('nowrap')
        if gutterBottom:
            modifiers.append('gutter-bottom')
        self.set_style_class(*modifiers)
        
        # Set font based on variant
        weight, size = self.VARIANTS.get(variant, ('normal', 14))
        font = self.font()
        font.setPointSize(size)
        if weight == 'bold':
            font.setBold(True)
        elif weight == 'medium':
            font.setWeight(QFont.Weight.Medium)
        self.setFont(font)
        
        # Set alignment
        alignments = {
            'left': Qt.AlignmentFlag.AlignLeft,
            'center': Qt.AlignmentFlag.AlignCenter,
            'right': Qt.AlignmentFlag.AlignRight,
            'justify': Qt.AlignmentFlag.AlignJustify,
        }
        self.setAlignment(alignments.get(align, Qt.AlignmentFlag.AlignLeft))
        
        if not noWrap:
            self.setWordWrap(True)
