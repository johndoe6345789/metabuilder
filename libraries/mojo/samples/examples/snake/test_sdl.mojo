# Minimal SDL3 test - just show a red window

from sys.ffi import OwnedDLHandle
from memory import UnsafePointer

comptime SDL3_LIB_PATH = "/Users/rmac/.conan2/p/b/sdl712ebca657ca1/p/lib/libSDL3.dylib"
comptime SDL_INIT_VIDEO: UInt32 = 0x00000020

fn main() raises:
    print("Loading SDL3...")
    var handle = OwnedDLHandle(SDL3_LIB_PATH)

    var sdl_init = handle.get_function[fn(UInt32) -> Bool]("SDL_Init")
    var sdl_quit = handle.get_function[fn() -> None]("SDL_Quit")
    var sdl_create_window = handle.get_function[fn(Int, Int32, Int32, UInt64) -> Int]("SDL_CreateWindow")
    var sdl_create_renderer = handle.get_function[fn(Int, Int) -> Int]("SDL_CreateRenderer")
    var sdl_set_draw_color = handle.get_function[fn(Int, UInt8, UInt8, UInt8, UInt8) -> Bool]("SDL_SetRenderDrawColor")
    var sdl_clear = handle.get_function[fn(Int) -> Bool]("SDL_RenderClear")
    var sdl_present = handle.get_function[fn(Int) -> Bool]("SDL_RenderPresent")
    var sdl_delay = handle.get_function[fn(UInt32) -> None]("SDL_Delay")
    var sdl_destroy_renderer = handle.get_function[fn(Int) -> None]("SDL_DestroyRenderer")
    var sdl_destroy_window = handle.get_function[fn(Int) -> None]("SDL_DestroyWindow")
    var sdl_pump_events = handle.get_function[fn() -> None]("SDL_PumpEvents")

    print("Initializing SDL...")
    if not sdl_init(SDL_INIT_VIDEO):
        print("Failed to init SDL")
        return

    print("Creating window...")
    var title = "Test Window"
    var title_ptr = Int(title.as_bytes().unsafe_ptr())
    var window = sdl_create_window(title_ptr, 400, 300, 0)
    print("Window:", window)

    print("Creating renderer...")
    var renderer = sdl_create_renderer(window, 0)
    print("Renderer:", renderer)

    print("Running render loop for 3 seconds...")
    for frame in range(30):
        # Pump events - REQUIRED on macOS for window to actually show content
        sdl_pump_events()

        # Set color to bright red
        var ok = sdl_set_draw_color(renderer, 255, 0, 0, 255)

        # Clear with red
        ok = sdl_clear(renderer)

        # Present
        ok = sdl_present(renderer)

        print("Frame", frame)
        sdl_delay(100)

    print("Cleaning up...")
    sdl_destroy_renderer(renderer)
    sdl_destroy_window(window)
    sdl_quit()
    print("Done!")
