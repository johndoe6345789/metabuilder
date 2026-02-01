"""
FakeMUI Theming Module for PyQt6

Provides theme management, styled components, and sx prop processing.
"""

from typing import Any, Callable, Dict, Optional, Type, Union
from dataclasses import dataclass, field
from PyQt6.QtWidgets import QWidget, QApplication
from PyQt6.QtCore import QObject, pyqtSignal
from PyQt6.QtGui import QColor, QFont


# =============================================================================
# Default Theme Configuration
# =============================================================================

@dataclass
class Palette:
    """Color palette configuration."""
    
    # Primary colors
    primary_main: str = "#1976d2"
    primary_light: str = "#42a5f5"
    primary_dark: str = "#1565c0"
    primary_contrast_text: str = "#ffffff"
    
    # Secondary colors
    secondary_main: str = "#9c27b0"
    secondary_light: str = "#ba68c8"
    secondary_dark: str = "#7b1fa2"
    secondary_contrast_text: str = "#ffffff"
    
    # Error colors
    error_main: str = "#d32f2f"
    error_light: str = "#ef5350"
    error_dark: str = "#c62828"
    error_contrast_text: str = "#ffffff"
    
    # Warning colors
    warning_main: str = "#ed6c02"
    warning_light: str = "#ff9800"
    warning_dark: str = "#e65100"
    warning_contrast_text: str = "#ffffff"
    
    # Info colors
    info_main: str = "#0288d1"
    info_light: str = "#03a9f4"
    info_dark: str = "#01579b"
    info_contrast_text: str = "#ffffff"
    
    # Success colors
    success_main: str = "#2e7d32"
    success_light: str = "#4caf50"
    success_dark: str = "#1b5e20"
    success_contrast_text: str = "#ffffff"
    
    # Grey scale
    grey_50: str = "#fafafa"
    grey_100: str = "#f5f5f5"
    grey_200: str = "#eeeeee"
    grey_300: str = "#e0e0e0"
    grey_400: str = "#bdbdbd"
    grey_500: str = "#9e9e9e"
    grey_600: str = "#757575"
    grey_700: str = "#616161"
    grey_800: str = "#424242"
    grey_900: str = "#212121"
    
    # Text colors
    text_primary: str = "rgba(0, 0, 0, 0.87)"
    text_secondary: str = "rgba(0, 0, 0, 0.6)"
    text_disabled: str = "rgba(0, 0, 0, 0.38)"
    
    # Background colors
    background_default: str = "#ffffff"
    background_paper: str = "#ffffff"
    
    # Divider
    divider: str = "rgba(0, 0, 0, 0.12)"
    
    # Action colors
    action_active: str = "rgba(0, 0, 0, 0.54)"
    action_hover: str = "rgba(0, 0, 0, 0.04)"
    action_selected: str = "rgba(0, 0, 0, 0.08)"
    action_disabled: str = "rgba(0, 0, 0, 0.26)"
    action_disabled_background: str = "rgba(0, 0, 0, 0.12)"
    
    mode: str = "light"


@dataclass
class Typography:
    """Typography configuration."""
    
    font_family: str = '"Roboto", "Helvetica", "Arial", sans-serif'
    font_size: int = 14
    font_weight_light: int = 300
    font_weight_regular: int = 400
    font_weight_medium: int = 500
    font_weight_bold: int = 700
    
    # Variant sizes
    h1_size: str = "96px"
    h2_size: str = "60px"
    h3_size: str = "48px"
    h4_size: str = "34px"
    h5_size: str = "24px"
    h6_size: str = "20px"
    subtitle1_size: str = "16px"
    subtitle2_size: str = "14px"
    body1_size: str = "16px"
    body2_size: str = "14px"
    button_size: str = "14px"
    caption_size: str = "12px"
    overline_size: str = "12px"


@dataclass
class Shape:
    """Shape configuration."""
    border_radius: int = 4


@dataclass
class Shadows:
    """Shadow configuration."""
    
    def __post_init__(self):
        self.values = [
            "none",
            "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
            "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
            "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
            "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
            "0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)",
            "0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)",
            "0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)",
            "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
        ]
    
    def __getitem__(self, index: int) -> str:
        if 0 <= index < len(self.values):
            return self.values[index]
        return self.values[-1]


