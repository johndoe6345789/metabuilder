"""Feedback components for FakeMUI."""

from PyQt6.QtWidgets import (
    QWidget, QLabel, QFrame, QVBoxLayout, QHBoxLayout,
    QProgressBar, QPushButton, QGraphicsOpacityEffect
)
from PyQt6.QtCore import (
    Qt, pyqtSignal, QTimer, QPropertyAnimation, 
    QEasingCurve, QSize, pyqtProperty
)
from PyQt6.QtGui import QColor, QPainter, QPen, QBrush, QIcon

from .base import FakeMUIWidget, FakeMUIContainer, StyleMixin, THEME_COLORS


class Alert(FakeMUIContainer):
    """Alert component for displaying messages."""
    
    _base_class = 'alert'
    
    onClose = pyqtSignal()
    
    def __init__(
        self,
        parent=None,
        title: str = '',
        message: str = '',
        severity: str = 'info',  # error, warning, info, success
        icon: QIcon = None,
        closable: bool = False,
        action: QWidget = None,
    ):
        super().__init__(parent, 'horizontal')
        
        self.set_style_class(severity)
        self.set_spacing(8)
        self.set_padding(12)
        
        # Icon
        if icon:
            icon_label = QLabel()
            icon_label.setPixmap(icon.pixmap(24, 24))
            icon_label.setObjectName('alert-icon')
            self.add_widget(icon_label)
        
        # Content
        content = FakeMUIContainer(layout_type='vertical')
        content.setObjectName('alert-content')
        if title:
            title_label = QLabel(title)
            title_label.setObjectName('alert-title')
            title_label.setStyleSheet('font-weight: bold;')
            content.add_widget(title_label)
        if message:
            msg_label = QLabel(message)
            msg_label.setObjectName('alert-message')
            msg_label.setWordWrap(True)
            content.add_widget(msg_label)
        self.add_widget(content, stretch=1)
        
        # Action
        if action:
            action.setObjectName('alert-action')
            self.add_widget(action)
        
        # Close button
        if closable:
            close_btn = QPushButton('×')
            close_btn.setObjectName('alert-close')
            close_btn.setFixedSize(24, 24)
            close_btn.clicked.connect(self._close)
            self.add_widget(close_btn)
    
    def _close(self):
        """Close the alert."""
        self.onClose.emit()
        self.hide()


class Backdrop(QFrame, StyleMixin):
    """Full-screen backdrop overlay."""
    
    _base_class = 'backdrop'
    
    clicked = pyqtSignal()
    
    def __init__(
        self,
        parent=None,
        open: bool = False,
        invisible: bool = False,
    ):
        super().__init__(parent)
        
        modifiers = []
        if invisible:
            modifiers.append('invisible')
        self.set_style_class(*modifiers)
        
        self.setVisible(open)
        
        if not invisible:
            self.setStyleSheet('background-color: rgba(0, 0, 0, 0.5);')
    
    def mousePressEvent(self, event):
        """Emit click signal."""
        self.clicked.emit()
        super().mousePressEvent(event)
    
    def set_open(self, open: bool):
        """Set visibility."""
        self.setVisible(open)


