"""
FakeMUI Demo - Showcase all components.

Run with: python -m codex_task_runner.ui.fakemui.demo
"""

import sys
from datetime import date, datetime
from PyQt6.QtWidgets import QApplication, QMainWindow, QScrollArea, QWidget
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QIcon

from . import (
    # Inputs
    Button, IconButton, TextField, Select, CheckBox, RadioButton,
    Switch, Slider, ToggleButton, ToggleButtonGroup,
    # Data Display
    Avatar, Badge, Chip, Divider, Typography,
    ListWidget, ListItem, ListItemText, ListItemIcon,
    # Feedback
    Alert, Spinner, LinearProgress, Skeleton,
    # Surfaces
    Paper, Card, CardHeader, CardContent, CardActions,
    Accordion, AccordionSummary, AccordionDetails,
    AppBar, Toolbar, Drawer,
    # Navigation
    Breadcrumbs, Link, TabWidget, Tab, Pagination,
    # Layout
    Box, Container, Stack, Grid,
    # Utils
    Dialog, DialogTitle, DialogContent, DialogActions,
    ThemeProvider, apply_theme,
    # Atoms
    Title, Subtitle, Text, Section, EmptyState, LoadingState,
    ErrorState, Panel, StatBadge,
    # Lab Components
    LoadingButton, Timeline, TimelineItem, TimelineSeparator,
    TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent,
    TreeView, TreeItem, Masonry,
    # MUI X Components
    DataGrid, DataGridColumn, DatePicker, TimePicker, DateTimePicker,
    # Theming
    create_theme, use_theme, styled,
)
from .stylesheet import get_stylesheet