@dataclass
class Transitions:
    """Transition configuration."""
    
    duration_shortest: int = 150
    duration_shorter: int = 200
    duration_short: int = 250
    duration_standard: int = 300
    duration_complex: int = 375
    duration_entering_screen: int = 225
    duration_leaving_screen: int = 195
    
    easing_ease_in_out: str = "cubic-bezier(0.4, 0, 0.2, 1)"
    easing_ease_out: str = "cubic-bezier(0.0, 0, 0.2, 1)"
    easing_ease_in: str = "cubic-bezier(0.4, 0, 1, 1)"
    easing_sharp: str = "cubic-bezier(0.4, 0, 0.6, 1)"


@dataclass
class ZIndex:
    """Z-index configuration."""
    
    mobile_stepper: int = 1000
    fab: int = 1050
    speed_dial: int = 1050
    app_bar: int = 1100
    drawer: int = 1200
    modal: int = 1300
    snackbar: int = 1400
    tooltip: int = 1500


@dataclass  
class Breakpoints:
    """Breakpoint configuration."""
    
    xs: int = 0
    sm: int = 600
    md: int = 900
    lg: int = 1200
    xl: int = 1536
    
    def up(self, key: str) -> str:
        """Get media query for screens larger than breakpoint."""
        value = getattr(self, key, 0)
        return f"@media (min-width: {value}px)"
    
    def down(self, key: str) -> str:
        """Get media query for screens smaller than breakpoint."""
        value = getattr(self, key, 0)
        return f"@media (max-width: {value - 0.05}px)"
    
    def between(self, start: str, end: str) -> str:
        """Get media query for screens between two breakpoints."""
        start_val = getattr(self, start, 0)
        end_val = getattr(self, end, 0)
        return f"@media (min-width: {start_val}px) and (max-width: {end_val - 0.05}px)"


@dataclass
class Theme:
    """Complete theme configuration."""
    
    palette: Palette = field(default_factory=Palette)
    typography: Typography = field(default_factory=Typography)
    shape: Shape = field(default_factory=Shape)
    shadows: Shadows = field(default_factory=Shadows)
    transitions: Transitions = field(default_factory=Transitions)
    zIndex: ZIndex = field(default_factory=ZIndex)
    breakpoints: Breakpoints = field(default_factory=Breakpoints)
    
    def spacing(self, *args: float) -> str:
        """
        Calculate spacing based on 8px unit.
        
        spacing(1) -> "8px"
        spacing(1, 2) -> "8px 16px"
        spacing(1, 2, 3, 4) -> "8px 16px 24px 32px"
        """
        if not args:
            return "0px"
        return " ".join(f"{int(v * 8)}px" for v in args)


# Default theme instance
default_theme = Theme()


def create_theme(options: Optional[Dict[str, Any]] = None) -> Theme:
    """
    Create a new theme with custom options.
    
    Args:
        options: Dictionary of theme options to override defaults.
        
    Returns:
        A new Theme instance.
    """
    theme = Theme()
    
    if options:
        # Handle palette options
        if "palette" in options:
            palette_opts = options["palette"]
            if "mode" in palette_opts and palette_opts["mode"] == "dark":
                # Apply dark mode defaults
                theme.palette.mode = "dark"
                theme.palette.background_default = "#121212"
                theme.palette.background_paper = "#1e1e1e"
                theme.palette.text_primary = "rgba(255, 255, 255, 0.87)"
                theme.palette.text_secondary = "rgba(255, 255, 255, 0.6)"
                theme.palette.text_disabled = "rgba(255, 255, 255, 0.38)"
                theme.palette.divider = "rgba(255, 255, 255, 0.12)"
            
            # Override specific palette colors
            for key, value in palette_opts.items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        attr_name = f"{key}_{sub_key}"
                        if hasattr(theme.palette, attr_name):
                            setattr(theme.palette, attr_name, sub_value)
                elif hasattr(theme.palette, key):
                    setattr(theme.palette, key, value)
        
        # Handle typography options
        if "typography" in options:
            for key, value in options["typography"].items():
                if hasattr(theme.typography, key):
                    setattr(theme.typography, key, value)
        
        # Handle shape options
        if "shape" in options:
            for key, value in options["shape"].items():
                if hasattr(theme.shape, key):
                    setattr(theme.shape, key, value)
    
    return theme


# =============================================================================
# Theme Provider
# =============================================================================

