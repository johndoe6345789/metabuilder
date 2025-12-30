"""Layout components for FakeMUI."""

from PyQt6.QtWidgets import (
    QWidget, QFrame, QVBoxLayout, QHBoxLayout, QGridLayout,
    QScrollArea, QSizePolicy, QLabel, QSpacerItem
)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QPixmap

from .base import FakeMUIWidget, FakeMUIContainer, StyleMixin


class Box(QFrame, StyleMixin):
    """Generic container component."""
    
    _base_class = 'box'
    
    def __init__(
        self,
        parent=None,
        component: str = 'div',  # semantic hint, not used in Qt
        display: str = 'block',  # block, flex, inline, none
        flexDirection: str = 'row',  # row, column
        justifyContent: str = 'flex-start',
        alignItems: str = 'stretch',
        gap: int = 0,
        p: int = 0,  # padding
        m: int = 0,  # margin
        **kwargs,
    ):
        super().__init__(parent)
        
        self.setObjectName('box')
        
        # Choose layout based on display
        if display == 'flex':
            if flexDirection == 'column':
                self._layout = QVBoxLayout(self)
            else:
                self._layout = QHBoxLayout(self)
            
            # Alignment
            self._apply_alignment(justifyContent, alignItems)
        else:
            self._layout = QVBoxLayout(self)
        
        # Spacing
        self._layout.setSpacing(gap)
        self._layout.setContentsMargins(p, p, p, p)
        
        # Margin via stylesheet
        if m:
            self.setStyleSheet(f"margin: {m}px;")
    
    def _apply_alignment(self, justify: str, align: str):
        """Apply flex alignment."""
        # Note: Qt layouts handle alignment differently
        # This is a simplified mapping
        pass
    
    def add_widget(self, widget: QWidget, stretch: int = 0):
        """Add a widget to the box."""
        self._layout.addWidget(widget, stretch)
    
    def add_spacing(self, spacing: int):
        """Add spacing."""
        self._layout.addSpacing(spacing)
    
    def add_stretch(self, stretch: int = 1):
        """Add stretch."""
        self._layout.addStretch(stretch)


class Container(QFrame, StyleMixin):
    """Centered content container with max-width."""
    
    _base_class = 'container'
    
    def __init__(
        self,
        parent=None,
        maxWidth: str = 'lg',  # xs, sm, md, lg, xl, false
        fixed: bool = False,
        disableGutters: bool = False,
    ):
        super().__init__(parent)
        
        modifiers = [maxWidth]
        if fixed:
            modifiers.append('fixed')
        if disableGutters:
            modifiers.append('no-gutters')
        self.set_style_class(*modifiers)
        
        self._layout = QVBoxLayout(self)
        
        # Max widths
        max_widths = {
            'xs': 444,
            'sm': 600,
            'md': 900,
            'lg': 1200,
            'xl': 1536,
        }
        
        if maxWidth in max_widths:
            self.setMaximumWidth(max_widths[maxWidth])
        
        if not disableGutters:
            self._layout.setContentsMargins(24, 0, 24, 0)
        else:
            self._layout.setContentsMargins(0, 0, 0, 0)
    
    def add_widget(self, widget: QWidget, stretch: int = 0):
        """Add a widget to the container."""
        self._layout.addWidget(widget, stretch)


class Grid(QFrame, StyleMixin):
    """Grid layout component."""
    
    _base_class = 'grid'
    
    def __init__(
        self,
        parent=None,
        container: bool = False,
        item: bool = False,
        spacing: int = 0,
        columns: int = 12,
        xs: int = None,
        sm: int = None,
        md: int = None,
        lg: int = None,
        xl: int = None,
    ):
        super().__init__(parent)
        
        self._columns = columns
        self._col_count = 0
        
        modifiers = []
        if container:
            modifiers.append('container')
            self._layout = QGridLayout(self)
            self._layout.setSpacing(spacing * 8)  # MUI spacing unit is 8px
            self._layout.setContentsMargins(0, 0, 0, 0)
        else:
            self._layout = None
        
        if item:
            modifiers.append('item')
            # Set size hints based on breakpoint props
            cols = xs or sm or md or lg or xl or 12
            # In a 12-column grid, calculate proportion
            self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)
        
        self.set_style_class(*modifiers)
    
    def add_widget(self, widget: QWidget, row: int = None, col: int = None, rowSpan: int = 1, colSpan: int = 1):
        """Add a widget to the grid."""
        if self._layout:
            if row is None or col is None:
                # Auto-position
                row = self._col_count // self._columns
                col = self._col_count % self._columns
                self._col_count += colSpan
            
            self._layout.addWidget(widget, row, col, rowSpan, colSpan)