class DemoWindow(QMainWindow):
    """Main demo window showcasing all FakeMUI components."""
    
    def __init__(self):
        super().__init__()
        
        self.setWindowTitle("FakeMUI Demo - PyQt6 Material Components")
        self.setMinimumSize(1200, 800)
        
        # Apply theme
        apply_theme('light')
        
        # Main container with scroll
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        
        # Content
        content = Container(maxWidth='lg')
        content.set_padding(24)
        
        # Add sections
        self._add_typography_section(content)
        self._add_button_section(content)
        self._add_input_section(content)
        self._add_data_display_section(content)
        self._add_feedback_section(content)
        self._add_surface_section(content)
        self._add_navigation_section(content)
        self._add_layout_section(content)
        self._add_lab_section(content)
        self._add_x_section(content)
        
        scroll.setWidget(content)
        self.setCentralWidget(scroll)
    
    def _add_typography_section(self, parent: Container):
        """Add typography demonstration."""
        section = Section(title="Typography")
        
        section.add_content(Title("Heading 1", level=1))
        section.add_content(Title("Heading 2", level=2))
        section.add_content(Title("Heading 3", level=3))
        section.add_content(Subtitle("Subtitle 1", level=1))
        section.add_content(Subtitle("Subtitle 2", level=2))
        section.add_content(Text("Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit."))
        section.add_content(Text("Caption text", variant='caption'))
        
        parent.add_widget(section)
        parent.add_widget(Divider())
    
    def _add_button_section(self, parent: Container):
        """Add button demonstration."""
        section = Section(title="Buttons")
        
        # Regular buttons
        row = Stack(direction='row', spacing=2)
        row.add_widget(Button("Default"))
        row.add_widget(Button("Primary", primary=True))
        row.add_widget(Button("Secondary", secondary=True))
        row.add_widget(Button("Outline", outline=True))
        row.add_widget(Button("Ghost", ghost=True))
        section.add_content(row)
        
        # Sizes
        row2 = Stack(direction='row', spacing=2)
        row2.add_widget(Button("Small", primary=True, sm=True))
        row2.add_widget(Button("Medium", primary=True))
        row2.add_widget(Button("Large", primary=True, lg=True))
        section.add_content(row2)
        
        # States
        row3 = Stack(direction='row', spacing=2)
        row3.add_widget(Button("Disabled", disabled=True))
        row3.add_widget(Button("Loading", loading=True, primary=True))
        section.add_content(row3)
        
        # Toggle buttons
        toggle_group = ToggleButtonGroup(exclusive=True)
        toggle_group.add_button(ToggleButton("Left", value="left", selected=True))
        toggle_group.add_button(ToggleButton("Center", value="center"))
        toggle_group.add_button(ToggleButton("Right", value="right"))
        section.add_content(toggle_group)
        
        parent.add_widget(section)
        parent.add_widget(Divider())
    
    def _add_input_section(self, parent: Container):
        """Add input demonstration."""
        section = Section(title="Inputs")
        
        # Text fields
        section.add_content(TextField(label="Standard", placeholder="Enter text..."))
        section.add_content(TextField(label="With helper", helperText="Some helpful text"))
        section.add_content(TextField(label="Error state", error=True, helperText="This field has an error"))
        section.add_content(TextField(label="Multiline", multiline=True, rows=3))
        
        # Select
        section.add_content(Select(
            options=["Option 1", "Option 2", "Option 3"],
            placeholder="Select an option"
        ))
        
        # Checkboxes and Radios
        row = Stack(direction='row', spacing=4)
        row.add_widget(CheckBox("Checkbox 1", checked=True))
        row.add_widget(CheckBox("Checkbox 2"))
        row.add_widget(RadioButton("Radio 1", checked=True))
        row.add_widget(RadioButton("Radio 2"))
        section.add_content(row)
        
        # Switch
        row2 = Stack(direction='row', spacing=4)
        row2.add_widget(Switch("Toggle switch"))
        row2.add_widget(Switch("Enabled", checked=True))
        section.add_content(row2)
        
        # Slider
        section.add_content(Slider(value=50))
        
        parent.add_widget(section)
        parent.add_widget(Divider())
    
    def _add_data_display_section(self, parent: Container):
        """Add data display demonstration."""
        section = Section(title="Data Display")
        
        # Avatars
        row = Stack(direction='row', spacing=2)
        row.add_widget(Avatar(alt="John Doe", size=40))
        row.add_widget(Avatar(alt="Jane Smith", size=48))
        row.add_widget(Avatar(alt="Bob Wilson", size=56, variant='rounded'))
        section.add_content(row)
        
        # Chips
        row2 = Stack(direction='row', spacing=1)
        row2.add_widget(Chip("Default"))
        row2.add_widget(Chip("Primary", color='primary'))
        row2.add_widget(Chip("Outlined", variant='outlined'))
        row2.add_widget(Chip("Deletable", deletable=True))
        section.add_content(row2)
        
        # List
        list_widget = ListWidget()
        
        item1 = ListItem(clickable=True)
        item1.add_widget(ListItemText(primary="List Item 1", secondary="Secondary text"))
        list_widget.add_item(item1)
        
        item2 = ListItem(clickable=True, selected=True)
        item2.add_widget(ListItemText(primary="Selected Item", secondary="This item is selected"))
        list_widget.add_item(item2)
        
        item3 = ListItem(clickable=True)
        item3.add_widget(ListItemText(primary="List Item 3", secondary="Another item"))
        list_widget.add_item(item3)
        
        section.add_content(list_widget)
        
        # Stats
        row3 = Stack(direction='row', spacing=4)
        row3.add_widget(StatBadge(label="Users", value="1,234"))
        row3.add_widget(StatBadge(label="Revenue", value="$56K", color='success'))
        row3.add_widget(StatBadge(label="Errors", value="12", color='error'))
        section.add_content(row3)
        
        parent.add_widget(section)
        parent.add_widget(Divider())
    
    def _add_feedback_section(self, parent: Container):
        """Add feedback demonstration."""
        section = Section(title="Feedback")
        
        # Alerts
        section.add_content(Alert(title="Info", message="This is an info alert", severity='info'))
        section.add_content(Alert(title="Success", message="This is a success alert", severity='success'))
        section.add_content(Alert(title="Warning", message="This is a warning alert", severity='warning'))
        section.add_content(Alert(title="Error", message="This is an error alert", severity='error'))
        
        # Progress
        section.add_content(Text("Linear Progress:"))
        section.add_content(LinearProgress(value=60))
        
        section.add_content(Text("Indeterminate Progress:"))
        section.add_content(LinearProgress(variant='indeterminate'))
        
        # Spinners
        row = Stack(direction='row', spacing=4)
        row.add_widget(Spinner(size=24))
        row.add_widget(Spinner(size=40))
        row.add_widget(Spinner(size=56, color='secondary'))
        section.add_content(row)
        
        # Skeletons
        section.add_content(Text("Skeletons:"))
        section.add_content(Skeleton(variant='text', width=200))
        section.add_content(Skeleton(variant='rectangular', width=300, height=100))
        
        parent.add_widget(section)
        parent.add_widget(Divider())
    
    def _add_surface_section(self, parent: Container):
        """Add surface demonstration."""
        section = Section(title="Surfaces")
        
        # Cards
        row = Stack(direction='row', spacing=2)
        
        card1 = Card()
        card1.add_widget(CardHeader(title="Card Title", subheader="Card subtitle"))
        card1.add_widget(CardContent())
        content1 = card1.findChild(CardContent)
        if content1:
            content1.add_widget(Text("Card content goes here. This is a simple card example."))
        card1.add_widget(CardActions())
        actions1 = card1.findChild(CardActions)
        if actions1:
            actions1.add_widget(Button("Action 1", ghost=True))
            actions1.add_widget(Button("Action 2", ghost=True))
        row.add_widget(card1)
        
        card2 = Card(raised=True)
        card2.add_widget(CardHeader(title="Raised Card"))
        card2.add_widget(CardContent())
        content2 = card2.findChild(CardContent)
        if content2:
            content2.add_widget(Text("This card has elevation."))
        row.add_widget(card2)
        
        section.add_content(row)
        
        # Accordion
        accordion = Accordion()
        summary = AccordionSummary()
        summary.set_content("Accordion Header")
        accordion.set_summary(summary)
        details = AccordionDetails()
        details.add_widget(Text("Accordion content that can be expanded or collapsed."))
        accordion.set_details(details)
        section.add_content(accordion)
        
        # Paper
        paper = Paper(elevation=2)
        paper.add_widget(Text("This is a Paper component with elevation."))
        paper.set_padding(16)
        section.add_content(paper)
        
        parent.add_widget(section)
        parent.add_widget(Divider())
    
    def _add_navigation_section(self, parent: Container):
        """Add navigation demonstration."""
        section = Section(title="Navigation")
        
        # Breadcrumbs
        breadcrumbs = Breadcrumbs()
        breadcrumbs.add_item(Link("Home"))
        breadcrumbs.add_item(Link("Category"))
        breadcrumbs.add_item(Link("Current Page"))
        section.add_content(breadcrumbs)
        
        # Tabs
        row = Stack(direction='row', spacing=0)
        row.add_widget(Tab(label="Tab 1", selected=True))
        row.add_widget(Tab(label="Tab 2"))
        row.add_widget(Tab(label="Tab 3"))
        row.add_widget(Tab(label="Disabled", disabled=True))
        section.add_content(row)
        
        # Pagination
        pagination = Pagination(count=10, page=1)
        section.add_content(pagination)
        
        # Links
        row2 = Stack(direction='row', spacing=2)
        row2.add_widget(Link("Primary Link"))
        row2.add_widget(Link("Secondary Link", color='secondary'))
        section.add_content(row2)
        
        parent.add_widget(section)
        parent.add_widget(Divider())
    
    def _add_layout_section(self, parent: Container):
        """Add layout demonstration."""
        section = Section(title="Layout")
        
        # Stack
        section.add_content(Text("Horizontal Stack:"))
        h_stack = Stack(direction='row', spacing=2)
        for i in range(4):
            box = Paper(elevation=1)
            box.add_widget(Text(f"Item {i+1}"))
            box.set_padding(16)
            h_stack.add_widget(box)
        section.add_content(h_stack)
        
        # Grid
        section.add_content(Text("Grid Layout:"))
        grid = Grid(container=True, spacing=2, columns=3)
        for i in range(6):
            box = Paper(elevation=1)
            box.add_widget(Text(f"Grid Item {i+1}"))
            box.set_padding(16)
            grid.add_widget(box)
        section.add_content(grid)
        
        # States
        section.add_content(Text("State Components:"))
        row = Stack(direction='row', spacing=4)
        
        empty = EmptyState(title="No data", description="Nothing to display here")
        empty.setFixedWidth(250)
        row.add_widget(empty)
        
        loading = LoadingState(message="Loading data...")
        loading.setFixedWidth(250)
        row.add_widget(loading)
        
        error = ErrorState(title="Error", message="Failed to load data")
        error.setFixedWidth(250)
        row.add_widget(error)
        
        section.add_content(row)
        
        parent.add_widget(section)
    
    def _add_lab_section(self, parent: Container):
        """Add lab components demonstration."""
        section = Section(title="Lab Components")
        
        # LoadingButton
        section.add_content(Text("Loading Buttons:"))
        row = Stack(direction='row', spacing=2)
        
        btn1 = LoadingButton("Submit", loading=False, color='primary')
        row.add_widget(btn1)
        
        btn2 = LoadingButton("Loading...", loading=True, color='primary')
        row.add_widget(btn2)
        
        btn3 = LoadingButton("Outlined", loading=True, variant='outlined', color='secondary')
        row.add_widget(btn3)
        
        section.add_content(row)
        
        # Timeline
        section.add_content(Text("Timeline:"))
        timeline = Timeline()
        
        # Item 1
        item1 = TimelineItem()
        opp1 = TimelineOppositeContent()
        opp1.set_text("9:30 am")
        item1.set_opposite_content(opp1)
        
        sep1 = TimelineSeparator()
        sep1.add_widget(TimelineDot(color='primary'))
        sep1.add_widget(TimelineConnector())
        item1.set_separator(sep1)
        
        cont1 = TimelineContent()
        cont1.set_text("Eat breakfast")
        item1.set_content(cont1)
        timeline.add_item(item1)
        
        # Item 2
        item2 = TimelineItem()
        opp2 = TimelineOppositeContent()
        opp2.set_text("10:00 am")
        item2.set_opposite_content(opp2)
        
        sep2 = TimelineSeparator()
        sep2.add_widget(TimelineDot(color='success'))
        sep2.add_widget(TimelineConnector())
        item2.set_separator(sep2)
        
        cont2 = TimelineContent()
        cont2.set_text("Code review")
        item2.set_content(cont2)
        timeline.add_item(item2)
        
        # Item 3
        item3 = TimelineItem()
        opp3 = TimelineOppositeContent()
        opp3.set_text("12:00 pm")
        item3.set_opposite_content(opp3)
        
        sep3 = TimelineSeparator()
        sep3.add_widget(TimelineDot(color='error', variant='outlined'))
        item3.set_separator(sep3)
        
        cont3 = TimelineContent()
        cont3.set_text("Lunch meeting")
        item3.set_content(cont3)
        timeline.add_item(item3)
        
        section.add_content(timeline)
        
        # TreeView
        section.add_content(Text("TreeView:"))
        tree = TreeView()
        tree.add_node("1", "📁 Documents")
        tree.add_node("1.1", "📄 Report.pdf", parent_id="1")
        tree.add_node("1.2", "📄 Notes.txt", parent_id="1")
        tree.add_node("2", "📁 Images")
        tree.add_node("2.1", "🖼️ Photo.jpg", parent_id="2")
        tree.add_node("2.2", "🖼️ Logo.png", parent_id="2")
        tree.add_node("3", "📁 Projects")
        tree.add_node("3.1", "📁 Project A", parent_id="3")
        tree.add_node("3.1.1", "📄 main.py", parent_id="3.1")
        tree.setMaximumHeight(200)
        section.add_content(tree)
        
        parent.add_widget(section)
        parent.add_widget(Divider())
    
    def _add_x_section(self, parent: Container):
        """Add MUI X components demonstration."""
        section = Section(title="MUI X Components")
        
        # DataGrid
        section.add_content(Text("DataGrid:"))
        
        columns = [
            DataGridColumn("id", "ID", width=60),
            DataGridColumn("name", "Name", flex=1),
            DataGridColumn("email", "Email", flex=1.5),
            DataGridColumn("role", "Role"),
        ]
        
        rows = [
            {"id": 1, "name": "John Doe", "email": "john@example.com", "role": "Admin"},
            {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "User"},
            {"id": 3, "name": "Bob Wilson", "email": "bob@example.com", "role": "Editor"},
            {"id": 4, "name": "Alice Brown", "email": "alice@example.com", "role": "User"},
            {"id": 5, "name": "Charlie Davis", "email": "charlie@example.com", "role": "Viewer"},
        ]
        
        grid = DataGrid(
            rows=rows,
            columns=columns,
            page_size=5,
            checkbox_selection=True,
            density='standard'
        )
        grid.setMaximumHeight(300)
        section.add_content(grid)
        
        # DatePicker
        section.add_content(Text("Date & Time Pickers:"))
        row2 = Stack(direction='row', spacing=4)
        
        date_picker = DatePicker(
            label="Select Date",
            value=date.today(),
            clearable=True
        )
        row2.add_widget(date_picker)
        
        time_picker = TimePicker(
            label="Select Time"
        )
        row2.add_widget(time_picker)
        
        datetime_picker = DateTimePicker(
            label="Date & Time",
            value=datetime.now()
        )
        row2.add_widget(datetime_picker)
        
        section.add_content(row2)
        
        parent.add_widget(section)


def main():
    """Run the demo application."""
    app = QApplication(sys.argv)
    app.setStyleSheet(get_stylesheet('light'))
    
    window = DemoWindow()
    window.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
