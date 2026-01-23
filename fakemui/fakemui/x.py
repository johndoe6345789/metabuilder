"""
FakeMUI X Module for PyQt6

Provides advanced components like DataGrid and DatePicker.
"""

from typing import Any, Callable, Dict, List, Optional, Union
from datetime import date, datetime, time
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame,
    QTableWidget, QTableWidgetItem, QHeaderView, QCheckBox,
    QComboBox, QPushButton, QLineEdit, QCalendarWidget,
    QTimeEdit, QDateEdit, QSpinBox, QScrollArea, QMenu,
    QAbstractItemView, QSizePolicy, QGridLayout
)
from PyQt6.QtCore import Qt, pyqtSignal, QDate, QTime
from PyQt6.QtGui import QFont, QColor, QAction

from .base import FakeMUIWidget, StyleMixin


# =============================================================================
# DataGrid
# =============================================================================

class DataGridColumn:
    """Configuration for a DataGrid column."""
    
    def __init__(
        self,
        field: str,
        header_name: Optional[str] = None,
        width: Optional[int] = None,
        flex: Optional[float] = None,
        sortable: bool = True,
        filterable: bool = True,
        editable: bool = False,
        render_cell: Optional[Callable] = None,
        value_formatter: Optional[Callable] = None,
    ):
        self.field = field
        self.header_name = header_name or field
        self.width = width
        self.flex = flex
        self.sortable = sortable
        self.filterable = filterable
        self.editable = editable
        self.render_cell = render_cell
        self.value_formatter = value_formatter


