"""Navigation components for FakeMUI."""

from PyQt6.QtWidgets import (
    QWidget, QFrame, QLabel, QVBoxLayout, QHBoxLayout,
    QPushButton, QMenu, QTabWidget, QTabBar,
    QSizePolicy, QSpinBox
)
from PyQt6.QtCore import Qt, pyqtSignal, QSize
from PyQt6.QtGui import QIcon, QCursor, QAction

from .base import FakeMUIWidget, FakeMUIContainer, StyleMixin


class Breadcrumbs(FakeMUIContainer):
    """Breadcrumb navigation component."""
    
    _base_class = 'breadcrumbs'
    
    def __init__(
        self,
        parent=None,
        separator: str = '/',
        maxItems: int = 8,
    ):
        super().__init__(parent, 'horizontal')
        
        self._separator = separator
        self._max_items = maxItems
        self._items = []
        
        self.set_spacing(8)
    
    def add_item(self, item: 'Link', is_last: bool = False):
        """Add a breadcrumb item."""
        if self._items:
            sep = QLabel(self._separator)
            sep.setObjectName('breadcrumbs-separator')
            self.add_widget(sep)
        
        self._items.append(item)
        self.add_widget(item)
    
    def set_items(self, items: list):
        """Set all breadcrumb items."""
        self.clear()
        self._items.clear()
        for i, item in enumerate(items):
            self.add_item(item, is_last=(i == len(items) - 1))


class Link(QPushButton, StyleMixin):
    """Hyperlink-style button."""
    
    _base_class = 'link'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        href: str = '',
        color: str = 'primary',
        underline: str = 'hover',  # always, hover, none
        disabled: bool = False,
    ):
        super().__init__(text, parent)
        
        self._href = href
        
        modifiers = [color, f'underline-{underline}']
        self.set_style_class(*modifiers)
        
        self.setFlat(True)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setEnabled(not disabled)
    
    @property
    def href(self) -> str:
        return self._href


class Menu(QMenu, StyleMixin):
    """Dropdown menu component."""
    
    _base_class = 'menu'
    
    def __init__(
        self,
        parent=None,
        anchorEl: QWidget = None,
    ):
        super().__init__(parent)
        
        self.setObjectName('menu')
        self._anchor = anchorEl
    
    def add_item(self, item: 'MenuItem'):
        """Add a menu item."""
        action = self.addAction(item.text())
        if item.icon():
            action.setIcon(item.icon())
        action.triggered.connect(item.click)
        action.setEnabled(item.isEnabled())
    
    def show_menu(self):
        """Show the menu at anchor position."""
        if self._anchor:
            pos = self._anchor.mapToGlobal(
                self._anchor.rect().bottomLeft()
            )
            self.popup(pos)
        else:
            self.popup(QCursor.pos())


class MenuItem(QPushButton, StyleMixin):
    """Menu item component."""
    
    _base_class = 'menu-item'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        icon: QIcon = None,
        disabled: bool = False,
        divider: bool = False,
    ):
        super().__init__(text, parent)
        
        modifiers = []
        if divider:
            modifiers.append('divider')
        self.set_style_class(*modifiers)
        
        if icon:
            self.setIcon(icon)
        
        self.setEnabled(not disabled)
        self.setFlat(True)
        self.setCursor(Qt.CursorShape.PointingHandCursor)


class MenuList(FakeMUIContainer):
    """Container for menu items."""
    
    _base_class = 'menu-list'
    
    def __init__(self, parent=None, dense: bool = False):
        super().__init__(parent, 'vertical')
        
        if dense:
            self.add_modifier('dense')


class TabWidget(QTabWidget, StyleMixin):
    """Tab container component."""
    
    _base_class = 'tabs'
    
    def __init__(
        self,
        parent=None,
        variant: str = 'standard',  # standard, scrollable, fullWidth
        centered: bool = False,
        orientation: str = 'horizontal',  # horizontal, vertical
    ):
        super().__init__(parent)
        
        modifiers = [variant]
        if centered:
            modifiers.append('centered')
        self.set_style_class(*modifiers)
        
        if orientation == 'vertical':
            self.setTabPosition(QTabWidget.TabPosition.West)


