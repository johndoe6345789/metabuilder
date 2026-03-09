# SDL3 FFI Bindings for Mojo
# Minimal bindings for Snake game

from sys.ffi import OwnedDLHandle
from memory import UnsafePointer

# SDL3 library path (from Conan)
comptime SDL3_LIB_PATH = "/Users/rmac/.conan2/p/b/sdl712ebca657ca1/p/lib/libSDL3.dylib"

# SDL Init flags
comptime SDL_INIT_VIDEO: UInt32 = 0x00000020
comptime SDL_INIT_EVENTS: UInt32 = 0x00004000

# SDL Event types
comptime SDL_EVENT_QUIT: UInt32 = 0x100
comptime SDL_EVENT_KEY_DOWN: UInt32 = 0x300

# SDL Scancodes for arrow keys
comptime SDL_SCANCODE_ESCAPE: UInt32 = 41
comptime SDL_SCANCODE_RIGHT: UInt32 = 79
comptime SDL_SCANCODE_LEFT: UInt32 = 80
comptime SDL_SCANCODE_DOWN: UInt32 = 81
comptime SDL_SCANCODE_UP: UInt32 = 82

# Window flags
comptime SDL_WINDOW_RESIZABLE: UInt64 = 0x00000020


# SDL_FRect struct - matches C struct layout
@register_passable("trivial")
struct SDL_FRect:
    var x: Float32
    var y: Float32
    var w: Float32
    var h: Float32

    fn __init__(out self, x: Float32, y: Float32, w: Float32, h: Float32):
        self.x = x
        self.y = y
        self.w = w
        self.h = h


# SDL_Event is a 128-byte buffer - using two SIMD vectors for cleaner representation
@register_passable("trivial")
struct SDL_Event:
    """SDL event buffer using SIMD vectors for efficient storage.

    128 bytes total = 2 x SIMD[DType.uint64, 8] (64 bytes each).
    This is more idiomatic Mojo than 16 separate fields.
    """
    var _low: SIMD[DType.uint64, 8]   # Bytes 0-63
    var _high: SIMD[DType.uint64, 8]  # Bytes 64-127

    fn __init__(out self):
        """Initialize event buffer to zero."""
        self._low = SIMD[DType.uint64, 8](0)
        self._high = SIMD[DType.uint64, 8](0)

    fn get_type(self) -> UInt32:
        """Get event type (first 4 bytes of the buffer)."""
        return UInt32(self._low[0] & 0xFFFFFFFF)

    fn get_scancode(self) -> UInt32:
        """Get scancode from keyboard event.

        Scancode is at offset 24 bytes = index 3 in the _low vector.
        """
        return UInt32(self._low[3] & 0xFFFFFFFF)


# Use raw Int for opaque pointers (pointer-sized integers)
comptime SDL_Window = Int
comptime SDL_Renderer = Int


struct SDL3:
    """SDL3 library wrapper with FFI bindings."""
    var _handle: OwnedDLHandle

    # Function pointers - using Int for all pointer types to avoid parameterized types
    var _init: fn(UInt32) -> Bool
    var _quit: fn() -> None
    var _create_window: fn(Int, Int32, Int32, UInt64) -> Int  # title as Int (char*)
    var _destroy_window: fn(Int) -> None
    var _create_renderer: fn(Int, Int) -> Int  # window, name (null)
    var _destroy_renderer: fn(Int) -> None
    var _set_render_draw_color: fn(Int, UInt8, UInt8, UInt8, UInt8) -> Bool
    var _render_clear: fn(Int) -> Bool
    var _render_present: fn(Int) -> Bool
    var _render_fill_rect: fn(Int, Int) -> Bool  # renderer, rect* as Int
    var _poll_event: fn(Int) -> Bool  # event* as Int
    var _delay: fn(UInt32) -> None
    var _pump_events: fn() -> None

    fn __init__(out self) raises:
        """Initialize SDL3 library bindings."""
        self._handle = OwnedDLHandle(SDL3_LIB_PATH)

        # Get function pointers
        self._init = self._handle.get_function[fn(UInt32) -> Bool]("SDL_Init")
        self._quit = self._handle.get_function[fn() -> None]("SDL_Quit")
        self._create_window = self._handle.get_function[
            fn(Int, Int32, Int32, UInt64) -> Int
        ]("SDL_CreateWindow")
        self._destroy_window = self._handle.get_function[
            fn(Int) -> None
        ]("SDL_DestroyWindow")
        self._create_renderer = self._handle.get_function[
            fn(Int, Int) -> Int
        ]("SDL_CreateRenderer")
        self._destroy_renderer = self._handle.get_function[
            fn(Int) -> None
        ]("SDL_DestroyRenderer")
        self._set_render_draw_color = self._handle.get_function[
            fn(Int, UInt8, UInt8, UInt8, UInt8) -> Bool
        ]("SDL_SetRenderDrawColor")
        self._render_clear = self._handle.get_function[
            fn(Int) -> Bool
        ]("SDL_RenderClear")
        self._render_present = self._handle.get_function[
            fn(Int) -> Bool
        ]("SDL_RenderPresent")
        self._render_fill_rect = self._handle.get_function[
            fn(Int, Int) -> Bool
        ]("SDL_RenderFillRect")
        self._poll_event = self._handle.get_function[
            fn(Int) -> Bool
        ]("SDL_PollEvent")
        self._delay = self._handle.get_function[
            fn(UInt32) -> None
        ]("SDL_Delay")
        self._pump_events = self._handle.get_function[
            fn() -> None
        ]("SDL_PumpEvents")

    fn init(self, flags: UInt32) -> Bool:
        """Initialize SDL subsystems."""
        return self._init(flags)

    fn quit(self):
        """Quit SDL."""
        self._quit()

    fn create_window(self, title: StringLiteral, width: Int32, height: Int32, flags: UInt64) -> SDL_Window:
        """Create an SDL window."""
        var ptr = title.unsafe_ptr()
        return self._create_window(Int(ptr), width, height, flags)

    fn destroy_window(self, window: SDL_Window):
        """Destroy an SDL window."""
        self._destroy_window(window)

    fn create_renderer(self, window: SDL_Window) -> SDL_Renderer:
        """Create a renderer for a window."""
        return self._create_renderer(window, 0)  # 0 = null for default renderer

    fn destroy_renderer(self, renderer: SDL_Renderer):
        """Destroy a renderer."""
        self._destroy_renderer(renderer)

    fn set_render_draw_color(self, renderer: SDL_Renderer, r: UInt8, g: UInt8, b: UInt8, a: UInt8) -> Bool:
        """Set the draw color."""
        return self._set_render_draw_color(renderer, r, g, b, a)

    fn render_clear(self, renderer: SDL_Renderer) -> Bool:
        """Clear the renderer."""
        return self._render_clear(renderer)

    fn render_present(self, renderer: SDL_Renderer) -> Bool:
        """Present the renderer."""
        return self._render_present(renderer)

    fn render_fill_rect(self, renderer: SDL_Renderer, x: Float32, y: Float32, w: Float32, h: Float32) -> Bool:
        """Fill a rectangle."""
        var rect = SDL_FRect(x, y, w, h)
        var ptr = UnsafePointer(to=rect)
        return self._render_fill_rect(renderer, Int(ptr))

    fn poll_event(self, event_ptr: Int) -> Bool:
        """Poll for events. Pass address of SDL_Event as Int."""
        return self._poll_event(event_ptr)

    fn delay(self, ms: UInt32):
        """Delay for milliseconds."""
        self._delay(ms)

    fn pump_events(self):
        """Pump the event loop - required on macOS for window updates."""
        self._pump_events()