class DataGrid(QFrame, StyleMixin):
    """
    A powerful data table component.
    
    Signals:
        selection_changed: Emitted when selection changes.
        sort_changed: Emitted when sort changes.
        row_clicked: Emitted when a row is clicked.
        cell_clicked: Emitted when a cell is clicked.
        page_changed: Emitted when page changes.
    """
    
    selection_changed = pyqtSignal(list)  # List of selected row IDs
    sort_changed = pyqtSignal(str, str)  # field, direction ('asc'/'desc')
    row_clicked = pyqtSignal(dict)  # row data
    cell_clicked = pyqtSignal(str, object)  # field, value
    page_changed = pyqtSignal(int)  # page number
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        rows: Optional[List[Dict]] = None,
        columns: Optional[List[DataGridColumn]] = None,
        page_size: int = 10,
        rows_per_page_options: Optional[List[int]] = None,
        pagination: bool = True,
        checkbox_selection: bool = False,
        disable_selection_on_click: bool = False,
        auto_height: bool = False,
        density: str = "standard",
        loading: bool = False,
        get_row_id: Optional[Callable] = None,
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._rows = rows or []
        self._columns = columns or []
        self._page_size = page_size
        self._rows_per_page_options = rows_per_page_options or [5, 10, 25, 50]
        self._pagination = pagination
        self._checkbox_selection = checkbox_selection
        self._disable_selection_on_click = disable_selection_on_click
        self._auto_height = auto_height
        self._density = density
        self._loading = loading
        self._get_row_id = get_row_id or (lambda row: row.get("id", id(row)))
        
        self._current_page = 0
        self._sort_field: Optional[str] = None
        self._sort_direction: str = "asc"
        self._selected_ids: List[Any] = []
        
        self._setup_ui()
        self._apply_styles()
        self._refresh_data()
    
    def _setup_ui(self):
        """Set up the UI components."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Table
        self._table = QTableWidget()
        self._table.setAlternatingRowColors(True)
        self._table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self._table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        self._table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self._table.verticalHeader().setVisible(False)
        self._table.setShowGrid(True)
        self._table.horizontalHeader().sectionClicked.connect(self._on_header_clicked)
        self._table.cellClicked.connect(self._on_cell_clicked)
        
        layout.addWidget(self._table, 1)
        
        # Footer with pagination
        if self._pagination:
            self._footer = QFrame()
            footer_layout = QHBoxLayout(self._footer)
            footer_layout.setContentsMargins(8, 4, 8, 4)
            
            # Rows per page selector
            footer_layout.addWidget(QLabel("Rows per page:"))
            self._page_size_combo = QComboBox()
            for opt in self._rows_per_page_options:
                self._page_size_combo.addItem(str(opt), opt)
            self._page_size_combo.setCurrentText(str(self._page_size))
            self._page_size_combo.currentIndexChanged.connect(self._on_page_size_changed)
            footer_layout.addWidget(self._page_size_combo)
            
            footer_layout.addStretch()
            
            # Page info
            self._page_info = QLabel()
            footer_layout.addWidget(self._page_info)
            
            # Navigation buttons
            self._prev_btn = QPushButton("‹")
            self._prev_btn.setFixedWidth(32)
            self._prev_btn.clicked.connect(self._prev_page)
            footer_layout.addWidget(self._prev_btn)
            
            self._next_btn = QPushButton("›")
            self._next_btn.setFixedWidth(32)
            self._next_btn.clicked.connect(self._next_page)
            footer_layout.addWidget(self._next_btn)
            
            layout.addWidget(self._footer)
        
        # Loading overlay
        self._loading_label = QLabel("Loading...")
        self._loading_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._loading_label.setStyleSheet("""
            QLabel {
                background-color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                color: #666;
            }
        """)
        self._loading_label.setVisible(False)
    
    def _apply_styles(self):
        """Apply styles based on density."""
        row_heights = {
            "compact": 36,
            "standard": 52,
            "comfortable": 64,
        }
        row_height = row_heights.get(self._density, 52)
        
        self.add_class("fakemui-data-grid")
        self.add_class(f"fakemui-data-grid-density-{self._density}")
        
        self.setStyleSheet(f"""
            QFrame {{
                background-color: white;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
            }}
            QTableWidget {{
                background-color: white;
                border: none;
                gridline-color: #e0e0e0;
            }}
            QTableWidget::item {{
                padding: 8px;
            }}
            QHeaderView::section {{
                background-color: #fafafa;
                padding: 8px;
                border: none;
                border-bottom: 1px solid #e0e0e0;
                font-weight: 500;
            }}
            QHeaderView::section:hover {{
                background-color: #f5f5f5;
            }}
            QTableWidget::item:selected {{
                background-color: rgba(25, 118, 210, 0.08);
                color: black;
            }}
            QTableWidget::item:alternate {{
                background-color: #fafafa;
            }}
        """)
        
        self._table.verticalHeader().setDefaultSectionSize(row_height)
    
    def _refresh_data(self):
        """Refresh the table data."""
        # Sort data
        sorted_rows = self._rows[:]
        if self._sort_field:
            reverse = self._sort_direction == "desc"
            sorted_rows.sort(
                key=lambda r: r.get(self._sort_field, "") or "",
                reverse=reverse
            )
        
        # Paginate
        if self._pagination:
            start = self._current_page * self._page_size
            end = start + self._page_size
            display_rows = sorted_rows[start:end]
        else:
            display_rows = sorted_rows
        
        # Set up columns
        col_count = len(self._columns)
        if self._checkbox_selection:
            col_count += 1
        
        self._table.setColumnCount(col_count)
        
        headers = []
        if self._checkbox_selection:
            headers.append("☐")
        for col in self._columns:
            header = col.header_name
            if col.field == self._sort_field:
                header += " ↑" if self._sort_direction == "asc" else " ↓"
            headers.append(header)
        self._table.setHorizontalHeaderLabels(headers)
        
        # Set up rows
        self._table.setRowCount(len(display_rows))
        
        for row_idx, row_data in enumerate(display_rows):
            col_offset = 0
            row_id = self._get_row_id(row_data)
            
            # Checkbox column
            if self._checkbox_selection:
                checkbox = QCheckBox()
                checkbox.setChecked(row_id in self._selected_ids)
                checkbox.stateChanged.connect(
                    lambda state, rid=row_id: self._on_checkbox_changed(rid, state)
                )
                self._table.setCellWidget(row_idx, 0, checkbox)
                col_offset = 1
            
            # Data columns
            for col_idx, col in enumerate(self._columns):
                value = row_data.get(col.field, "")
                
                # Apply formatters
                if col.render_cell:
                    display_value = col.render_cell({
                        "row": row_data,
                        "value": value,
                        "field": col.field
                    })
                elif col.value_formatter:
                    display_value = col.value_formatter({"value": value})
                else:
                    display_value = str(value) if value is not None else ""
                
                item = QTableWidgetItem(str(display_value))
                item.setData(Qt.ItemDataRole.UserRole, row_data)
                self._table.setItem(row_idx, col_idx + col_offset, item)
        
        # Update pagination info
        if self._pagination:
            total = len(self._rows)
            start = self._current_page * self._page_size + 1
            end = min((self._current_page + 1) * self._page_size, total)
            self._page_info.setText(f"{start}–{end} of {total}")
            
            self._prev_btn.setEnabled(self._current_page > 0)
            self._next_btn.setEnabled(end < total)
    
    def _on_header_clicked(self, col_idx: int):
        """Handle header click for sorting."""
        if self._checkbox_selection:
            if col_idx == 0:
                return  # Checkbox column
            col_idx -= 1
        
        if col_idx < len(self._columns):
            col = self._columns[col_idx]
            if col.sortable:
                if self._sort_field == col.field:
                    self._sort_direction = "desc" if self._sort_direction == "asc" else "asc"
                else:
                    self._sort_field = col.field
                    self._sort_direction = "asc"
                
                self.sort_changed.emit(self._sort_field, self._sort_direction)
                self._refresh_data()
    
    def _on_cell_clicked(self, row: int, col: int):
        """Handle cell click."""
        item = self._table.item(row, col)
        if item:
            row_data = item.data(Qt.ItemDataRole.UserRole)
            if row_data:
                self.row_clicked.emit(row_data)
                
                if self._checkbox_selection:
                    col -= 1
                if col >= 0 and col < len(self._columns):
                    field = self._columns[col].field
                    value = row_data.get(field)
                    self.cell_clicked.emit(field, value)
    
    def _on_checkbox_changed(self, row_id: Any, state: int):
        """Handle checkbox state change."""
        if state == Qt.CheckState.Checked.value:
            if row_id not in self._selected_ids:
                self._selected_ids.append(row_id)
        else:
            if row_id in self._selected_ids:
                self._selected_ids.remove(row_id)
        
        self.selection_changed.emit(self._selected_ids)
    
    def _on_page_size_changed(self, index: int):
        """Handle page size change."""
        self._page_size = self._page_size_combo.currentData()
        self._current_page = 0
        self._refresh_data()
    
    def _prev_page(self):
        """Go to previous page."""
        if self._current_page > 0:
            self._current_page -= 1
            self.page_changed.emit(self._current_page)
            self._refresh_data()
    
    def _next_page(self):
        """Go to next page."""
        max_page = (len(self._rows) - 1) // self._page_size
        if self._current_page < max_page:
            self._current_page += 1
            self.page_changed.emit(self._current_page)
            self._refresh_data()
    
    def set_rows(self, rows: List[Dict]):
        """Set the data rows."""
        self._rows = rows
        self._current_page = 0
        self._refresh_data()
    
    def set_columns(self, columns: List[DataGridColumn]):
        """Set the columns."""
        self._columns = columns
        self._refresh_data()
    
    def get_selected_rows(self) -> List[Dict]:
        """Get selected rows."""
        return [
            row for row in self._rows
            if self._get_row_id(row) in self._selected_ids
        ]
    
    @property
    def loading(self) -> bool:
        return self._loading
    
    @loading.setter
    def loading(self, value: bool):
        self._loading = value
        self._loading_label.setVisible(value)


# Aliases for MUI X compatibility
DataGridPro = DataGrid
DataGridPremium = DataGrid


# =============================================================================
# DatePicker
# =============================================================================

class DatePicker(QFrame, StyleMixin):
    """
    Date selection component.
    
    Signals:
        date_changed: Emitted when date changes.
    """
    
    date_changed = pyqtSignal(object)  # date or None
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        value: Optional[date] = None,
        label: Optional[str] = None,
        format_str: str = "MM/dd/yyyy",
        min_date: Optional[date] = None,
        max_date: Optional[date] = None,
        disabled: bool = False,
        read_only: bool = False,
        error: bool = False,
        helper_text: Optional[str] = None,
        placeholder: str = "Select date",
        clearable: bool = False,
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._value = value
        self._label_text = label
        self._format_str = format_str
        self._min_date = min_date
        self._max_date = max_date
        self._disabled = disabled
        self._read_only = read_only
        self._error = error
        self._helper_text = helper_text
        self._placeholder = placeholder
        self._clearable = clearable
        
        self._setup_ui()
        self._apply_styles()
    
    def _setup_ui(self):
        """Set up the UI components."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)
        
        # Label
        if self._label_text:
            self._label = QLabel(self._label_text)
            self._label.setStyleSheet("font-size: 12px; color: rgba(0,0,0,0.6);")
            layout.addWidget(self._label)
        
        # Input container
        input_container = QHBoxLayout()
        input_container.setSpacing(0)
        
        # Date input
        self._date_edit = QDateEdit()
        self._date_edit.setCalendarPopup(True)
        self._date_edit.setDisplayFormat(self._qt_format())
        
        if self._value:
            self._date_edit.setDate(QDate(self._value.year, self._value.month, self._value.day))
        
        if self._min_date:
            self._date_edit.setMinimumDate(QDate(
                self._min_date.year, self._min_date.month, self._min_date.day
            ))
        
        if self._max_date:
            self._date_edit.setMaximumDate(QDate(
                self._max_date.year, self._max_date.month, self._max_date.day
            ))
        
        self._date_edit.setEnabled(not self._disabled)
        self._date_edit.setReadOnly(self._read_only)
        self._date_edit.dateChanged.connect(self._on_date_changed)
        
        input_container.addWidget(self._date_edit, 1)
        
        # Clear button
        if self._clearable:
            self._clear_btn = QPushButton("×")
            self._clear_btn.setFixedSize(24, 24)
            self._clear_btn.clicked.connect(self._clear_date)
            self._clear_btn.setStyleSheet("""
                QPushButton {
                    border: none;
                    background: transparent;
                    font-size: 16px;
                    color: #666;
                }
                QPushButton:hover {
                    color: #333;
                }
            """)
            input_container.addWidget(self._clear_btn)
        
        layout.addLayout(input_container)
        
        # Helper text
        if self._helper_text:
            self._helper = QLabel(self._helper_text)
            color = "#d32f2f" if self._error else "rgba(0,0,0,0.6)"
            self._helper.setStyleSheet(f"font-size: 12px; color: {color};")
            layout.addWidget(self._helper)
    
    def _qt_format(self) -> str:
        """Convert format string to Qt format."""
        return self._format_str.replace("MM", "MM").replace("dd", "dd").replace("yyyy", "yyyy")
    
    def _apply_styles(self):
        """Apply styles."""
        self.add_class("fakemui-datepicker")
        if self._error:
            self.add_class("fakemui-datepicker-error")
        if self._disabled:
            self.add_class("fakemui-datepicker-disabled")
        
        border_color = "#d32f2f" if self._error else "#c4c4c4"
        
        self._date_edit.setStyleSheet(f"""
            QDateEdit {{
                border: 1px solid {border_color};
                border-radius: 4px;
                padding: 8px 12px;
                background: white;
            }}
            QDateEdit:focus {{
                border-color: #1976d2;
            }}
            QDateEdit:disabled {{
                background: #f5f5f5;
                color: #9e9e9e;
            }}
        """)
    
    def _on_date_changed(self, qdate: QDate):
        """Handle date change."""
        self._value = date(qdate.year(), qdate.month(), qdate.day())
        self.date_changed.emit(self._value)
    
    def _clear_date(self):
        """Clear the date."""
        self._value = None
        self.date_changed.emit(None)
    
    @property
    def value(self) -> Optional[date]:
        return self._value
    
    @value.setter
    def value(self, val: Optional[date]):
        self._value = val
        if val:
            self._date_edit.setDate(QDate(val.year, val.month, val.day))
        self.date_changed.emit(val)