class Stack(QFrame, StyleMixin):
    """One-dimensional layout component."""
    
    _base_class = 'stack'
    
    def __init__(
        self,
        parent=None,
        direction: str = 'column',  # row, column, row-reverse, column-reverse
        spacing: int = 0,
        divider: bool = False,
        alignItems: str = 'stretch',
        justifyContent: str = 'flex-start',
    ):
        super().__init__(parent)
        
        self._direction = direction
        self._spacing = spacing * 8  # MUI spacing unit
        self._divider = divider
        self._items = []
        
        if direction in ('row', 'row-reverse'):
            self._layout = QHBoxLayout(self)
        else:
            self._layout = QVBoxLayout(self)
        
        self._layout.setSpacing(self._spacing)
        self._layout.setContentsMargins(0, 0, 0, 0)
        
        self.set_style_class(direction)
    
    def add_widget(self, widget: QWidget, stretch: int = 0):
        """Add a widget to the stack."""
        if self._divider and self._items:
            divider = QFrame()
            if self._direction in ('row', 'row-reverse'):
                divider.setFrameShape(QFrame.Shape.VLine)
            else:
                divider.setFrameShape(QFrame.Shape.HLine)
            divider.setFrameShadow(QFrame.Shadow.Sunken)
            self._layout.addWidget(divider)
        
        self._items.append(widget)
        self._layout.addWidget(widget, stretch)
    
    def add_spacing(self, spacing: int):
        """Add spacing."""
        self._layout.addSpacing(spacing * 8)


class Flex(QFrame, StyleMixin):
    """Flexbox-style layout component."""
    
    _base_class = 'flex'
    
    def __init__(
        self,
        parent=None,
        direction: str = 'row',
        wrap: str = 'nowrap',  # nowrap, wrap, wrap-reverse
        justify: str = 'flex-start',
        align: str = 'stretch',
        gap: int = 0,
    ):
        super().__init__(parent)
        
        if direction in ('row', 'row-reverse'):
            self._layout = QHBoxLayout(self)
        else:
            self._layout = QVBoxLayout(self)
        
        self._layout.setSpacing(gap * 8)
        self._layout.setContentsMargins(0, 0, 0, 0)
        
        self.set_style_class(direction, wrap, f'justify-{justify}', f'align-{align}')
    
    def add_widget(self, widget: QWidget, stretch: int = 0):
        """Add a widget to flex container."""
        self._layout.addWidget(widget, stretch)


class ImageList(QFrame, StyleMixin):
    """Grid of images."""
    
    _base_class = 'image-list'
    
    def __init__(
        self,
        parent=None,
        cols: int = 3,
        rowHeight: int = 164,
        gap: int = 4,
        variant: str = 'standard',  # standard, quilted, woven, masonry
    ):
        super().__init__(parent)
        
        self._cols = cols
        self._row_height = rowHeight
        self._items = []
        
        self._layout = QGridLayout(self)
        self._layout.setSpacing(gap)
        self._layout.setContentsMargins(0, 0, 0, 0)
        
        self.set_style_class(variant)
    
    def add_item(self, item: 'ImageListItem'):
        """Add an image list item."""
        row = len(self._items) // self._cols
        col = len(self._items) % self._cols
        
        self._items.append(item)
        self._layout.addWidget(item, row, col)


class ImageListItem(QFrame, StyleMixin):
    """Individual item in an image list."""
    
    _base_class = 'image-list-item'
    
    def __init__(
        self,
        parent=None,
        img: str = '',
        title: str = '',
        cols: int = 1,
        rows: int = 1,
    ):
        super().__init__(parent)
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(0, 0, 0, 0)
        self._layout.setSpacing(0)
        
        # Image
        if img:
            img_label = QLabel()
            pixmap = QPixmap(img)
            if not pixmap.isNull():
                img_label.setPixmap(pixmap.scaled(
                    200, 164,
                    Qt.AspectRatioMode.KeepAspectRatioByExpanding,
                    Qt.TransformationMode.SmoothTransformation
                ))
            img_label.setScaledContents(True)
            self._layout.addWidget(img_label)


class ImageListItemBar(QFrame, StyleMixin):
    """Title bar for image list item."""
    
    _base_class = 'image-list-item-bar'
    
    def __init__(
        self,
        parent=None,
        title: str = '',
        subtitle: str = '',
        actionIcon: QWidget = None,
        position: str = 'bottom',  # top, bottom
    ):
        super().__init__(parent)
        
        self._layout = QHBoxLayout(self)
        self._layout.setContentsMargins(8, 4, 8, 4)
        
        # Text content
        text_container = QFrame()
        text_layout = QVBoxLayout(text_container)
        text_layout.setContentsMargins(0, 0, 0, 0)
        text_layout.setSpacing(2)
        
        if title:
            title_label = QLabel(title)
            title_label.setObjectName('image-list-item-title')
            text_layout.addWidget(title_label)
        
        if subtitle:
            sub_label = QLabel(subtitle)
            sub_label.setObjectName('image-list-item-subtitle')
            text_layout.addWidget(sub_label)
        
        self._layout.addWidget(text_container, stretch=1)
        
        if actionIcon:
            self._layout.addWidget(actionIcon)
        
        self.set_style_class(position)


class Spacer(QWidget):
    """Flexible spacer widget."""
    
    def __init__(
        self,
        parent=None,
        width: int = None,
        height: int = None,
        flex: int = 1,
    ):
        super().__init__(parent)
        
        if width and height:
            self.setFixedSize(width, height)
        elif width:
            self.setFixedWidth(width)
            self.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Expanding)
        elif height:
            self.setFixedHeight(height)
            self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        else:
            self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
