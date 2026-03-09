# CMake generated Testfile for 
# Source directory: /Users/rmac/Documents/GitHub/metabuilder-small/dbal/production
# Build directory: /Users/rmac/Documents/GitHub/metabuilder-small/dbal/production/_build
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
add_test([=[dbal_unit_tests]=] "/Users/rmac/Documents/GitHub/metabuilder-small/dbal/production/_build/dbal_unit_tests" "--gtest_output=xml:test_results.xml")
set_tests_properties([=[dbal_unit_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "/Users/rmac/Documents/GitHub/metabuilder-small/dbal/production/CMakeLists.txt;182;add_test;/Users/rmac/Documents/GitHub/metabuilder-small/dbal/production/CMakeLists.txt;0;")
add_test([=[dbal_integration_tests]=] "/Users/rmac/Documents/GitHub/metabuilder-small/dbal/production/_build/dbal_integration_tests" "--gtest_output=xml:integration_results.xml")
set_tests_properties([=[dbal_integration_tests]=] PROPERTIES  TIMEOUT "480" _BACKTRACE_TRIPLES "/Users/rmac/Documents/GitHub/metabuilder-small/dbal/production/CMakeLists.txt;318;add_test;/Users/rmac/Documents/GitHub/metabuilder-small/dbal/production/CMakeLists.txt;0;")
