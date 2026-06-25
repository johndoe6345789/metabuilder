/**
 * @file test_main.cpp
 * @brief Custom GTest main for DBAL integration tests.
 *
 * Registers ContainerEnvironment which starts PostgreSQL and MySQL containers
 * in parallel before any test suite runs. Both containers are ready by the time
 * the first database test begins.
 */

#include <gtest/gtest.h>
#include "../helpers/integration_fixture.hpp"

int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    ::testing::AddGlobalTestEnvironment(new dbal_test::ContainerEnvironment());
    return RUN_ALL_TESTS();
}
