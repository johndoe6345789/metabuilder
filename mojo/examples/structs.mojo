"""
Struct examples in Mojo - demonstrating ownership and memory safety.
"""

from math import sqrt


struct Point:
    """A 2D point with value semantics."""
    var x: Float64
    var y: Float64

    fn __init__(inout self, x: Float64, y: Float64):
        self.x = x
        self.y = y

    fn __init__(inout self):
        """Default constructor at origin."""
        self.x = 0.0
        self.y = 0.0

    fn distance_to(self, other: Point) -> Float64:
        """Calculate Euclidean distance to another point."""
        let dx = self.x - other.x
        let dy = self.y - other.y
        return sqrt(dx * dx + dy * dy)

    fn __str__(self) -> String:
        return "Point(" + str(self.x) + ", " + str(self.y) + ")"


struct Rectangle:
    """A rectangle defined by two corners."""
    var top_left: Point
    var bottom_right: Point

    fn __init__(inout self, x1: Float64, y1: Float64, x2: Float64, y2: Float64):
        self.top_left = Point(x1, y1)
        self.bottom_right = Point(x2, y2)

    fn width(self) -> Float64:
        return self.bottom_right.x - self.top_left.x

    fn height(self) -> Float64:
        return self.bottom_right.y - self.top_left.y

    fn area(self) -> Float64:
        return self.width() * self.height()

    fn perimeter(self) -> Float64:
        return 2.0 * (self.width() + self.height())

    fn contains(self, p: Point) -> Bool:
        """Check if point is inside rectangle."""
        return (p.x >= self.top_left.x and p.x <= self.bottom_right.x and
                p.y >= self.top_left.y and p.y <= self.bottom_right.y)


struct Color:
    """RGBA color with strict byte ranges."""
    var r: UInt8
    var g: UInt8
    var b: UInt8
    var a: UInt8

    fn __init__(inout self, r: UInt8, g: UInt8, b: UInt8, a: UInt8 = 255):
        self.r = r
        self.g = g
        self.b = b
        self.a = a

    @staticmethod
    fn red() -> Color:
        return Color(255, 0, 0)

    @staticmethod
    fn green() -> Color:
        return Color(0, 255, 0)

    @staticmethod
    fn blue() -> Color:
        return Color(0, 0, 255)

    fn __str__(self) -> String:
        return "Color(r=" + str(int(self.r)) + ", g=" + str(int(self.g)) + ", b=" + str(int(self.b)) + ", a=" + str(int(self.a)) + ")"


fn main():
    print("=== Struct Examples ===\n")

    # Point examples
    let p1 = Point(0.0, 0.0)
    let p2 = Point(3.0, 4.0)
    print("p1 = " + str(p1))
    print("p2 = " + str(p2))
    print("distance = " + str(p1.distance_to(p2)))

    # Rectangle examples
    print("\n-- Rectangle --")
    let rect = Rectangle(0.0, 0.0, 10.0, 5.0)
    print("width = " + str(rect.width()))
    print("height = " + str(rect.height()))
    print("area = " + str(rect.area()))
    print("perimeter = " + str(rect.perimeter()))

    let test_point = Point(5.0, 2.5)
    print("contains " + str(test_point) + ": " + str(rect.contains(test_point)))

    # Color examples
    print("\n-- Colors --")
    print("red = " + str(Color.red()))
    print("green = " + str(Color.green()))
    print("blue = " + str(Color.blue()))
    let custom = Color(128, 64, 32, 200)
    print("custom = " + str(custom))
