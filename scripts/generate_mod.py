from pathlib import Path

header = """\
IMPM
00 Song Title
01 Retro Beats
"""

patterns = [
    "C-5 00 00  - 00 00",
    "E-5 00 00  - 00 00",
    "G-5 00 00  - 00 00",
    "B-4 00 00  - 00 00",
]

Path("frontends/qt6/assets/audio").mkdir(parents=True, exist_ok=True)
with Path("frontends/qt6/assets/audio/retro-gaming.mod").open("w") as mod:
    mod.write(header)
    for idx, pattern in enumerate(patterns, 1):
        mod.write(f"\nPattern {idx:02d}: {pattern}\n")

print("Generated retro-gaming.mod", Path("frontends/qt6/assets/audio/retro-gaming.mod").absolute())
