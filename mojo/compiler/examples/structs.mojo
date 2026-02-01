#!/usr/bin/env mojo
# Example: Struct definitions and methods

struct Point:
    """A 2D point with x and y coordinates."""
    var x: Int
    var y: Int
    
    fn __init__(inout self, x: Int, y: Int):
        """Initialize a point with coordinates."""
        self.x = x
        self.y = y
    
    fn distance_from_origin(self) -> Float:
        """Calculate distance from origin."""
        return sqrt(Float(self.x * self.x + self.y * self.y))
    
    fn move(inout self, dx: Int, dy: Int):
        """Move the point by dx, dy."""
        self.x = self.x + dx
        self.y = self.y + dy

struct Rectangle:
    """A rectangle defined by width and height."""
    var width: Int
    var height: Int
    
    fn __init__(inout self, width: Int, height: Int):
        """Initialize a rectangle."""
        self.width = width
        self.height = height
    
    fn area(self) -> Int:
        """Calculate the area."""
        return self.width * self.height
    
    fn perimeter(self) -> Int:
        """Calculate the perimeter."""
        return 2 * (self.width + self.height)
    
    fn is_square(self) -> Bool:
        """Check if the rectangle is a square."""
        return self.width == self.height

fn main():
    var p = Point(3, 4)
    print("Point:", p.x, p.y)
    print("Distance from origin:", p.distance_from_origin())
    
    p.move(1, 1)
    print("After moving:", p.x, p.y)
    
    let rect = Rectangle(10, 5)
    print("Rectangle area:", rect.area())
    print("Rectangle perimeter:", rect.perimeter())
    print("Is square:", rect.is_square())
