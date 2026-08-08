cmake_minimum_required(VERSION 3.20)
project(dbal_daemon CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# BUILD_DAEMON=OFF lets you build only test targets without daemon deps (Drogon, mongo, etc.)
# Useful for local dev on macOS where mongo-c-driver or libpq may not be available.
option(BUILD_DAEMON "Build the main DBAL daemon executable" ON)

# ── Coverage instrumentation ──────────────────────────────────────────────────
# Enable with: cmake .. -DENABLE_COVERAGE=ON
# After running tests: cmake --build . --target coverage
option(ENABLE_COVERAGE "Add --coverage flags for gcov/lcov code coverage" OFF)
if(ENABLE_COVERAGE)
    if(NOT CMAKE_BUILD_TYPE STREQUAL "Debug")
        message(WARNING "Coverage is most accurate with -DCMAKE_BUILD_TYPE=Debug")
    endif()
    add_compile_options(--coverage -O0 -fno-inline)
    add_link_options(--coverage)
    find_program(LCOV lcov REQUIRED)
    find_program(GENHTML genhtml REQUIRED)
    add_custom_target(coverage
        COMMAND ${LCOV} --capture --directory . --output-file coverage.info
            --gcov-tool gcov --ignore-errors mismatch
        COMMAND ${LCOV} --remove coverage.info
            '/usr/*' '/opt/homebrew/*' "${CMAKE_CURRENT_SOURCE_DIR}/tests/*"
            --output-file coverage_filtered.info --ignore-errors unused
        COMMAND ${GENHTML} coverage_filtered.info --output-directory coverage_html
            --title "DBAL Coverage" --ignore-errors source
        COMMAND ${CMAKE_COMMAND} -E echo "Coverage report: ${CMAKE_BINARY_DIR}/coverage_html/index.html"
        WORKING_DIRECTORY ${CMAKE_BINARY_DIR}
        COMMENT "Generating lcov HTML coverage report"
    )
endif()

# ── Auto-generate types.generated.hpp from JSON entity schemas ────────────────
# Runs gen_types.py at configure time if the output file is missing/stale.
# In Docker builds this step runs explicitly in the Dockerfile; here it's a
# safety net for local builds without running the Dockerfile first.
get_filename_component(DBAL_REPO_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/.." ABSOLUTE)
set(TYPES_GENERATED "${CMAKE_CURRENT_SOURCE_DIR}/include/dbal/core/types.generated.hpp")
set(GEN_TYPES_SCRIPT "${DBAL_REPO_ROOT}/shared/tools/codegen/gen_types.py")
set(SCHEMA_DIR "${DBAL_REPO_ROOT}/shared/api/schema")

if(NOT EXISTS "${TYPES_GENERATED}")
    message(STATUS "DBAL: generating ${TYPES_GENERATED}")
    execute_process(
        COMMAND python3 "${GEN_TYPES_SCRIPT}"
            --schema-dir "${SCHEMA_DIR}"
            --cpp-output "${TYPES_GENERATED}"
            --cpp-only
        RESULT_VARIABLE GEN_RESULT
    )
    if(NOT GEN_RESULT EQUAL 0)
        message(FATAL_ERROR "gen_types.py failed — check schema dir: ${SCHEMA_DIR}")
    endif()
endif()

# Packages always available from Conan (tests + daemon)
find_package(nlohmann_json REQUIRED)
find_package(spdlog REQUIRED)
find_package(fmt REQUIRED)
find_package(SQLite3 REQUIRED)
find_package(inja REQUIRED)
find_package(GTest REQUIRED)
find_package(jwt-cpp REQUIRED)
find_package(OpenSSL REQUIRED) # RSA/EVP for oidc/crypto — dbal_daemon already got this
find_package(argon2 REQUIRED) # Argon2id password hashing for Credential
find_package(xmlsec REQUIRED) # XML-DSig sign/verify for SAML
find_package(LibXml2 REQUIRED) # SAML AuthnRequest/Response DOM construction
find_package(ZLIB REQUIRED) # SAML HTTP-Redirect binding raw-DEFLATE decode
                                # transitively via Drogon, but dbal_unit_tests doesn't
                                # link Drogon, so it needs an explicit find here too.

# System DB client libs — needed by daemon and integration tests, not unit tests
if(BUILD_DAEMON OR BUILD_INTEGRATION_TESTS)
    find_package(PostgreSQL REQUIRED)
    find_package(PkgConfig REQUIRED)
    pkg_check_modules(MYSQL REQUIRED mysqlclient)
    # pkg-config for Homebrew mysql-client returns include/mysql/ (one level too deep).
    # The source uses #include <mysql/mysql.h>, so we need the parent directory.
    set(_mysql_include_fixed)
    foreach(_dir IN LISTS MYSQL_INCLUDE_DIRS)
        if(EXISTS "${_dir}/mysql/mysql.h")
            list(APPEND _mysql_include_fixed "${_dir}")
        else()
            get_filename_component(_parent "${_dir}" DIRECTORY)
            if(EXISTS "${_parent}/mysql/mysql.h")
                list(APPEND _mysql_include_fixed "${_parent}")
            else()
                list(APPEND _mysql_include_fixed "${_dir}")
            endif()
        endif()
    endforeach()
    set(MYSQL_INCLUDE_DIRS "${_mysql_include_fixed}")
endif()

if(BUILD_DAEMON)
    # Daemon-only Conan packages (not needed for any tests)
    find_package(Drogon REQUIRED)
    find_package(cpr REQUIRED)
    find_package(mongocxx REQUIRED)
    find_package(Boost REQUIRED)

    # Glob all source files (exclude adapters with unavailable deps)
    file(GLOB_RECURSE DBAL_SOURCES
        "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
    )
    list(FILTER DBAL_SOURCES EXCLUDE REGEX ".*/adapters/cassandra/.*")
    list(FILTER DBAL_SOURCES EXCLUDE REGEX ".*/adapters/redis/.*")
    list(FILTER DBAL_SOURCES EXCLUDE REGEX ".*/config/test_config\\.cpp")

    # Glob all headers
    file(GLOB_RECURSE DBAL_HEADERS
        "${CMAKE_CURRENT_SOURCE_DIR}/src/*.hpp"
        "${CMAKE_CURRENT_SOURCE_DIR}/include/*.hpp"
    )
    list(FILTER DBAL_HEADERS EXCLUDE REGEX ".*/adapters/cassandra/.*")
    list(FILTER DBAL_HEADERS EXCLUDE REGEX ".*/adapters/redis/.*")

    add_executable(dbal_daemon ${DBAL_SOURCES} ${DBAL_HEADERS})

    target_include_directories(dbal_daemon PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
        ${CMAKE_CURRENT_SOURCE_DIR}/src/daemon
        ${CMAKE_CURRENT_SOURCE_DIR}/src/core
        ${CMAKE_CURRENT_SOURCE_DIR}/src/adapters
        ${CMAKE_CURRENT_SOURCE_DIR}/include
        ${CMAKE_CURRENT_SOURCE_DIR}/include/dbal
        ${PostgreSQL_INCLUDE_DIRS}
        ${MYSQL_INCLUDE_DIRS}
    )

    target_link_libraries(dbal_daemon PRIVATE
        Drogon::Drogon
        nlohmann_json::nlohmann_json
        spdlog::spdlog
        fmt::fmt
        SQLite::SQLite3
        cpr::cpr
        pantor::inja
        mongo::mongocxx_static
        mongo::bsoncxx_static
        Boost::boost
        PostgreSQL::PostgreSQL
        ${MYSQL_LIBRARIES}
        jwt-cpp::jwt-cpp
        OpenSSL::Crypto
        argon2::argon2
        xmlsec::xmlsec
        LibXml2::LibXml2
        ZLIB::ZLIB
    )

    install(TARGETS dbal_daemon DESTINATION bin)
endif() # BUILD_DAEMON

# ===== Unit + Security Tests =====
# Build tests locally with: cmake .. -DBUILD_TESTING=ON
# Disabled in production Docker builds (tests/ not copied to image).
option(BUILD_TESTING "Build GTest unit and security tests" OFF)

if(BUILD_TESTING)
    enable_testing()

    set(DBAL_UNIT_TEST_SOURCES
        tests/unit/sql_where_builder_test.cpp
        tests/security/sql_injection_test.cpp
        tests/unit/query_procedures_test.cpp
        tests/unit/schema_loader_test.cpp
        tests/security/oidc_rsa_keypair_test.cpp
        tests/security/schema_acl_registry_test.cpp
        tests/security/saml_xmldsig_test.cpp
        tests/security/token_issuer_role_claim_test.cpp
        tests/security/rs_jwt_validator_role_claim_test.cpp
        tests/security/oauth_client_config_post_logout_test.cpp
        tests/security/reversible_crypto_test.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/security/crypto/reversible_crypto.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/oidc/crypto/rsa_keypair.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/oidc/tokens/token_issuer.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/oidc/clients/oauth_client_config.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/security/jwt/rs_jwt_validator.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/saml/xmldsig/xmlsec_context.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/saml/xmldsig/signer.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/saml/xmldsig/verifier.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/core/schema_acl_registry.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/core/entity_loader.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/core/loaders/field_parser.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/core/loaders/relation_parser.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/core/loaders/schema_validator.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/core/loaders/json_parser.cpp
        ${CMAKE_CURRENT_SOURCE_DIR}/src/core/loaders/schema_cache.cpp
    )

    add_executable(dbal_unit_tests ${DBAL_UNIT_TEST_SOURCES})

    target_include_directories(dbal_unit_tests PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
        ${CMAKE_CURRENT_SOURCE_DIR}/src/daemon
        ${CMAKE_CURRENT_SOURCE_DIR}/src/core
        ${CMAKE_CURRENT_SOURCE_DIR}/src/adapters
        ${CMAKE_CURRENT_SOURCE_DIR}/include
        ${CMAKE_CURRENT_SOURCE_DIR}/include/dbal
        ${PostgreSQL_INCLUDE_DIRS}
        ${MYSQL_INCLUDE_DIRS}
    )

    target_link_libraries(dbal_unit_tests PRIVATE
        GTest::GTest
        GTest::Main
        nlohmann_json::nlohmann_json
        spdlog::spdlog
        fmt::fmt
        SQLite::SQLite3
        jwt-cpp::jwt-cpp
        OpenSSL::Crypto
        xmlsec::xmlsec
        LibXml2::LibXml2
    )

    add_test(NAME dbal_unit_tests COMMAND dbal_unit_tests --gtest_output=xml:test_results.xml)
endif()

# ===== Integration Tests =====
# SQLite tests always run (in-memory, no containers).
# PostgreSQL and MySQL tests start real containers automatically via testcontainers-sidecar.
# Requires:
#   - Docker running
#   - testcontainers-sidecar in Conan remote (see deployment/build-testcontainers.sh)
#   - System DB client libs: brew install postgresql@16 mysql-client (macOS)
#                             apt install libpq-dev libmysqlclient-dev (Linux)
#
# Build: cmake .. -DBUILD_INTEGRATION_TESTS=ON
# Run:   ctest -R dbal_integration_tests --output-on-failure -V
option(BUILD_INTEGRATION_TESTS "Build GTest integration tests (SQLite always; PG/MySQL via testcontainers-sidecar)" OFF)

if(BUILD_INTEGRATION_TESTS)
    enable_testing()

    # mongocxx is otherwise only found under BUILD_DAEMON -- needed here too
    # now that adapter_factory.cpp (which #includes mongodb_adapter.hpp
    # unconditionally, regardless of which adapter a given Client actually
    # uses at runtime) is compiled into this target, see below.
    find_package(mongocxx REQUIRED)

    # Adapter sources: SQLite + SQL base (no Drogon HTTP handlers, no cassandra/redis)
    file(GLOB SQLITE_ADAPTER_SOURCES
        "${CMAKE_CURRENT_SOURCE_DIR}/src/adapters/sqlite/*.cpp"
    )
    list(FILTER SQLITE_ADAPTER_SOURCES EXCLUDE REGEX ".*\\.bak$")
    list(FILTER SQLITE_ADAPTER_SOURCES EXCLUDE REGEX ".*_old\\.cpp$")

    file(GLOB SQL_ADAPTER_SOURCES
        "${CMAKE_CURRENT_SOURCE_DIR}/src/adapters/sql/*.cpp"
    )
    list(FILTER SQL_ADAPTER_SOURCES EXCLUDE REGEX ".*/prisma_adapter\\.cpp")

    file(GLOB MONGODB_ADAPTER_SOURCES
        "${CMAKE_CURRENT_SOURCE_DIR}/src/adapters/mongodb/*.cpp"
    )

    file(GLOB CORE_SOURCES
        "${CMAKE_CURRENT_SOURCE_DIR}/src/core/*.cpp"
        "${CMAKE_CURRENT_SOURCE_DIR}/src/core/loaders/*.cpp"
    )
    # adapter_factory.cpp is now included (no longer filtered out) so
    # dbal::Client -- and by extension OidcService/RefreshTokenStore, which
    # take a Client& -- can actually be constructed in this test binary. It
    # unconditionally #includes mongodb_adapter.hpp regardless of which
    # backend a given test's Client config picks at runtime, hence pulling
    # in MONGODB_ADAPTER_SOURCES + mongocxx above even for sqlite-only tests.

    # Supabase adapter sources (exclude http_client.cpp — needs cpr, daemon-only)
    file(GLOB SUPABASE_ADAPTER_SOURCES
        "${CMAKE_CURRENT_SOURCE_DIR}/src/adapters/supabase/*.cpp"
    )
    list(FILTER SUPABASE_ADAPTER_SOURCES EXCLUDE REGEX ".*/supabase_http_client\\.cpp$")

    file(GLOB CLIENT_SOURCES
        "${CMAKE_CURRENT_SOURCE_DIR}/src/client*.cpp"
    )

    set(DBAL_INTEGRATION_TEST_SOURCES
        tests/integration/test_main.cpp
        tests/integration/sqlite_bi_test.cpp
        tests/integration/postgres_integration_test.cpp
        tests/integration/mysql_integration_test.cpp
        tests/integration/client_credential_tenant_test.cpp
        tests/integration/client_user_crud_test.cpp
        tests/integration/refresh_token_revoke_test.cpp
        tests/integration/oidc_browser_session_test.cpp
        tests/unit/supabase_adapter_test.cpp
        tests/unit/sql_utils_test.cpp
        tests/unit/sql_parser_test.cpp
        tests/unit/supabase_utils_test.cpp
        tests/unit/core_utils_test.cpp
        tests/unit/core_loaders_test.cpp
        tests/unit/prisma_gen_test.cpp
        tests/unit/entity_loader_gtest.cpp
        tests/unit/sqlite_utils_test.cpp
        tests/unit/sqlite_adapter_internals_test.cpp
        tests/unit/sql_adapter_utils_test.cpp
        tests/unit/sql_adapter_di_test.cpp
        src/errors.cpp
        src/oidc/oidc_service.cpp
        src/oidc/clients/oauth_client_config.cpp
        src/oidc/tokens/auth_code_store.cpp
        src/oidc/tokens/refresh_token_store.cpp
        src/oidc/tokens/token_issuer.cpp
        src/oidc/crypto/rsa_keypair.cpp
        src/security/crypto/password_hash.cpp
    )

    add_executable(dbal_integration_tests
        ${DBAL_INTEGRATION_TEST_SOURCES}
        ${SQLITE_ADAPTER_SOURCES}
        ${SQL_ADAPTER_SOURCES}
        ${SUPABASE_ADAPTER_SOURCES}
        ${MONGODB_ADAPTER_SOURCES}
        ${CORE_SOURCES}
        ${CLIENT_SOURCES}
    )

    # Pass the template directory at configure time so tests can find SQL Jinja2 templates
    get_filename_component(DBAL_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/.." ABSOLUTE)

    # Entity schema + SQL template dirs: local (non-Docker) checkouts have production/,
    # shared/, and templates/ as true siblings under dbal/, so these live at
    # DBAL_ROOT/shared/api/schema/entities and DBAL_ROOT/templates/sql. The Docker
    # builder image instead COPYs shared/ and templates/ directly under the same
    # WORKDIR as production/'s own contents (see build-config/Dockerfile), so there
    # they're direct children of CMAKE_CURRENT_SOURCE_DIR, not DBAL_ROOT. Prefer
    # whichever actually exists.
    if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/shared/api/schema/entities")
        set(DBAL_TEST_SCHEMA_DIR_VALUE "${CMAKE_CURRENT_SOURCE_DIR}/shared/api/schema/entities")
    else()
        set(DBAL_TEST_SCHEMA_DIR_VALUE "${DBAL_ROOT}/shared/api/schema/entities")
    endif()
    if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/templates/sql")
        set(DBAL_TEST_TEMPLATE_DIR_VALUE "${CMAKE_CURRENT_SOURCE_DIR}/templates/sql")
    else()
        set(DBAL_TEST_TEMPLATE_DIR_VALUE "${DBAL_ROOT}/templates/sql")
    endif()

    # Locate testcontainers-sidecar binary.
    # 1. Try the Conan package: after find_package(testcontainers-sidecar), CMakeDeps exposes
    #    testcontainers-sidecar_PACKAGE_FOLDER_<BUILD_TYPE> from the data.cmake file.
    # 2. Fall back to $ENV{TESTCONTAINERS_SIDECAR_BIN} (set by sourcing conanbuild.sh).
    # 3. Fall back to find_program PATH search (CI with binary on PATH).
    find_package(testcontainers-sidecar QUIET)
    if(testcontainers-sidecar_FOUND)
        string(TOUPPER "${CMAKE_BUILD_TYPE}" _BT)
        set(_sidecar_pkg "${testcontainers-sidecar_PACKAGE_FOLDER_${_BT}}")
        set(_sidecar_bin "${_sidecar_pkg}/bin/testcontainers-sidecar")
        if(EXISTS "${_sidecar_bin}")
            set(TESTCONTAINERS_SIDECAR "${_sidecar_bin}")
            message(STATUS "DBAL: testcontainers-sidecar (Conan) at ${TESTCONTAINERS_SIDECAR}")
        endif()
    endif()
    if(NOT TESTCONTAINERS_SIDECAR AND DEFINED ENV{TESTCONTAINERS_SIDECAR_BIN})
        set(TESTCONTAINERS_SIDECAR "$ENV{TESTCONTAINERS_SIDECAR_BIN}")
        message(STATUS "DBAL: testcontainers-sidecar (env) at ${TESTCONTAINERS_SIDECAR}")
    endif()
    if(NOT TESTCONTAINERS_SIDECAR)
        find_program(TESTCONTAINERS_SIDECAR testcontainers-sidecar)
        if(TESTCONTAINERS_SIDECAR)
            message(STATUS "DBAL: testcontainers-sidecar (PATH) at ${TESTCONTAINERS_SIDECAR}")
        else()
            message(WARNING "DBAL: testcontainers-sidecar not found — PG/MySQL tests skipped. Run: deployment/build-testcontainers.sh")
        endif()
    endif()

    target_compile_definitions(dbal_integration_tests PRIVATE
        DBAL_TEST_TEMPLATE_DIR="${DBAL_TEST_TEMPLATE_DIR_VALUE}"
        DBAL_TEST_SCHEMA_DIR="${DBAL_TEST_SCHEMA_DIR_VALUE}"
        TESTCONTAINERS_SIDECAR_BIN="${TESTCONTAINERS_SIDECAR}"
    )

    target_include_directories(dbal_integration_tests PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
        ${CMAKE_CURRENT_SOURCE_DIR}/src/daemon
        ${CMAKE_CURRENT_SOURCE_DIR}/src/core
        ${CMAKE_CURRENT_SOURCE_DIR}/src/adapters
        ${CMAKE_CURRENT_SOURCE_DIR}/include
        ${CMAKE_CURRENT_SOURCE_DIR}/include/dbal
        ${PostgreSQL_INCLUDE_DIRS}
        ${MYSQL_INCLUDE_DIRS}
    )

    target_link_directories(dbal_integration_tests PRIVATE ${MYSQL_LIBRARY_DIRS})
    target_link_libraries(dbal_integration_tests PRIVATE
        GTest::GTest
        GTest::gmock
        nlohmann_json::nlohmann_json
        spdlog::spdlog
        fmt::fmt
        SQLite::SQLite3
        pantor::inja
        PostgreSQL::PostgreSQL
        ${MYSQL_LIBRARIES}
        mongo::mongocxx_static
        mongo::bsoncxx_static
        jwt-cpp::jwt-cpp
        OpenSSL::Crypto
        argon2::argon2
    )

    # Supabase unit tests use a GMock ISupabaseHttpClient — real SupabaseHttpClient
    # (which needs cpr) is excluded from this build.
    target_compile_definitions(dbal_integration_tests PRIVATE DBAL_NO_REAL_HTTP_CLIENT)

    add_test(NAME dbal_integration_tests
        COMMAND dbal_integration_tests --gtest_output=xml:integration_results.xml)
    # Containers start in parallel (max ~180s), then 53 tests run.
    # 480s = 3x the parallel startup time + generous test execution margin.
    set_tests_properties(dbal_integration_tests PROPERTIES TIMEOUT 480)
endif()
