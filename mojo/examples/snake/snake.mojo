# Snake Game in Mojo with SDL3
# A classic snake game using pure Mojo FFI bindings

from collections import List
from random import random_ui64

from sdl3 import (
    SDL3,
    SDL_FRect,
    SDL_Event,
    SDL_Window,
    SDL_Renderer,
    SDL_INIT_VIDEO,
    SDL_EVENT_QUIT,
    SDL_EVENT_KEY_DOWN,
    SDL_SCANCODE_UP,
    SDL_SCANCODE_DOWN,
    SDL_SCANCODE_LEFT,
    SDL_SCANCODE_RIGHT,
    SDL_SCANCODE_ESCAPE,
)
from memory import UnsafePointer


# Game constants
comptime WINDOW_WIDTH: Int = 800
comptime WINDOW_HEIGHT: Int = 600
comptime CELL_SIZE: Int = 20
comptime GRID_WIDTH: Int = WINDOW_WIDTH // CELL_SIZE
comptime GRID_HEIGHT: Int = WINDOW_HEIGHT // CELL_SIZE
comptime GAME_SPEED_MS: UInt32 = 100  # milliseconds between updates


@register_passable("trivial")
struct Color:
    """RGBA color for rendering."""
    var r: UInt8
    var g: UInt8
    var b: UInt8
    var a: UInt8

    fn __init__(out self, r: UInt8, g: UInt8, b: UInt8, a: UInt8 = 255):
        self.r = r
        self.g = g
        self.b = b
        self.a = a

    # Pre-defined colors for the snake game
    comptime BACKGROUND = Color(30, 30, 30, 255)
    comptime GRID_LINE = Color(40, 40, 40, 255)
    comptime FOOD = Color(255, 50, 50, 255)
    comptime SNAKE_HEAD = Color(100, 255, 100, 255)
    comptime SNAKE_BODY = Color(50, 200, 50, 255)
    comptime GAME_OVER_OVERLAY = Color(255, 0, 0, 128)


@register_passable("trivial")
struct Direction:
    """Direction enum for snake movement with delta calculations."""
    var value: Int

    comptime NONE = Direction(0)
    comptime UP = Direction(1)
    comptime DOWN = Direction(2)
    comptime LEFT = Direction(3)
    comptime RIGHT = Direction(4)

    fn __init__(out self, value: Int):
        self.value = value

    fn __eq__(self, other: Direction) -> Bool:
        return self.value == other.value

    fn __ne__(self, other: Direction) -> Bool:
        return self.value != other.value

    fn get_delta(self) -> (Int, Int):
        """Get (dx, dy) movement delta for this direction.

        Returns (0, 0) for NONE, allowing safe no-op moves.
        """
        if self == Direction.UP:
            return (0, -1)
        elif self == Direction.DOWN:
            return (0, 1)
        elif self == Direction.LEFT:
            return (-1, 0)
        elif self == Direction.RIGHT:
            return (1, 0)
        return (0, 0)  # NONE

    fn is_opposite(self, other: Direction) -> Bool:
        """Check if this direction is opposite to another.

        Uses delta comparison: opposite directions sum to (0, 0).
        """
        if self == Direction.NONE or other == Direction.NONE:
            return False
        var d1 = self.get_delta()
        var d2 = other.get_delta()
        return d1[0] + d2[0] == 0 and d1[1] + d2[1] == 0

    @staticmethod
    fn from_scancode(scancode: UInt32) -> Direction:
        """Convert SDL scancode to Direction. Returns NONE if not an arrow key."""
        if scancode == SDL_SCANCODE_UP:
            return Direction.UP
        elif scancode == SDL_SCANCODE_DOWN:
            return Direction.DOWN
        elif scancode == SDL_SCANCODE_LEFT:
            return Direction.LEFT
        elif scancode == SDL_SCANCODE_RIGHT:
            return Direction.RIGHT
        return Direction.NONE


