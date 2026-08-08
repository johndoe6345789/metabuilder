cmake_minimum_required(VERSION 3.20)
project(pastebin-backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_compile_options(-Wall -Wextra -Wpedantic -Werror)

# Re-marks a dependency's own headers as SYSTEM on `target` so -Werror
# never fails on a warning we don't control.
function(silence_vendor_warnings target dependency)
    get_target_property(inc ${dependency} INTERFACE_INCLUDE_DIRECTORIES)
    if(inc)
        target_include_directories(${target} SYSTEM PRIVATE ${inc})
    endif()
endfunction()

find_package(Drogon REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(CURL REQUIRED)
find_package(jwt-cpp REQUIRED)
find_package(nlohmann_json REQUIRED)

set(PASTEBIN_UTIL_SOURCES
    src/util.cpp
)

set(PASTEBIN_SOURCES
    ${PASTEBIN_UTIL_SOURCES}
    src/services/CurlHandle.cpp
    src/services/DbalClient.cpp
    src/services/DbalClient_method.cpp
    src/services/DbalClient_pages.cpp
    src/services/JsonConvert.cpp
    src/services/JwtJwks_fetch.cpp
    src/services/JwtJwks_findkey.cpp
    src/services/JwtJwks_key.cpp
    src/services/JwtJwks.cpp
    src/services/JwtAuth.cpp
    src/services/Uuid.cpp
    src/services/RandomToken.cpp
    src/services/UserLookup.cpp
    src/services/TimeCoerce.cpp
    src/services/SnippetJson_normalize.cpp
    src/services/SnippetJson_build.cpp
    src/services/SnippetOwnership.cpp
    src/services/SnippetRevisions.cpp
    src/services/SnippetFork.cpp
    src/services/NamespaceJson.cpp
    src/services/NamespaceOwnership.cpp
    src/services/NamespaceRehome.cpp
    src/services/DockerDemux.cpp
    src/services/RunFiles.cpp
    src/services/RunnerRegistry.cpp
    src/services/RunnerRegistry_core.cpp
    src/services/RunnerRegistry_script.cpp
    src/services/RunnerRegistry_compiled.cpp
    src/services/RunnerRegistry_misc.cpp
    src/services/RunnerRegistry_sql.cpp
    src/services/DockerRequest.cpp
    src/services/DockerEngine_create.cpp
    src/services/DockerEngine_lifecycle.cpp
    src/services/DockerEngine_logs.cpp
    src/services/DockerImage.cpp
    src/services/DockerRunToCompletion.cpp
    src/services/RunCommand_files.cpp
    src/services/RunCommand_build.cpp
    src/services/ParseRunRequest_extract.cpp
    src/services/ParseRunRequest_cmake.cpp
    src/services/ParseRunRequest.cpp
    src/services/SqlCommands_sqlite.cpp
    src/services/SqlCommands_mysql.cpp
    src/services/SqlCommands_postgres.cpp
    src/services/SqlRunner_command.cpp
    src/services/SqlRunner.cpp
    src/services/UserRunTimeout.cpp
    src/services/RunLanguageExec.cpp
    src/services/SocketIo.cpp
    src/services/UnixSocketConnect.cpp
    src/services/UnixSocketAttach.cpp
    src/services/StreamingDemux.cpp
    src/services/LineSplitter.cpp
    src/services/PromptSentinel.cpp
    src/services/InteractivePreamble.cpp
    src/services/InteractiveSession.cpp
    src/services/InteractiveSession_start.cpp
    src/services/InteractiveSession_read.cpp
    src/services/SessionStore.cpp
    src/services/DockerNetwork.cpp
    src/services/DockerInspect.cpp
    src/services/TcpConnect.cpp
    src/services/DapFrame.cpp
    src/services/OwnContainerId.cpp
    src/services/DebugRunnerRegistry.cpp
    src/services/DebugLaunchArgs.cpp
    src/services/DebugSession.cpp
    src/services/DebugSession_start.cpp
    src/services/DebugSession_read.cpp
    src/services/DebugSessionStore.cpp
    src/services/Base64.cpp
    src/services/AiHttpPost.cpp
    src/services/AiProviderClient.cpp
    src/controllers/HealthCtrl.cpp
    src/controllers/AuthCtrl_me.cpp
    src/controllers/AuthCtrl_settings.cpp
    src/controllers/ProfileCtrl_get.cpp
    src/controllers/ProfileCtrl_update.cpp
    src/controllers/SnippetsCtrl_list.cpp
    src/controllers/SnippetsCtrl_get.cpp
    src/controllers/SnippetsCtrl_create.cpp
    src/controllers/SnippetsCtrl_update.cpp
    src/controllers/SnippetsCtrl_remove.cpp
    src/controllers/SnippetsCtrl_share.cpp
    src/controllers/SnippetsCtrl_unshare.cpp
    src/controllers/SnippetsCtrl_getShared.cpp
    src/controllers/SnippetsCtrl_forkShared.cpp
    src/controllers/SnippetsCtrl_fork.cpp
    src/controllers/SnippetsCtrl_revisions.cpp
    src/controllers/SnippetsCtrl_revert.cpp
    src/controllers/SnippetsCtrl_bulkMove.cpp
    src/controllers/NamespacesCtrl_list.cpp
    src/controllers/NamespacesCtrl_create.cpp
    src/controllers/NamespacesCtrl_remove.cpp
    src/controllers/NamespacesCtrl_update.cpp
    src/controllers/AdminCtrl_wipe.cpp
    src/controllers/RunCtrl_run.cpp
    src/controllers/InteractiveCtrl_start.cpp
    src/controllers/InteractiveCtrl_poll.cpp
    src/controllers/InteractiveCtrl_input.cpp
    src/controllers/DebugCtrl_start.cpp
    src/controllers/DebugCtrl_dap.cpp
    src/controllers/DebugCtrl_poll.cpp
    src/controllers/DebugCtrl_stop.cpp
    src/controllers/AiCtrl_getSettings.cpp
    src/controllers/AiCtrl_saveSettings.cpp
    src/controllers/AiCtrl_analyze.cpp
)

add_executable(pastebin-server src/main.cpp ${PASTEBIN_SOURCES})
target_link_libraries(pastebin-server PRIVATE
    Drogon::Drogon
    OpenSSL::SSL
    CURL::libcurl
    jwt-cpp::jwt-cpp
    nlohmann_json::nlohmann_json
)
silence_vendor_warnings(pastebin-server Drogon::Drogon)
silence_vendor_warnings(pastebin-server CURL::libcurl)
silence_vendor_warnings(pastebin-server jwt-cpp::jwt-cpp)
silence_vendor_warnings(pastebin-server nlohmann_json::nlohmann_json)

install(TARGETS pastebin-server RUNTIME DESTINATION bin)

# Build tests locally/CI with: cmake .. -DBUILD_TESTING=ON
option(BUILD_TESTING "Build GTest unit tests" OFF)
if(BUILD_TESTING)
    enable_testing()
    find_package(GTest REQUIRED)

    add_executable(pastebin-tests
        tests/util_test.cpp
        tests/run_files_test.cpp
        tests/docker_demux_test.cpp
        tests/streaming_demux_test.cpp
        tests/line_splitter_test.cpp
        tests/prompt_sentinel_test.cpp
        tests/interactive_preamble_test.cpp
        tests/dap_frame_test.cpp
        ${PASTEBIN_UTIL_SOURCES}
        src/services/RunFiles.cpp
        src/services/DockerDemux.cpp
        src/services/StreamingDemux.cpp
        src/services/LineSplitter.cpp
        src/services/PromptSentinel.cpp
        src/services/InteractivePreamble.cpp
        src/services/DapFrame.cpp
    )
    target_link_libraries(pastebin-tests PRIVATE
        GTest::gtest GTest::gtest_main)
    silence_vendor_warnings(pastebin-tests GTest::gtest)

    add_test(NAME pastebin-tests COMMAND pastebin-tests)
endif()
