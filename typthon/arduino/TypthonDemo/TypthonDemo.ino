// Typthon demo sketch that uses the TypthonMini Arduino library with a typed Python-esque runtime.
#include <Arduino.h>
#include <TypthonMini.h>

using typthon::Interpreter;

const char *demoScript = R"PY(
# Demonstrate strict TypthonMini features: lists, dicts, lambdas, defs, classes
numbers = [1, 2, 3]
text_label = "counter"

adder = lambda x, y: x + y

def combine(values, extra):
    summed = adder(values[0], values[1])
    total = summed + extra
    return [summed, total]

class Counter:
    def __init__(self, start):
        self.value = start
    def increment(self, delta):
        self.value = self.value + delta
        return self.value

tracker = Counter(10)
new_numbers = numbers + [adder(4, 5)]
combined = combine(new_numbers, 7)
state = {"label": text_label, "latest": tracker.increment(3), "values": combined}

print("Numbers:", new_numbers)
print("Combined:", combined)
print(state["label"], state["latest"])
)PY";

void setup() {
    Serial.begin(9600);
    while (!Serial) {
        ;
    }
    Serial.println(F("Starting Typthon typed Python-like demo script..."));
    Interpreter interpreter(demoScript);
    interpreter.run();
    Serial.println(F("Script finished."));
}

void loop() {
    // Intentionally empty to keep the demo one-shot.
}