@register_passable("trivial")
struct Point:
    """A 2D point on the grid with arithmetic operations."""
    var x: Int
    var y: Int

    fn __init__(out self, x: Int, y: Int):
        self.x = x
        self.y = y

    fn __eq__(self, other: Point) -> Bool:
        return self.x == other.x and self.y == other.y

    fn __ne__(self, other: Point) -> Bool:
        return self.x != other.x or self.y != other.y

    fn __add__(self, other: Point) -> Point:
        """Add two points."""
        return Point(self.x + other.x, self.y + other.y)

    fn __sub__(self, other: Point) -> Point:
        """Subtract two points."""
        return Point(self.x - other.x, self.y - other.y)

    fn wrap(self, width: Int, height: Int) -> Point:
        """Wrap point to stay within grid bounds."""
        var new_x = self.x % width if self.x >= 0 else width - 1
        var new_y = self.y % height if self.y >= 0 else height - 1
        return Point(new_x, new_y)


struct Snake:
    """The snake entity."""
    var body: List[Point]
    var direction: Direction
    var grow_pending: Int

    fn __init__(out self):
        """Initialize snake at center of grid."""
        self.body = List[Point]()
        var start_x = GRID_WIDTH // 2
        var start_y = GRID_HEIGHT // 2
        # Start with 3 segments
        self.body.append(Point(start_x, start_y))
        self.body.append(Point(start_x - 1, start_y))
        self.body.append(Point(start_x - 2, start_y))
        self.direction = Direction.RIGHT
        self.grow_pending = 0

    fn head(self) -> Point:
        """Get the head position."""
        return self.body[0]

    fn set_direction(mut self, new_dir: Direction):
        """Set direction if not opposite to current."""
        if not self.direction.is_opposite(new_dir) and new_dir != Direction.NONE:
            self.direction = new_dir

    fn move(mut self) -> Bool:
        """Move snake in current direction. Returns False if collision with self."""
        var delta = self.direction.get_delta()

        # No movement if direction is NONE
        if delta[0] == 0 and delta[1] == 0:
            return True

        # Calculate new head position with wrapping
        var delta_point = Point(delta[0], delta[1])
        var new_head = (self.head() + delta_point).wrap(GRID_WIDTH, GRID_HEIGHT)

        # Check self-collision (skip tail if not growing)
        var check_length = len(self.body)
        if self.grow_pending == 0:
            check_length -= 1  # Tail will move out of the way

        for i in range(check_length):
            if self.body[i] == new_head:
                return False  # Collision!

        # Insert new head
        self.body.insert(0, new_head)

        # Remove tail unless growing
        if self.grow_pending > 0:
            self.grow_pending -= 1
        else:
            _ = self.body.pop()

        return True

    fn grow(mut self):
        """Schedule the snake to grow by one segment."""
        self.grow_pending += 1

    fn contains(self, point: Point) -> Bool:
        """Check if point is part of snake body."""
        for i in range(len(self.body)):
            if self.body[i] == point:
                return True
        return False