class Tab(QPushButton, StyleMixin):
    """Individual tab component."""
    
    _base_class = 'tab'
    
    def __init__(
        self,
        label: str = '',
        parent=None,
        icon: QIcon = None,
        selected: bool = False,
        disabled: bool = False,
    ):
        super().__init__(label, parent)
        
        modifiers = []
        if selected:
            modifiers.append('active')
        if disabled:
            modifiers.append('disabled')
        self.set_style_class(*modifiers)
        
        if icon:
            self.setIcon(icon)
        
        self.setCheckable(True)
        self.setChecked(selected)
        self.setEnabled(not disabled)
        self.setCursor(Qt.CursorShape.PointingHandCursor)


class Pagination(FakeMUIContainer):
    """Pagination component."""
    
    _base_class = 'pagination'
    
    pageChanged = pyqtSignal(int)
    
    def __init__(
        self,
        parent=None,
        count: int = 10,
        page: int = 1,
        color: str = 'primary',
        size: str = 'medium',
        showFirstButton: bool = False,
        showLastButton: bool = False,
    ):
        super().__init__(parent, 'horizontal')
        
        self._count = count
        self._page = page
        self._color = color
        self._size = size
        
        self.set_spacing(4)
        self.set_style_class(color, size)
        
        self._build_pagination(showFirstButton, showLastButton)
    
    def _build_pagination(self, show_first: bool, show_last: bool):
        """Build pagination buttons."""
        if show_first:
            first_btn = QPushButton('«')
            first_btn.clicked.connect(lambda: self.set_page(1))
            self.add_widget(first_btn)
        
        # Previous
        prev_btn = QPushButton('‹')
        prev_btn.clicked.connect(lambda: self.set_page(self._page - 1))
        self.add_widget(prev_btn)
        
        # Page numbers (simplified - show current ± 2)
        for i in range(max(1, self._page - 2), min(self._count + 1, self._page + 3)):
            btn = QPushButton(str(i))
            btn.setCheckable(True)
            btn.setChecked(i == self._page)
            btn.clicked.connect(lambda checked, p=i: self.set_page(p))
            self.add_widget(btn)
        
        # Next
        next_btn = QPushButton('›')
        next_btn.clicked.connect(lambda: self.set_page(self._page + 1))
        self.add_widget(next_btn)
        
        if show_last:
            last_btn = QPushButton('»')
            last_btn.clicked.connect(lambda: self.set_page(self._count))
            self.add_widget(last_btn)
    
    def set_page(self, page: int):
        """Set the current page."""
        if 1 <= page <= self._count and page != self._page:
            self._page = page
            self.pageChanged.emit(page)
            self._rebuild()
    
    def _rebuild(self):
        """Rebuild pagination buttons."""
        self.clear()
        self._build_pagination(False, False)


class Stepper(FakeMUIContainer):
    """Step-by-step workflow component."""
    
    _base_class = 'stepper'
    
    def __init__(
        self,
        parent=None,
        activeStep: int = 0,
        orientation: str = 'horizontal',  # horizontal, vertical
        alternativeLabel: bool = False,
    ):
        super().__init__(parent, orientation)
        
        self._active_step = activeStep
        self._steps = []
        
        modifiers = [orientation]
        if alternativeLabel:
            modifiers.append('alternative-label')
        self.set_style_class(*modifiers)
        
        self.set_spacing(8)
    
    def add_step(self, step: 'Step'):
        """Add a step to the stepper."""
        index = len(self._steps)
        step.set_index(index)
        step.set_active(index == self._active_step)
        step.set_completed(index < self._active_step)
        self._steps.append(step)
        
        # Add connector between steps
        if index > 0:
            connector = QFrame()
            connector.setObjectName('stepper-connector')
            connector.setFixedHeight(1)
            self.add_widget(connector, stretch=1)
        
        self.add_widget(step)
    
    def set_active_step(self, step: int):
        """Set the active step."""
        self._active_step = step
        for i, s in enumerate(self._steps):
            s.set_active(i == step)
            s.set_completed(i < step)


