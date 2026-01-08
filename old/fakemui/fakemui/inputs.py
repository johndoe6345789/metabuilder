"""Input components for FakeMUI."""

from PyQt6.QtWidgets import (
    QPushButton, QToolButton, QLineEdit, QTextEdit, QComboBox,
    QCheckBox, QRadioButton, QSlider, QWidget, QLabel,
    QVBoxLayout, QHBoxLayout, QButtonGroup, QFrame, QSpinBox
)
from PyQt6.QtCore import Qt, pyqtSignal, QSize
from PyQt6.QtGui import QIcon, QFont

from .base import FakeMUIWidget, FakeMUIContainer, StyleMixin


class Button(QPushButton, StyleMixin):
    """Material-style button with variants."""
    
    _base_class = 'btn'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        primary: bool = False,
        secondary: bool = False,
        outline: bool = False,
        ghost: bool = False,
        sm: bool = False,
        lg: bool = False,
        icon: QIcon = None,
        loading: bool = False,
        disabled: bool = False,
    ):
        super().__init__(text, parent)
        
        modifiers = []
        if primary:
            modifiers.append('primary')
        if secondary:
            modifiers.append('secondary')
        if outline:
            modifiers.append('outline')
        if ghost:
            modifiers.append('ghost')
        if sm:
            modifiers.append('sm')
        if lg:
            modifiers.append('lg')
        if loading:
            modifiers.append('loading')
        
        self.set_style_class(*modifiers)
        
        if icon:
            self.setIcon(icon)
        
        self.setEnabled(not disabled and not loading)
        self._loading = loading
        
        self._apply_style()
    
    def _apply_style(self):
        """Apply base button styling."""
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setMinimumHeight(36)
    
    def set_loading(self, loading: bool):
        """Set loading state."""
        self._loading = loading
        self.setEnabled(not loading)
        if loading:
            self.add_modifier('loading')
        else:
            self.remove_modifier('loading')


class IconButton(QToolButton, StyleMixin):
    """Circular icon button."""
    
    _base_class = 'icon-btn'
    
    def __init__(
        self,
        icon: QIcon = None,
        parent=None,
        size: str = 'medium',  # small, medium, large
        color: str = 'default',  # default, primary, secondary, error
    ):
        super().__init__(parent)
        
        self.set_style_class(size, color)
        
        if icon:
            self.setIcon(icon)
        
        self._apply_style(size)
    
    def _apply_style(self, size: str):
        """Apply icon button styling."""
        sizes = {'small': 32, 'medium': 40, 'large': 48}
        s = sizes.get(size, 40)
        self.setFixedSize(s, s)
        self.setCursor(Qt.CursorShape.PointingHandCursor)


class Fab(QPushButton, StyleMixin):
    """Floating action button."""
    
    _base_class = 'fab'
    
    def __init__(
        self,
        icon: QIcon = None,
        text: str = '',
        parent=None,
        color: str = 'primary',
        size: str = 'medium',
        extended: bool = False,
    ):
        super().__init__(parent)
        
        if text:
            self.setText(text)
        if icon:
            self.setIcon(icon)
        
        modifiers = [color, size]
        if extended:
            modifiers.append('extended')
        self.set_style_class(*modifiers)
        
        self._apply_style(size, extended)
    
    def _apply_style(self, size: str, extended: bool):
        """Apply FAB styling."""
        sizes = {'small': 40, 'medium': 56, 'large': 72}
        s = sizes.get(size, 56)
        if extended:
            self.setMinimumHeight(48)
            self.setMinimumWidth(80)
        else:
            self.setFixedSize(s, s)
        self.setCursor(Qt.CursorShape.PointingHandCursor)


class Input(QLineEdit, StyleMixin):
    """Material-style text input."""
    
    _base_class = 'input'
    
    def __init__(
        self,
        parent=None,
        placeholder: str = '',
        value: str = '',
        error: bool = False,
        disabled: bool = False,
        fullWidth: bool = False,
    ):
        super().__init__(parent)
        
        if placeholder:
            self.setPlaceholderText(placeholder)
        if value:
            self.setText(value)
        
        modifiers = []
        if error:
            modifiers.append('error')
        if fullWidth:
            modifiers.append('full-width')
        self.set_style_class(*modifiers)
        
        self.setEnabled(not disabled)
        self._apply_style(fullWidth)
    
    def _apply_style(self, fullWidth: bool):
        """Apply input styling."""
        self.setMinimumHeight(40)
        if fullWidth:
            self.setMinimumWidth(0)
    
    def set_error(self, error: bool):
        """Set error state."""
        if error:
            self.add_modifier('error')
        else:
            self.remove_modifier('error')


