"""
FakeMUI Lab Module for PyQt6

Provides experimental/lab components like LoadingButton, Timeline, TreeView, Masonry.
"""

from typing import Any, Callable, Dict, List, Optional, Union
from PyQt6.QtWidgets import (
    QWidget, QPushButton, QVBoxLayout, QHBoxLayout, QLabel,
    QFrame, QTreeWidget, QTreeWidgetItem, QGridLayout, QSizePolicy,
    QScrollArea
)
from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QPropertyAnimation, QEasingCurve
from PyQt6.QtGui import QFont, QColor

from .base import FakeMUIWidget, StyleMixin


# =============================================================================
# LoadingButton
# =============================================================================

class LoadingButton(QPushButton, StyleMixin):
    """
    A button with loading state.
    
    Properties:
        loading: Whether the button is in loading state.
        loading_position: Position of loading indicator ('start', 'center', 'end').
        variant: Button style ('contained', 'outlined', 'text').
        color: Button color ('primary', 'secondary', 'error', etc.).
    """
    
    def __init__(
        self,
        text: str = "",
        parent: Optional[QWidget] = None,
        loading: bool = False,
        loading_position: str = "center",
        variant: str = "contained",
        color: str = "primary",
        size: str = "medium",
        full_width: bool = False,
    ):
        super().__init__(text, parent)
        StyleMixin.__init__(self)
        
        self._loading = loading
        self._loading_position = loading_position
        self._original_text = text
        self._variant = variant
        self._color = color
        self._size = size
        self._full_width = full_width
        self._spinner_angle = 0
        self._spinner_timer = QTimer()
        self._spinner_timer.timeout.connect(self._update_spinner)
        
        self._apply_classes()
        self._update_loading_state()
    
    def _apply_classes(self):
        """Apply CSS classes based on properties."""
        self.clear_classes()
        self.add_class("fakemui-loading-button")
        self.add_class(f"fakemui-loading-button-{self._variant}")
        self.add_class(f"fakemui-loading-button-{self._color}")
        self.add_class(f"fakemui-loading-button-{self._size}")
        
        if self._full_width:
            self.add_class("fakemui-loading-button-fullwidth")
            self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        
        if self._loading:
            self.add_class("fakemui-loading-button-loading")
            self.setEnabled(False)
        
        self._apply_stylesheet()
    
    def _apply_stylesheet(self):
        """Apply styles based on variant and color."""
        colors = {
            "primary": ("#1976d2", "#1565c0", "#fff"),
            "secondary": ("#9c27b0", "#7b1fa2", "#fff"),
            "error": ("#d32f2f", "#c62828", "#fff"),
            "warning": ("#ed6c02", "#e65100", "#fff"),
            "info": ("#0288d1", "#01579b", "#fff"),
            "success": ("#2e7d32", "#1b5e20", "#fff"),
        }
        
        sizes = {
            "small": ("6px 12px", "12px"),
            "medium": ("8px 16px", "14px"),
            "large": ("10px 20px", "16px"),
        }
        
        main_color, dark_color, text_color = colors.get(self._color, colors["primary"])
        padding, font_size = sizes.get(self._size, sizes["medium"])
        
        if self._variant == "contained":
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: {main_color};
                    color: {text_color};
                    border: none;
                    border-radius: 4px;
                    padding: {padding};
                    font-size: {font_size};
                    font-weight: 500;
                    text-transform: uppercase;
                }}
                QPushButton:hover {{
                    background-color: {dark_color};
                }}
                QPushButton:disabled {{
                    background-color: #e0e0e0;
                    color: #9e9e9e;
                }}
            """)
        elif self._variant == "outlined":
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: transparent;
                    color: {main_color};
                    border: 1px solid {main_color};
                    border-radius: 4px;
                    padding: {padding};
                    font-size: {font_size};
                    font-weight: 500;
                    text-transform: uppercase;
                }}
                QPushButton:hover {{
                    background-color: rgba(25, 118, 210, 0.04);
                }}
                QPushButton:disabled {{
                    border-color: #e0e0e0;
                    color: #9e9e9e;
                }}
            """)
        else:  # text
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: transparent;
                    color: {main_color};
                    border: none;
                    border-radius: 4px;
                    padding: {padding};
                    font-size: {font_size};
                    font-weight: 500;
                    text-transform: uppercase;
                }}
                QPushButton:hover {{
                    background-color: rgba(25, 118, 210, 0.04);
                }}
                QPushButton:disabled {{
                    color: #9e9e9e;
                }}
            """)
    
    def _update_loading_state(self):
        """Update button text based on loading state."""
        if self._loading:
            if self._loading_position == "center":
                self.setText("⟳ Loading...")
            elif self._loading_position == "start":
                self.setText(f"⟳ {self._original_text}")
            else:  # end
                self.setText(f"{self._original_text} ⟳")
            self._spinner_timer.start(100)
        else:
            self.setText(self._original_text)
            self._spinner_timer.stop()
    
    def _update_spinner(self):
        """Update spinner animation."""
        spinners = ["◐", "◓", "◑", "◒"]
        self._spinner_angle = (self._spinner_angle + 1) % 4
        spinner = spinners[self._spinner_angle]
        
        if self._loading_position == "center":
            self.setText(f"{spinner} Loading...")
        elif self._loading_position == "start":
            self.setText(f"{spinner} {self._original_text}")
        else:
            self.setText(f"{self._original_text} {spinner}")
    
    @property
    def loading(self) -> bool:
        return self._loading
    
    @loading.setter
    def loading(self, value: bool):
        self._loading = value
        self.setEnabled(not value)
        self._apply_classes()
        self._update_loading_state()
    
    def set_loading(self, loading: bool):
        """Set loading state."""
        self.loading = loading


# =============================================================================
# Timeline Components
# =============================================================================

class Timeline(QFrame, StyleMixin):
    """
    Displays a list of events in chronological order.
    
    Properties:
        position: Timeline position ('left', 'right', 'alternate').
    """
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        position: str = "right",
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._position = position
        self._layout = QVBoxLayout(self)
        self._layout.setSpacing(0)
        self._layout.setContentsMargins(0, 0, 0, 0)
        
        self.add_class("fakemui-timeline")
        self.add_class(f"fakemui-timeline-position-{position}")
        
        self.setStyleSheet("""
            QFrame {
                background: transparent;
            }
        """)
    
    def add_item(self, item: 'TimelineItem'):
        """Add a timeline item."""
        self._layout.addWidget(item)


class TimelineItem(QFrame, StyleMixin):
    """A single event in the timeline."""
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        position: Optional[str] = None,
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._position = position
        self._layout = QHBoxLayout(self)
        self._layout.setContentsMargins(8, 8, 8, 8)
        
        self._opposite_content: Optional[QWidget] = None
        self._separator: Optional[QWidget] = None
        self._content: Optional[QWidget] = None
        
        self.add_class("fakemui-timeline-item")
        if position:
            self.add_class(f"fakemui-timeline-item-position-{position}")
        
        self.setStyleSheet("""
            QFrame {
                background: transparent;
            }
        """)
    
    def set_opposite_content(self, widget: QWidget):
        """Set the opposite content."""
        self._opposite_content = widget
        self._rebuild_layout()
    
    def set_separator(self, widget: QWidget):
        """Set the separator."""
        self._separator = widget
        self._rebuild_layout()
    
    def set_content(self, widget: QWidget):
        """Set the main content."""
        self._content = widget
        self._rebuild_layout()
    
    def _rebuild_layout(self):
        """Rebuild the layout with current components."""
        # Clear layout
        while self._layout.count():
            item = self._layout.takeAt(0)
            if item.widget():
                item.widget().setParent(None)
        
        # Add components in order
        if self._opposite_content:
            self._layout.addWidget(self._opposite_content)
        if self._separator:
            self._layout.addWidget(self._separator)
        if self._content:
            self._layout.addWidget(self._content, 1)


class TimelineSeparator(QFrame, StyleMixin):
    """The separator between content and opposite content."""
    
    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._layout = QVBoxLayout(self)
        self._layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._layout.setContentsMargins(8, 0, 8, 0)
        
        self.add_class("fakemui-timeline-separator")
        self.setFixedWidth(40)
    
    def add_widget(self, widget: QWidget):
        """Add a widget to the separator."""
        self._layout.addWidget(widget)


class TimelineConnector(QFrame, StyleMixin):
    """The vertical line connecting timeline items."""
    
    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self.add_class("fakemui-timeline-connector")
        self.setFixedWidth(2)
        self.setMinimumHeight(20)
        
        self.setStyleSheet("""
            QFrame {
                background-color: #bdbdbd;
            }
        """)


class TimelineContent(QFrame, StyleMixin):
    """The main content of a timeline item."""
    
    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(8, 8, 8, 8)
        
        self.add_class("fakemui-timeline-content")
    
    def add_widget(self, widget: QWidget):
        """Add a widget to the content."""
        self._layout.addWidget(widget)
    
    def set_text(self, text: str):
        """Set text content."""
        label = QLabel(text)
        label.setWordWrap(True)
        self._layout.addWidget(label)


class TimelineDot(QFrame, StyleMixin):
    """The dot/icon indicator in the timeline."""
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        color: str = "grey",
        variant: str = "filled",
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._color = color
        self._variant = variant
        
        self.add_class("fakemui-timeline-dot")
        self.add_class(f"fakemui-timeline-dot-{variant}")
        self.add_class(f"fakemui-timeline-dot-{color}")
        
        self.setFixedSize(12, 12)
        
        colors = {
            "grey": "#bdbdbd",
            "primary": "#1976d2",
            "secondary": "#9c27b0",
            "error": "#d32f2f",
            "warning": "#ed6c02",
            "info": "#0288d1",
            "success": "#2e7d32",
        }
        
        bg_color = colors.get(color, colors["grey"])
        
        if variant == "filled":
            self.setStyleSheet(f"""
                QFrame {{
                    background-color: {bg_color};
                    border-radius: 6px;
                }}
            """)
        else:  # outlined
            self.setStyleSheet(f"""
                QFrame {{
                    background-color: transparent;
                    border: 2px solid {bg_color};
                    border-radius: 6px;
                }}
            """)


class TimelineOppositeContent(QFrame, StyleMixin):
    """Content on the opposite side of the timeline."""
    
    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(8, 8, 8, 8)
        self._layout.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignTop)
        
        self.add_class("fakemui-timeline-opposite-content")
    
    def add_widget(self, widget: QWidget):
        """Add a widget."""
        self._layout.addWidget(widget)
    
    def set_text(self, text: str):
        """Set text content."""
        label = QLabel(text)
        label.setStyleSheet("color: rgba(0, 0, 0, 0.6);")
        self._layout.addWidget(label)


# =============================================================================
# TreeView Components
# =============================================================================

class TreeView(QTreeWidget, StyleMixin):
    """
    A hierarchical list component.
    
    Signals:
        node_toggled: Emitted when a node is expanded/collapsed.
        node_selected: Emitted when a node is selected.
    """
    
    node_toggled = pyqtSignal(str, bool)  # node_id, is_expanded
    node_selected = pyqtSignal(str)  # node_id
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        multi_select: bool = False,
        default_expand_icon: str = "▶",
        default_collapse_icon: str = "▼",
        default_end_icon: str = "",
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._multi_select = multi_select
        self._default_expand_icon = default_expand_icon
        self._default_collapse_icon = default_collapse_icon
        self._default_end_icon = default_end_icon
        self._node_map: Dict[str, QTreeWidgetItem] = {}
        
        self.setHeaderHidden(True)
        self.setIndentation(20)
        
        if multi_select:
            self.setSelectionMode(QTreeWidget.SelectionMode.MultiSelection)
        else:
            self.setSelectionMode(QTreeWidget.SelectionMode.SingleSelection)
        
        self.itemExpanded.connect(self._on_item_expanded)
        self.itemCollapsed.connect(self._on_item_collapsed)
        self.itemClicked.connect(self._on_item_clicked)
        
        self.add_class("fakemui-tree-view")
        
        self.setStyleSheet("""
            QTreeWidget {
                background-color: transparent;
                border: none;
                outline: none;
            }
            QTreeWidget::item {
                padding: 4px;
                border-radius: 4px;
            }
            QTreeWidget::item:hover {
                background-color: rgba(0, 0, 0, 0.04);
            }
            QTreeWidget::item:selected {
                background-color: rgba(25, 118, 210, 0.12);
                color: #1976d2;
            }
            QTreeWidget::branch {
                background: transparent;
            }
        """)
    
    def add_node(
        self,
        node_id: str,
        label: str,
        parent_id: Optional[str] = None,
        icon: Optional[str] = None,
    ) -> 'TreeItem':
        """Add a node to the tree."""
        item = TreeItem(node_id, label, icon)
        
        if parent_id and parent_id in self._node_map:
            self._node_map[parent_id].addChild(item)
        else:
            self.addTopLevelItem(item)
        
        self._node_map[node_id] = item
        return item
    
    def expand_node(self, node_id: str):
        """Expand a node."""
        if node_id in self._node_map:
            self._node_map[node_id].setExpanded(True)
    
    def collapse_node(self, node_id: str):
        """Collapse a node."""
        if node_id in self._node_map:
            self._node_map[node_id].setExpanded(False)
    
    def select_node(self, node_id: str):
        """Select a node."""
        if node_id in self._node_map:
            self._node_map[node_id].setSelected(True)
    
    def _on_item_expanded(self, item: QTreeWidgetItem):
        """Handle item expansion."""
        if isinstance(item, TreeItem):
            self.node_toggled.emit(item.node_id, True)
    
    def _on_item_collapsed(self, item: QTreeWidgetItem):
        """Handle item collapse."""
        if isinstance(item, TreeItem):
            self.node_toggled.emit(item.node_id, False)
    
    def _on_item_clicked(self, item: QTreeWidgetItem, column: int):
        """Handle item click."""
        if isinstance(item, TreeItem):
            self.node_selected.emit(item.node_id)


class TreeItem(QTreeWidgetItem):
    """A single item in the tree."""
    
    def __init__(
        self,
        node_id: str,
        label: str,
        icon: Optional[str] = None,
    ):
        super().__init__()
        
        self.node_id = node_id
        self._label = label
        self._icon = icon
        
        display_text = f"{icon} {label}" if icon else label
        self.setText(0, display_text)


# =============================================================================
# Masonry
# =============================================================================

class Masonry(QScrollArea, StyleMixin):
    """
    CSS-like masonry layout using a grid.
    
    Properties:
        columns: Number of columns.
        spacing: Spacing between items (in 8px units).
    """
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        columns: int = 4,
        spacing: int = 1,
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._columns = columns
        self._spacing = spacing
        self._items: List[QWidget] = []
        
        # Create container
        self._container = QWidget()
        self._layout = QGridLayout(self._container)
        self._layout.setSpacing(spacing * 8)
        self._layout.setContentsMargins(0, 0, 0, 0)
        
        self.setWidget(self._container)
        self.setWidgetResizable(True)
        self.setFrameShape(QFrame.Shape.NoFrame)
        
        self.add_class("fakemui-masonry")
        
        self.setStyleSheet("""
            QScrollArea {
                background: transparent;
                border: none;
            }
        """)
    
    def add_item(self, widget: QWidget):
        """Add an item to the masonry layout."""
        self._items.append(widget)
        self._rebuild_layout()
    
    def remove_item(self, widget: QWidget):
        """Remove an item from the masonry layout."""
        if widget in self._items:
            self._items.remove(widget)
            widget.setParent(None)
            self._rebuild_layout()
    
    def clear(self):
        """Clear all items."""
        for item in self._items:
            item.setParent(None)
        self._items.clear()
        self._rebuild_layout()
    
    def _rebuild_layout(self):
        """Rebuild the masonry layout."""
        # Clear layout
        while self._layout.count():
            item = self._layout.takeAt(0)
        
        # Add items in column-major order for masonry effect
        col_heights = [0] * self._columns
        
        for widget in self._items:
            # Find the shortest column
            min_col = col_heights.index(min(col_heights))
            row = col_heights[min_col]
            
            self._layout.addWidget(widget, row, min_col)
            col_heights[min_col] += 1
    
    @property
    def columns(self) -> int:
        return self._columns
    
    @columns.setter
    def columns(self, value: int):
        self._columns = value
        self._rebuild_layout()
    
    @property
    def spacing(self) -> int:
        return self._spacing
    
    @spacing.setter
    def spacing(self, value: int):
        self._spacing = value
        self._layout.setSpacing(value * 8)


# =============================================================================
# Exports
# =============================================================================

__all__ = [
    # Loading Button
    "LoadingButton",
    # Timeline
    "Timeline",
    "TimelineItem",
    "TimelineSeparator",
    "TimelineConnector",
    "TimelineContent",
    "TimelineDot",
    "TimelineOppositeContent",
    # TreeView
    "TreeView",
    "TreeItem",
    # Masonry
    "Masonry",
]
