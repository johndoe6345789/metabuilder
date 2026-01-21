import os
from test.support import load_package_tests, Ty_GIL_DISABLED
import unittest

if Ty_GIL_DISABLED:
    raise unittest.SkipTest("GIL disabled")

def load_tests(*args):
    return load_package_tests(os.path.dirname(__file__), *args)