class TextArea(QTextEdit, StyleMixin):
    """Multi-line text input."""
    
    _base_class = 'textarea'
    
    def __init__(
        self,
        parent=None,
        placeholder: str = '',
        value: str = '',
        rows: int = 4,
        error: bool = False,
        disabled: bool = False,
    ):
        super().__init__(parent)
        
        if placeholder:
            self.setPlaceholderText(placeholder)
        if value:
            self.setPlainText(value)
        
        modifiers = []
        if error:
            modifiers.append('error')
        self.set_style_class(*modifiers)
        
        self.setEnabled(not disabled)
        self._apply_style(rows)
    
    def _apply_style(self, rows: int):
        """Apply textarea styling."""
        font_metrics = self.fontMetrics()
        line_height = font_metrics.lineSpacing()
        self.setMinimumHeight(line_height * rows + 16)


class Select(QComboBox, StyleMixin):
    """Dropdown select component."""
    
    _base_class = 'select'
    
    def __init__(
        self,
        parent=None,
        options: list = None,
        value: str = '',
        placeholder: str = '',
        error: bool = False,
        disabled: bool = False,
    ):
        super().__init__(parent)
        
        if placeholder:
            self.addItem(placeholder)
            self.setCurrentIndex(0)
        
        if options:
            for opt in options:
                if isinstance(opt, tuple):
                    self.addItem(opt[0], opt[1])
                else:
                    self.addItem(str(opt))
        
        if value:
            index = self.findText(value)
            if index >= 0:
                self.setCurrentIndex(index)
        
        modifiers = []
        if error:
            modifiers.append('error')
        self.set_style_class(*modifiers)
        
        self.setEnabled(not disabled)
        self._apply_style()
    
    def _apply_style(self):
        """Apply select styling."""
        self.setMinimumHeight(40)


class CheckBox(QCheckBox, StyleMixin):
    """Material-style checkbox."""
    
    _base_class = 'checkbox'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        checked: bool = False,
        disabled: bool = False,
        color: str = 'primary',
    ):
        super().__init__(text, parent)
        
        self.setChecked(checked)
        self.setEnabled(not disabled)
        self.set_style_class(color)


class RadioButton(QRadioButton, StyleMixin):
    """Material-style radio button."""
    
    _base_class = 'radio'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        checked: bool = False,
        disabled: bool = False,
        color: str = 'primary',
    ):
        super().__init__(text, parent)
        
        self.setChecked(checked)
        self.setEnabled(not disabled)
        self.set_style_class(color)


class Switch(QCheckBox, StyleMixin):
    """Toggle switch component."""
    
    _base_class = 'switch'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        checked: bool = False,
        disabled: bool = False,
        color: str = 'primary',
    ):
        super().__init__(text, parent)
        
        self.setChecked(checked)
        self.setEnabled(not disabled)
        self.set_style_class(color)


class Slider(QSlider, StyleMixin):
    """Material-style slider."""
    
    _base_class = 'slider'
    
    def __init__(
        self,
        parent=None,
        orientation: Qt.Orientation = Qt.Orientation.Horizontal,
        min_val: int = 0,
        max_val: int = 100,
        value: int = 50,
        disabled: bool = False,
        color: str = 'primary',
    ):
        super().__init__(orientation, parent)
        
        self.setMinimum(min_val)
        self.setMaximum(max_val)
        self.setValue(value)
        self.setEnabled(not disabled)
        self.set_style_class(color)


class FormGroup(FakeMUIContainer):
    """Container for form controls."""
    
    _base_class = 'form-group'
    
    def __init__(self, parent=None, row: bool = False):
        super().__init__(parent, 'horizontal' if row else 'vertical')
        self.set_spacing(8)


class FormLabel(QLabel, StyleMixin):
    """Label for form fields."""
    
    _base_class = 'form-label'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        required: bool = False,
        error: bool = False,
    ):
        display_text = f"{text} *" if required else text
        super().__init__(display_text, parent)
        
        modifiers = []
        if required:
            modifiers.append('required')
        if error:
            modifiers.append('error')
        self.set_style_class(*modifiers)


