"""
Python interop in Mojo - demonstrating seamless Python library usage.
"""

from python import Python


fn use_numpy() raises:
    """Use NumPy from Mojo."""
    print("-- NumPy Integration --")
    let np = Python.import_module("numpy")

    # Create arrays
    let arr = np.array([1, 2, 3, 4, 5])
    print("arr = " + str(arr))
    print("mean = " + str(arr.mean()))
    print("std = " + str(arr.std()))
    print("sum = " + str(arr.sum()))

    # Matrix operations
    let matrix = np.array([[1, 2], [3, 4]])
    print("\nmatrix =")
    print(matrix)
    print("transpose =")
    print(matrix.T)
    print("determinant = " + str(np.linalg.det(matrix)))


fn use_json() raises:
    """Use Python's json module."""
    print("\n-- JSON Integration --")
    let json = Python.import_module("json")

    # Create Python dict
    let builtins = Python.import_module("builtins")
    let data = builtins.dict()
    _ = data.__setitem__("name", "MetaBuilder")
    _ = data.__setitem__("version", "2.0")
    _ = data.__setitem__("features", builtins.list(["mojo", "typescript", "python"]))

    let json_str = json.dumps(data, indent=2)
    print("JSON output:")
    print(json_str)


fn use_datetime() raises:
    """Use Python's datetime module."""
    print("\n-- DateTime Integration --")
    let datetime = Python.import_module("datetime")

    let now = datetime.datetime.now()
    print("Current time: " + str(now))
    print("ISO format: " + str(now.isoformat()))

    let delta = datetime.timedelta(days=7)
    let next_week = now + delta
    print("Next week: " + str(next_week))


fn use_math() raises:
    """Use Python's math for comparison."""
    print("\n-- Math Comparison --")
    let math = Python.import_module("math")

    let values = Python.evaluate("[0.5, 1.0, 1.5, 2.0]")
    print("Computing trigonometric functions:")
    for v in values:
        print("sin(" + str(v) + ") = " + str(math.sin(v)))


fn main() raises:
    print("=== Python Interop Examples ===\n")

    # Check Python availability
    print("Python is available: " + str(Python.is_available()))

    try:
        use_numpy()
    except e:
        print("NumPy not available: " + str(e))

    try:
        use_json()
    except e:
        print("JSON error: " + str(e))

    try:
        use_datetime()
    except e:
        print("DateTime error: " + str(e))

    try:
        use_math()
    except e:
        print("Math error: " + str(e))

    print("\n=== Done ===")