class Step(FakeMUIContainer):
    """Individual step in a stepper."""
    
    _base_class = 'step'
    
    def __init__(self, parent=None, completed: bool = False, disabled: bool = False):
        super().__init__(parent, 'vertical')
        
        self._index = 0
        self._completed = completed
        self._active = False
        
        modifiers = []
        if completed:
            modifiers.append('completed')
        if disabled:
            modifiers.append('disabled')
        self.set_style_class(*modifiers)
    
    def set_index(self, index: int):
        """Set step index."""
        self._index = index
    
    def set_active(self, active: bool):
        """Set active state."""
        self._active = active
        if active:
            self.add_modifier('active')
        else:
            self.remove_modifier('active')
    
    def set_completed(self, completed: bool):
        """Set completed state."""
        self._completed = completed
        if completed:
            self.add_modifier('completed')
        else:
            self.remove_modifier('completed')


class StepLabel(FakeMUIContainer):
    """Label for a step."""
    
    _base_class = 'step-label'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        optional: str = '',
        icon: QIcon = None,
        error: bool = False,
    ):
        super().__init__(parent, 'horizontal')
        
        self.set_spacing(8)
        
        # Step icon/number
        self._icon_label = QLabel()
        self._icon_label.setObjectName('step-icon')
        self._icon_label.setFixedSize(24, 24)
        self._icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        if icon:
            self._icon_label.setPixmap(icon.pixmap(24, 24))
        self.add_widget(self._icon_label)
        
        # Text content
        text_container = FakeMUIContainer(layout_type='vertical')
        label = QLabel(text)
        label.setObjectName('step-label-text')
        text_container.add_widget(label)
        
        if optional:
            opt_label = QLabel(optional)
            opt_label.setObjectName('step-label-optional')
            text_container.add_widget(opt_label)
        
        self.add_widget(text_container)
        
        if error:
            self.add_modifier('error')
    
    def set_icon(self, icon: QIcon = None, number: int = None):
        """Set the step icon or number."""
        if icon:
            self._icon_label.setPixmap(icon.pixmap(24, 24))
        elif number is not None:
            self._icon_label.setText(str(number))


class BottomNavigation(FakeMUIContainer):
    """Bottom navigation bar."""
    
    _base_class = 'bottom-navigation'
    
    valueChanged = pyqtSignal(str)
    
    def __init__(
        self,
        parent=None,
        value: str = '',
        showLabels: bool = True,
    ):
        super().__init__(parent, 'horizontal')
        
        self._value = value
        self._show_labels = showLabels
        self._actions = []
        
        self.setFixedHeight(56)
    
    def add_action(self, action: 'BottomNavigationAction'):
        """Add a navigation action."""
        action.set_show_label(self._show_labels)
        action.clicked.connect(lambda: self._select(action))
        self._actions.append(action)
        self.add_widget(action, stretch=1)
        
        if action.value == self._value:
            action.set_selected(True)
    
    def _select(self, action: 'BottomNavigationAction'):
        """Select a navigation action."""
        for a in self._actions:
            a.set_selected(a == action)
        self._value = action.value
        self.valueChanged.emit(self._value)


class BottomNavigationAction(QPushButton, StyleMixin):
    """Individual action in bottom navigation."""
    
    _base_class = 'bottom-nav-action'
    
    def __init__(
        self,
        label: str = '',
        parent=None,
        icon: QIcon = None,
        value: str = '',
        showLabel: bool = True,
    ):
        super().__init__(parent)
        
        self._value = value
        self._label = label
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 8, 0, 8)
        layout.setSpacing(4)
        
        # Icon
        if icon:
            icon_label = QLabel()
            icon_label.setPixmap(icon.pixmap(24, 24))
            icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            layout.addWidget(icon_label)
        
        # Label
        self._label_widget = QLabel(label)
        self._label_widget.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._label_widget.setVisible(showLabel)
        layout.addWidget(self._label_widget)
        
        self.setFlat(True)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
    
    @property
    def value(self) -> str:
        return self._value
    
    def set_show_label(self, show: bool):
        """Set label visibility."""
        self._label_widget.setVisible(show)
    
    def set_selected(self, selected: bool):
        """Set selected state."""
        if selected:
            self.add_modifier('selected')
        else:
            self.remove_modifier('selected')