# =============================================================================
# TimePicker
# =============================================================================

class TimePicker(QFrame, StyleMixin):
    """
    Time selection component.
    
    Signals:
        time_changed: Emitted when time changes.
    """
    
    time_changed = pyqtSignal(object)  # time or None
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        value: Optional[time] = None,
        label: Optional[str] = None,
        ampm: bool = False,
        disabled: bool = False,
        read_only: bool = False,
        error: bool = False,
        helper_text: Optional[str] = None,
        placeholder: str = "Select time",
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._value = value
        self._label_text = label
        self._ampm = ampm
        self._disabled = disabled
        self._read_only = read_only
        self._error = error
        self._helper_text = helper_text
        self._placeholder = placeholder
        
        self._setup_ui()
        self._apply_styles()
    
    def _setup_ui(self):
        """Set up the UI components."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)
        
        # Label
        if self._label_text:
            self._label = QLabel(self._label_text)
            self._label.setStyleSheet("font-size: 12px; color: rgba(0,0,0,0.6);")
            layout.addWidget(self._label)
        
        # Time input
        self._time_edit = QTimeEdit()
        if self._ampm:
            self._time_edit.setDisplayFormat("hh:mm AP")
        else:
            self._time_edit.setDisplayFormat("HH:mm")
        
        if self._value:
            self._time_edit.setTime(QTime(self._value.hour, self._value.minute))
        
        self._time_edit.setEnabled(not self._disabled)
        self._time_edit.setReadOnly(self._read_only)
        self._time_edit.timeChanged.connect(self._on_time_changed)
        
        layout.addWidget(self._time_edit)
        
        # Helper text
        if self._helper_text:
            self._helper = QLabel(self._helper_text)
            color = "#d32f2f" if self._error else "rgba(0,0,0,0.6)"
            self._helper.setStyleSheet(f"font-size: 12px; color: {color};")
            layout.addWidget(self._helper)
    
    def _apply_styles(self):
        """Apply styles."""
        self.add_class("fakemui-timepicker")
        
        border_color = "#d32f2f" if self._error else "#c4c4c4"
        
        self._time_edit.setStyleSheet(f"""
            QTimeEdit {{
                border: 1px solid {border_color};
                border-radius: 4px;
                padding: 8px 12px;
                background: white;
            }}
            QTimeEdit:focus {{
                border-color: #1976d2;
            }}
            QTimeEdit:disabled {{
                background: #f5f5f5;
                color: #9e9e9e;
            }}
        """)
    
    def _on_time_changed(self, qtime: QTime):
        """Handle time change."""
        self._value = time(qtime.hour(), qtime.minute())
        self.time_changed.emit(self._value)
    
    @property
    def value(self) -> Optional[time]:
        return self._value
    
    @value.setter
    def value(self, val: Optional[time]):
        self._value = val
        if val:
            self._time_edit.setTime(QTime(val.hour, val.minute))
        self.time_changed.emit(val)


# =============================================================================
# DateTimePicker
# =============================================================================

class DateTimePicker(QFrame, StyleMixin):
    """
    Combined date and time picker.
    
    Signals:
        datetime_changed: Emitted when datetime changes.
    """
    
    datetime_changed = pyqtSignal(object)  # datetime or None
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        value: Optional[datetime] = None,
        label: Optional[str] = None,
        disabled: bool = False,
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._value = value
        self._label_text = label
        self._disabled = disabled
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Set up the UI components."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)
        
        # Label
        if self._label_text:
            self._label = QLabel(self._label_text)
            self._label.setStyleSheet("font-size: 12px; color: rgba(0,0,0,0.6);")
            layout.addWidget(self._label)
        
        # Pickers container
        pickers = QHBoxLayout()
        pickers.setSpacing(8)
        
        # Date picker
        self._date_picker = DatePicker(
            value=self._value.date() if self._value else None,
            disabled=self._disabled
        )
        self._date_picker.date_changed.connect(self._on_date_changed)
        pickers.addWidget(self._date_picker)
        
        # Time picker
        self._time_picker = TimePicker(
            value=self._value.time() if self._value else None,
            disabled=self._disabled
        )
        self._time_picker.time_changed.connect(self._on_time_changed)
        pickers.addWidget(self._time_picker)
        
        layout.addLayout(pickers)
        
        self.add_class("fakemui-datetimepicker")
    
    def _on_date_changed(self, new_date: Optional[date]):
        """Handle date change."""
        if new_date:
            current_time = self._value.time() if self._value else time(0, 0)
            self._value = datetime.combine(new_date, current_time)
        else:
            self._value = None
        self.datetime_changed.emit(self._value)
    
    def _on_time_changed(self, new_time: Optional[time]):
        """Handle time change."""
        if new_time:
            current_date = self._value.date() if self._value else date.today()
            self._value = datetime.combine(current_date, new_time)
        self.datetime_changed.emit(self._value)
    
    @property
    def value(self) -> Optional[datetime]:
        return self._value
    
    @value.setter
    def value(self, val: Optional[datetime]):
        self._value = val
        if val:
            self._date_picker.value = val.date()
            self._time_picker.value = val.time()
        self.datetime_changed.emit(val)


# =============================================================================
# StaticDatePicker (Calendar View)
# =============================================================================

class StaticDatePicker(QFrame, StyleMixin):
    """
    A static (always visible) date picker calendar.
    
    Signals:
        date_changed: Emitted when date changes.
    """
    
    date_changed = pyqtSignal(object)
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        value: Optional[date] = None,
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._value = value
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self._calendar = QCalendarWidget()
        self._calendar.setGridVisible(True)
        
        if value:
            self._calendar.setSelectedDate(QDate(value.year, value.month, value.day))
        
        self._calendar.selectionChanged.connect(self._on_selection_changed)
        
        layout.addWidget(self._calendar)
        
        self.add_class("fakemui-static-datepicker")
        
        self._calendar.setStyleSheet("""
            QCalendarWidget {
                background: white;
            }
            QCalendarWidget QToolButton {
                color: #333;
                background: transparent;
                border: none;
                padding: 4px 8px;
            }
            QCalendarWidget QToolButton:hover {
                background: #f5f5f5;
                border-radius: 4px;
            }
            QCalendarWidget QWidget#qt_calendar_navigationbar {
                background: #fafafa;
            }
            QCalendarWidget QAbstractItemView:enabled {
                selection-background-color: #1976d2;
                selection-color: white;
            }
        """)
    
    def _on_selection_changed(self):
        """Handle selection change."""
        qdate = self._calendar.selectedDate()
        self._value = date(qdate.year(), qdate.month(), qdate.day())
        self.date_changed.emit(self._value)
    
    @property
    def value(self) -> Optional[date]:
        return self._value
    
    @value.setter
    def value(self, val: Optional[date]):
        self._value = val
        if val:
            self._calendar.setSelectedDate(QDate(val.year, val.month, val.day))
        self.date_changed.emit(val)


# Aliases
DesktopDatePicker = DatePicker
MobileDatePicker = DatePicker
CalendarPicker = StaticDatePicker


class ClockPicker(QFrame, StyleMixin):
    """
    A clock picker widget.
    
    Signals:
        time_changed: Emitted when time changes.
    """
    
    time_changed = pyqtSignal(object)
    
    def __init__(
        self,
        parent: Optional[QWidget] = None,
        value: Optional[time] = None,
    ):
        super().__init__(parent)
        StyleMixin.__init__(self)
        
        self._value = value
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self._time_picker = TimePicker(value=value)
        self._time_picker.time_changed.connect(self._on_time_changed)
        
        layout.addWidget(self._time_picker)
        
        self.add_class("fakemui-clock-picker")
    
    def _on_time_changed(self, new_time: Optional[time]):
        """Handle time change."""
        self._value = new_time
        self.time_changed.emit(new_time)
    
    @property
    def value(self) -> Optional[time]:
        return self._value
    
    @value.setter
    def value(self, val: Optional[time]):
        self._value = val
        self._time_picker.value = val
        self.time_changed.emit(val)


# =============================================================================
# Exports
# =============================================================================

__all__ = [
    # DataGrid
    "DataGrid",
    "DataGridPro",
    "DataGridPremium",
    "DataGridColumn",
    # Date/Time Pickers
    "DatePicker",
    "TimePicker",
    "DateTimePicker",
    "DesktopDatePicker",
    "MobileDatePicker",
    "StaticDatePicker",
    "CalendarPicker",
    "ClockPicker",
]