class ThemeProvider(QObject):
    """
    Provides theme context for FakeMUI components.
    
    Usage:
        theme = create_theme({"palette": {"mode": "dark"}})
        provider = ThemeProvider(theme)
        provider.apply_to(my_widget)
    """
    
    theme_changed = pyqtSignal(object)
    
    _instance: Optional['ThemeProvider'] = None
    _current_theme: Theme = default_theme
    
    def __init__(self, theme: Optional[Theme] = None):
        super().__init__()
        self._theme = theme or default_theme
        ThemeProvider._current_theme = self._theme
        ThemeProvider._instance = self
    
    @property
    def theme(self) -> Theme:
        return self._theme
    
    @theme.setter
    def theme(self, value: Theme):
        self._theme = value
        ThemeProvider._current_theme = value
        self.theme_changed.emit(value)
    
    @classmethod
    def get_theme(cls) -> Theme:
        """Get the current theme."""
        return cls._current_theme
    
    @classmethod
    def get_instance(cls) -> Optional['ThemeProvider']:
        """Get the current theme provider instance."""
        return cls._instance
    
    def apply_to(self, widget: QWidget):
        """Apply theme stylesheet to a widget."""
        stylesheet = self.generate_stylesheet()
        widget.setStyleSheet(stylesheet)
    
    def generate_stylesheet(self) -> str:
        """Generate a complete stylesheet from the current theme."""
        p = self._theme.palette
        t = self._theme.typography
        s = self._theme.shape
        
        return f"""
            /* Base styles */
            QWidget {{
                font-family: {t.font_family};
                font-size: {t.font_size}px;
                color: {p.text_primary};
                background-color: {p.background_default};
            }}
            
            /* Primary button */
            .fakemui-button-primary {{
                background-color: {p.primary_main};
                color: {p.primary_contrast_text};
                border-radius: {s.border_radius}px;
            }}
            .fakemui-button-primary:hover {{
                background-color: {p.primary_dark};
            }}
            
            /* Secondary button */
            .fakemui-button-secondary {{
                background-color: {p.secondary_main};
                color: {p.secondary_contrast_text};
                border-radius: {s.border_radius}px;
            }}
            
            /* Error button */
            .fakemui-button-error {{
                background-color: {p.error_main};
                color: {p.error_contrast_text};
                border-radius: {s.border_radius}px;
            }}
            
            /* Paper/Card */
            .fakemui-paper, .fakemui-card {{
                background-color: {p.background_paper};
                border-radius: {s.border_radius}px;
            }}
            
            /* Input fields */
            QLineEdit, QTextEdit, QPlainTextEdit {{
                background-color: {p.background_paper};
                color: {p.text_primary};
                border: 1px solid {p.divider};
                border-radius: {s.border_radius}px;
            }}
            
            /* Labels */
            QLabel {{
                color: {p.text_primary};
            }}
            
            /* Disabled state */
            *:disabled {{
                color: {p.text_disabled};
            }}
        """


def use_theme() -> Theme:
    """
    Hook-like function to get the current theme.
    
    Returns:
        The current theme instance.
    """
    return ThemeProvider.get_theme()


# =============================================================================
# Styled Components
# =============================================================================

# Shorthand property mappings for sx prop
SX_SHORTHANDS = {
    "m": "margin",
    "mt": "margin-top",
    "mr": "margin-right",
    "mb": "margin-bottom",
    "ml": "margin-left",
    "mx": ("margin-left", "margin-right"),
    "my": ("margin-top", "margin-bottom"),
    "p": "padding",
    "pt": "padding-top",
    "pr": "padding-right",
    "pb": "padding-bottom",
    "pl": "padding-left",
    "px": ("padding-left", "padding-right"),
    "py": ("padding-top", "padding-bottom"),
    "bgcolor": "background-color",
    "color": "color",
    "width": "width",
    "height": "height",
    "minWidth": "min-width",
    "maxWidth": "max-width",
    "minHeight": "min-height",
    "maxHeight": "max-height",
    "display": "display",
    "overflow": "overflow",
    "textAlign": "text-align",
    "fontWeight": "font-weight",
    "fontSize": "font-size",
    "fontFamily": "font-family",
    "lineHeight": "line-height",
    "letterSpacing": "letter-spacing",
    "textTransform": "text-transform",
    "border": "border",
    "borderTop": "border-top",
    "borderRight": "border-right",
    "borderBottom": "border-bottom",
    "borderLeft": "border-left",
    "borderColor": "border-color",
    "borderRadius": "border-radius",
    "boxShadow": "box-shadow",
    "zIndex": "z-index",
    "position": "position",
    "top": "top",
    "right": "right",
    "bottom": "bottom",
    "left": "left",
    "flex": "flex",
    "flexGrow": "flex-grow",
    "flexShrink": "flex-shrink",
    "flexBasis": "flex-basis",
    "justifyContent": "justify-content",
    "alignItems": "align-items",
    "alignContent": "align-content",
    "alignSelf": "align-self",
    "gap": "gap",
    "gridTemplateColumns": "grid-template-columns",
    "gridTemplateRows": "grid-template-rows",
    "gridColumn": "grid-column",
    "gridRow": "grid-row",
}


