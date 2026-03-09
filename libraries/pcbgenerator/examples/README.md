# Arduino-like MCU Board Example

This example shows how to use **BoardForge** to create a small microcontroller board.  The board hosts a 28‑pin MCU and breaks out the pins to two headers similar to a traditional Arduino layout.

Run the example:

```bash
python arduino_like.py
```

Another example shows how to draw a trace with a bend:

```bash
python bent_trace.py
```

Gerber files and SVG previews will be written to `output/arduino_like.zip` and the corresponding preview PNG/SVG files.

## MCU Pinout

### Left side (top to bottom)
1. D0
2. D1
3. D2
4. D3
5. D4
6. D5
7. D6
8. D7
9. VCC
10. GND
11. RST
12. VIN
13. 3V3
14. AREF

### Right side (top to bottom)
1. D8
2. D9
3. D10
4. D11
5. D12
6. D13
7. A0
8. A1
9. A2
10. A3
11. A4
12. A5
13. VCC
14. GND

## Components
- **U1** – 28‑pin microcontroller
- **J1** – 14‑pin digital I/O header
- **J2** – 6‑pin analog header
- **J3** – Power header (VIN, VCC, 3V3, GND)
- **J4** – 6‑pin programming header

The example script connects each MCU pin to the corresponding header pad and adds simple silkscreen labels.  Use it as a starting point for your own custom microcontroller boards.