class Spinner(QWidget):
    """Spinning loading indicator."""
    
    def __init__(
        self,
        parent=None,
        size: int = 40,
        thickness: int = 4,
        color: str = 'primary',
    ):
        super().__init__(parent)
        
        self.setFixedSize(size, size)
        self._thickness = thickness
        self._angle = 0
        self._color = THEME_COLORS.get(color, THEME_COLORS['primary'])
        
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._rotate)
        self._timer.start(16)  # ~60fps
    
    def _rotate(self):
        """Rotate the spinner."""
        self._angle = (self._angle + 6) % 360
        self.update()
    
    def paintEvent(self, event):
        """Draw the spinner."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        rect = self.rect().adjusted(
            self._thickness, self._thickness,
            -self._thickness, -self._thickness
        )
        
        pen = QPen(QColor(self._color))
        pen.setWidth(self._thickness)
        pen.setCapStyle(Qt.PenCapStyle.RoundCap)
        painter.setPen(pen)
        
        # Draw arc
        painter.drawArc(rect, self._angle * 16, 270 * 16)


class CircularProgress(Spinner):
    """Alias for Spinner."""
    pass


class LinearProgress(QProgressBar, StyleMixin):
    """Linear progress bar."""
    
    _base_class = 'linear-progress'
    
    def __init__(
        self,
        parent=None,
        value: int = 0,
        variant: str = 'determinate',  # determinate, indeterminate, buffer
        color: str = 'primary',
    ):
        super().__init__(parent)
        
        self.set_style_class(variant, color)
        
        if variant == 'indeterminate':
            self.setMinimum(0)
            self.setMaximum(0)
        else:
            self.setMinimum(0)
            self.setMaximum(100)
            self.setValue(value)
        
        self.setTextVisible(False)
        self.setFixedHeight(4)


class Progress(LinearProgress):
    """Alias for LinearProgress."""
    pass


class Skeleton(QFrame, StyleMixin):
    """Loading placeholder animation."""
    
    _base_class = 'skeleton'
    
    def __init__(
        self,
        parent=None,
        variant: str = 'text',  # text, rectangular, circular
        width: int = None,
        height: int = None,
        animation: str = 'pulse',  # pulse, wave, false
    ):
        super().__init__(parent)
        
        self.set_style_class(variant, animation)
        
        if width:
            self.setFixedWidth(width)
        if height:
            self.setFixedHeight(height)
        elif variant == 'text':
            self.setFixedHeight(20)
        elif variant == 'circular':
            size = width or 40
            self.setFixedSize(size, size)
        
        # Animation
        if animation == 'pulse':
            self._setup_pulse_animation()
    
    def _setup_pulse_animation(self):
        """Setup pulse animation."""
        self._opacity_effect = QGraphicsOpacityEffect(self)
        self.setGraphicsEffect(self._opacity_effect)
        
        self._animation = QPropertyAnimation(self._opacity_effect, b"opacity")
        self._animation.setDuration(1500)
        self._animation.setStartValue(0.3)
        self._animation.setEndValue(1.0)
        self._animation.setEasingCurve(QEasingCurve.Type.InOutSine)
        self._animation.setLoopCount(-1)  # Infinite
        self._animation.start()


class Snackbar(FakeMUIContainer):
    """Brief message at bottom of screen."""
    
    _base_class = 'snackbar'
    
    onClose = pyqtSignal()
    
    def __init__(
        self,
        parent=None,
        message: str = '',
        action: str = '',
        autoHideDuration: int = 6000,
        anchorOrigin: dict = None,  # {'vertical': 'bottom', 'horizontal': 'center'}
    ):
        super().__init__(parent, 'horizontal')
        
        self.set_spacing(16)
        self.set_padding(8)
        
        # Message
        msg_label = QLabel(message)
        msg_label.setObjectName('snackbar-message')
        self.add_widget(msg_label, stretch=1)
        
        # Action button
        if action:
            action_btn = QPushButton(action)
            action_btn.setObjectName('snackbar-action')
            action_btn.setFlat(True)
            action_btn.clicked.connect(self.close)
            self.add_widget(action_btn)
        
        # Auto hide timer
        if autoHideDuration > 0:
            self._timer = QTimer(self)
            self._timer.setSingleShot(True)
            self._timer.timeout.connect(self.close)
            self._timer.start(autoHideDuration)
        
        self.hide()
    
    def show_message(self, message: str, duration: int = 6000):
        """Show the snackbar with a message."""
        for child in self.findChildren(QLabel, 'snackbar-message'):
            child.setText(message)
        
        if hasattr(self, '_timer'):
            self._timer.stop()
            self._timer.start(duration)
        
        self.show()
    
    def close(self):
        """Close the snackbar."""
        self.onClose.emit()
        self.hide()