def process_sx_value(value: Any, theme: Theme) -> str:
    """
    Process an sx prop value, converting theme references.
    
    Args:
        value: The value to process (can be number for spacing, string, etc.)
        theme: The current theme.
        
    Returns:
        A CSS-compatible value string.
    """
    if isinstance(value, (int, float)):
        # Treat numbers as spacing units
        return theme.spacing(value)
    elif isinstance(value, str):
        # Check for theme color references
        if value.startswith("primary"):
            return getattr(theme.palette, f"primary_{value.split('.')[1] if '.' in value else 'main'}", value)
        elif value.startswith("secondary"):
            return getattr(theme.palette, f"secondary_{value.split('.')[1] if '.' in value else 'main'}", value)
        elif value.startswith("error"):
            return getattr(theme.palette, f"error_{value.split('.')[1] if '.' in value else 'main'}", value)
        elif value.startswith("grey"):
            return getattr(theme.palette, f"grey_{value.split('.')[1] if '.' in value else '500'}", value)
        return value
    return str(value)


def process_sx_prop(sx: Dict[str, Any], theme: Optional[Theme] = None) -> str:
    """
    Process an sx prop dictionary into CSS styles.
    
    Args:
        sx: Dictionary of style properties (can use MUI shorthands).
        theme: Optional theme for value processing.
        
    Returns:
        A CSS style string.
    """
    if theme is None:
        theme = use_theme()
    
    styles = []
    
    for key, value in sx.items():
        css_prop = SX_SHORTHANDS.get(key, key)
        processed_value = process_sx_value(value, theme)
        
        if isinstance(css_prop, tuple):
            # Handle shorthand properties that expand to multiple
            for prop in css_prop:
                styles.append(f"{prop}: {processed_value}")
        else:
            styles.append(f"{css_prop}: {processed_value}")
    
    return "; ".join(styles)


def styled(base_class: Type[QWidget]) -> Callable:
    """
    Create a styled component factory.
    
    Usage:
        StyledButton = styled(QPushButton)(
            lambda theme: f'''
                background-color: {theme.palette.primary_main};
                color: {theme.palette.primary_contrast_text};
            '''
        )
        button = StyledButton()
    
    Args:
        base_class: The base QWidget class to style.
        
    Returns:
        A factory function that creates the styled component.
    """
    def style_factory(style_fn: Callable[[Theme], str]) -> Type[QWidget]:
        class StyledWidget(base_class):
            def __init__(self, *args, sx: Optional[Dict[str, Any]] = None, **kwargs):
                super().__init__(*args, **kwargs)
                theme = use_theme()
                
                # Apply base styles from style function
                base_styles = style_fn(theme)
                
                # Apply sx prop styles
                sx_styles = ""
                if sx:
                    sx_styles = process_sx_prop(sx, theme)
                
                # Combine and set stylesheet
                combined = base_styles
                if sx_styles:
                    combined = f"{base_styles}; {sx_styles}"
                
                self.setStyleSheet(combined)
                
                # Store for potential updates
                self._style_fn = style_fn
                self._sx = sx
            
            def update_theme(self, theme: Theme):
                """Update component when theme changes."""
                base_styles = self._style_fn(theme)
                sx_styles = ""
                if self._sx:
                    sx_styles = process_sx_prop(self._sx, theme)
                
                combined = base_styles
                if sx_styles:
                    combined = f"{base_styles}; {sx_styles}"
                self.setStyleSheet(combined)
        
        return StyledWidget
    
    return style_factory


# =============================================================================
# Exports
# =============================================================================

__all__ = [
    # Theme
    "Theme",
    "Palette",
    "Typography",
    "Shape",
    "Shadows",
    "Transitions",
    "ZIndex",
    "Breakpoints",
    "default_theme",
    "create_theme",
    # Provider
    "ThemeProvider",
    "use_theme",
    # Styled
    "styled",
    "process_sx_prop",
    "SX_SHORTHANDS",
]
