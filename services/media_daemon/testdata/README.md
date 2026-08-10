# Test ROMs

`solid_color_test.nes` is an original, hand-written 41-byte 6502 program (not
a game, not derived from any copyrighted work) used to verify the libretro
pipeline end-to-end: it disables PPU rendering and sets the NES background
color, so a working core+pipeline produces a solid blue video frame on every
call. If `/data/hls/retro/<session>/index.m3u8` plays a stable solid-blue
stream, the full chain — core load, `retro_run()`, frame capture, ffmpeg
encode, HLS segmenting, nginx serving — is confirmed working.

Bring your own ROMs for actual games; none are bundled here.
