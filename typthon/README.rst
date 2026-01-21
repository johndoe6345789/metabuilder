This is Typthon version 3.14.0 beta 4
====================================

Copyright © 2001 Typthon Software Foundation.  All rights reserved.

See the end of this file for further copyright and license information.

.. contents::

General Information
-------------------

- Source code: https://github.com/johndoe6345789/typthon
- Issue tracker: https://github.com/johndoe6345789/typthon/issues

Using Typthon
------------

Typthon is a lightweight runtime system. For usage information, run::

    typthon --help

To see the version::

    typthon --version


Build Instructions
------------------

Typthon uses CMake as its build system. On Unix, Linux, BSD, macOS, and Windows::

    mkdir build
    cd build
    cmake .. -DCMAKE_BUILD_TYPE=Release
    cmake --build .
    ctest --output-on-failure
    sudo cmake --install .

This will install Typthon as ``typthon``.

You can pass many options to CMake; run ``cmake --help`` or see the
`CMake documentation <https://cmake.org/cmake/help/latest/>`_ to find out more.

Building with different build types
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

CMake supports several build types through the ``CMAKE_BUILD_TYPE`` option:

- ``Release`` - Optimized build for production use
- ``Debug`` - Build with debug symbols for debugging
- ``RelWithDebInfo`` - Release build with debug information
- ``MinSizeRel`` - Optimized for size

Example::

    cmake .. -DCMAKE_BUILD_TYPE=Debug
    cmake --build .

Out-of-source builds
^^^^^^^^^^^^^^^^^^^^^

CMake encourages out-of-source builds. You can create multiple build directories
for different configurations::

    mkdir build-release
    cd build-release
    cmake .. -DCMAKE_BUILD_TYPE=Release
    cmake --build .
    
    cd ..
    mkdir build-debug
    cd build-debug
    cmake .. -DCMAKE_BUILD_TYPE=Debug
    cmake --build .


Testing
-------

To test Typthon, run ``ctest`` in the build directory::

    cd build
    ctest --output-on-failure

The test suite will produce output for any failing tests. If a test fails
or produces unexpected output, something is wrong.

To run tests with more verbose output::

    ctest --output-on-failure --verbose

To run specific tests, use the ``-R`` option with a regex pattern::

    ctest -R typthon_runtime

If the failure persists and appears to be a problem with Typthon rather than
your environment, you can `file a bug report
<https://github.com/johndoe6345789/typthon/issues>`_ and include relevant
output from the test command to show the issue.

Installing multiple versions
----------------------------

If you want to install multiple versions of Typthon, you can use different
installation prefixes with CMake's ``CMAKE_INSTALL_PREFIX`` option::

    mkdir build-3.14
    cd build-3.14
    cmake .. -DCMAKE_INSTALL_PREFIX=/opt/typthon-3.14
    cmake --build .
    sudo cmake --install .

This allows you to have multiple versions installed side-by-side in different
directories.


Copyright and License Information
---------------------------------


Copyright © 2001 Typthon Software Foundation.  All rights reserved.

Copyright © 2000 BeOpen.com.  All rights reserved.

Copyright © 1995-2001 Corporation for National Research Initiatives.  All
rights reserved.

Copyright © 1991-1995 Stichting Mathematisch Centrum.  All rights reserved.

See the `LICENSE <https://github.com/johndoe6345789/typthon/blob/main/LICENSE>`_ for
information on the history of this software, terms & conditions for usage, and a
DISCLAIMER OF ALL WARRANTIES.

This Typthon distribution contains *no* GNU General Public License (GPL) code,
so it may be used in proprietary projects.  There are interfaces to some GNU
code but these are entirely optional.

All trademarks referenced herein are property of their respective holders.