class FormHelperText(QLabel, StyleMixin):
    """Helper text below form fields."""
    
    _base_class = 'form-helper-text'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        error: bool = False,
    ):
        super().__init__(text, parent)
        
        modifiers = []
        if error:
            modifiers.append('error')
        self.set_style_class(*modifiers)
        
        self._apply_style()
    
    def _apply_style(self):
        """Apply helper text styling."""
        font = self.font()
        font.setPointSize(font.pointSize() - 2)
        self.setFont(font)


class TextField(FakeMUIContainer):
    """Complete text field with label and helper text."""
    
    _base_class = 'text-field'
    
    textChanged = pyqtSignal(str)
    
    def __init__(
        self,
        parent=None,
        label: str = '',
        placeholder: str = '',
        value: str = '',
        helperText: str = '',
        error: bool = False,
        disabled: bool = False,
        required: bool = False,
        multiline: bool = False,
        rows: int = 4,
    ):
        super().__init__(parent, 'vertical')
        
        self._error = error
        
        # Label
        if label:
            self._label = FormLabel(label, required=required, error=error)
            self.add_widget(self._label)
        else:
            self._label = None
        
        # Input
        if multiline:
            self._input = TextArea(
                placeholder=placeholder,
                value=value,
                rows=rows,
                error=error,
                disabled=disabled,
            )
            self._input.textChanged.connect(lambda: self.textChanged.emit(self._input.toPlainText()))
        else:
            self._input = Input(
                placeholder=placeholder,
                value=value,
                error=error,
                disabled=disabled,
                fullWidth=True,
            )
            self._input.textChanged.connect(self.textChanged.emit)
        self.add_widget(self._input)
        
        # Helper text
        if helperText:
            self._helper = FormHelperText(helperText, error=error)
            self.add_widget(self._helper)
        else:
            self._helper = None
        
        if error:
            self.add_modifier('error')
    
    def text(self) -> str:
        """Get the current text value."""
        if isinstance(self._input, TextArea):
            return self._input.toPlainText()
        return self._input.text()
    
    def setText(self, text: str):
        """Set the text value."""
        if isinstance(self._input, TextArea):
            self._input.setPlainText(text)
        else:
            self._input.setText(text)
    
    def setError(self, error: bool, message: str = ''):
        """Set error state."""
        self._error = error
        self._input.set_error(error)
        if self._label:
            if error:
                self._label.add_modifier('error')
            else:
                self._label.remove_modifier('error')
        if self._helper and message:
            self._helper.setText(message)
            if error:
                self._helper.add_modifier('error')
            else:
                self._helper.remove_modifier('error')


class ToggleButton(QPushButton, StyleMixin):
    """Toggle button that can be selected."""
    
    _base_class = 'toggle-btn'
    
    def __init__(
        self,
        text: str = '',
        parent=None,
        selected: bool = False,
        disabled: bool = False,
        value: str = '',
    ):
        super().__init__(text, parent)
        
        self.setCheckable(True)
        self.setChecked(selected)
        self.setEnabled(not disabled)
        self._value = value
        
        modifiers = []
        if selected:
            modifiers.append('selected')
        self.set_style_class(*modifiers)
        
        self.clicked.connect(self._on_click)
    
    def _on_click(self):
        """Handle click to update style."""
        if self.isChecked():
            self.add_modifier('selected')
        else:
            self.remove_modifier('selected')
    
    @property
    def value(self) -> str:
        return self._value


class ToggleButtonGroup(FakeMUIContainer):
    """Group of toggle buttons with exclusive selection."""
    
    _base_class = 'toggle-btn-group'
    
    valueChanged = pyqtSignal(str)
    
    def __init__(
        self,
        parent=None,
        exclusive: bool = True,
        orientation: str = 'horizontal',
    ):
        super().__init__(parent, orientation)
        
        self._button_group = QButtonGroup(self)
        self._button_group.setExclusive(exclusive)
        self._buttons = []
    
    def add_button(self, button: ToggleButton):
        """Add a toggle button to the group."""
        self._button_group.addButton(button)
        self._buttons.append(button)
        self.add_widget(button)
        button.clicked.connect(lambda: self.valueChanged.emit(button.value))
    
    def get_value(self) -> str:
        """Get the currently selected value."""
        checked = self._button_group.checkedButton()
        if checked and hasattr(checked, 'value'):
            return checked.value
        return ''