struct Game:
    """Main game state."""
    var sdl: SDL3
    var window: SDL_Window
    var renderer: SDL_Renderer
    var snake: Snake
    var food: Point
    var score: Int
    var running: Bool
    var game_over: Bool

    fn __init__(out self) raises:
        """Initialize the game."""
        self.sdl = SDL3()
        self.snake = Snake()
        self.food = Point(0, 0)
        self.score = 0
        self.running = True
        self.game_over = False

        # Initialize SDL
        if not self.sdl.init(SDL_INIT_VIDEO):
            raise Error("Failed to initialize SDL3")

        # Create window
        self.window = self.sdl.create_window(
            "Snake - Mojo + SDL3",
            Int32(WINDOW_WIDTH),
            Int32(WINDOW_HEIGHT),
            0
        )
        if self.window == 0:
            raise Error("Failed to create window")

        # Create renderer
        self.renderer = self.sdl.create_renderer(self.window)
        if self.renderer == 0:
            raise Error("Failed to create renderer")

        # Spawn initial food
        self.spawn_food()

    fn spawn_food(mut self):
        """Spawn food at random position not on snake."""
        while True:
            var x = Int(random_ui64(0, GRID_WIDTH - 1))
            var y = Int(random_ui64(0, GRID_HEIGHT - 1))
            self.food = Point(x, y)
            if not self.snake.contains(self.food):
                break

    fn handle_events(mut self):
        """Process SDL events."""
        var event = SDL_Event()
        var event_ptr = UnsafePointer(to=event)
        var event_ptr_int = Int(event_ptr)

        while self.sdl.poll_event(event_ptr_int):
            # Read the event data back from the pointer (SDL modified it)
            event = event_ptr[]
            var event_type = event.get_type()

            if event_type == SDL_EVENT_QUIT:
                self.running = False
            elif event_type == SDL_EVENT_KEY_DOWN:
                var scancode = event.get_scancode()

                if scancode == SDL_SCANCODE_ESCAPE:
                    self.running = False
                else:
                    # Try to convert scancode to direction
                    var new_dir = Direction.from_scancode(scancode)
                    if new_dir != Direction.NONE:
                        self.snake.set_direction(new_dir)

    fn update(mut self):
        """Update game state."""
        if self.game_over:
            return

        # Move snake
        if not self.snake.move():
            self.game_over = True
            print("Game Over! Score:", self.score)
            return

        # Check food collision
        if self.snake.head() == self.food:
            self.snake.grow()
            self.score += 10
            self.spawn_food()
            print("Score:", self.score)

    fn set_color(self, color: Color):
        """Helper to set render draw color from a Color struct."""
        _ = self.sdl.set_render_draw_color(self.renderer, color.r, color.g, color.b, color.a)

    fn render(self):
        """Render the game."""
        # Clear screen
        self.set_color(Color.BACKGROUND)
        _ = self.sdl.render_clear(self.renderer)

        # Draw grid lines
        self.set_color(Color.GRID_LINE)
        for i in range(GRID_WIDTH + 1):
            var x = Float32(i * CELL_SIZE)
            _ = self.sdl.render_fill_rect(self.renderer, x, 0, 1, Float32(WINDOW_HEIGHT))
        for i in range(GRID_HEIGHT + 1):
            var y = Float32(i * CELL_SIZE)
            _ = self.sdl.render_fill_rect(self.renderer, 0, y, Float32(WINDOW_WIDTH), 1)

        # Draw food
        self.set_color(Color.FOOD)
        _ = self.sdl.render_fill_rect(
            self.renderer,
            Float32(self.food.x * CELL_SIZE + 2),
            Float32(self.food.y * CELL_SIZE + 2),
            Float32(CELL_SIZE - 4),
            Float32(CELL_SIZE - 4)
        )

        # Draw snake
        for i in range(len(self.snake.body)):
            var segment = self.snake.body[i]
            self.set_color(Color.SNAKE_HEAD if i == 0 else Color.SNAKE_BODY)
            _ = self.sdl.render_fill_rect(
                self.renderer,
                Float32(segment.x * CELL_SIZE + 1),
                Float32(segment.y * CELL_SIZE + 1),
                Float32(CELL_SIZE - 2),
                Float32(CELL_SIZE - 2)
            )

        # Game over overlay
        if self.game_over:
            self.set_color(Color.GAME_OVER_OVERLAY)
            _ = self.sdl.render_fill_rect(self.renderer, 0, 0, Float32(WINDOW_WIDTH), Float32(WINDOW_HEIGHT))

        # Present
        _ = self.sdl.render_present(self.renderer)

    fn cleanup(mut self):
        """Clean up SDL resources."""
        self.sdl.destroy_renderer(self.renderer)
        self.sdl.destroy_window(self.window)
        self.sdl.quit()

    fn run(mut self):
        """Main game loop."""
        print("Snake Game - Mojo + SDL3")
        print("Use arrow keys to move, ESC to quit")
        print("---")

        while self.running:
            self.sdl.pump_events()  # Required on macOS for window to show content
            self.handle_events()
            self.update()
            self.render()
            self.sdl.delay(GAME_SPEED_MS)

        self.cleanup()
        print("---")
        print("Final Score:", self.score)


fn main() raises:
    """Entry point."""
    var game = Game()
    game.run()
