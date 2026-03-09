/**
 * @file integration_fixture.hpp
 * @brief Shared GTest fixture for DBAL integration tests.
 *
 * - Writes a minimal TestItem.json entity schema to a temp directory.
 * - Sets DBAL_SCHEMA_DIR and DBAL_TEMPLATE_DIR env vars before adapter construction.
 * - Seeds 8 deterministic rows across two tenants for predictable assertions.
 * - SQLite subclass: uses in-memory DB (no external deps).
 * - PostgreSQL/MySQL subclasses: containers are started once in ContainerEnvironment
 *   (before any tests run) via parallel std::threads. Both containers are ready by the
 *   time the first test begins. Ryuk cleans containers on process exit.
 *
 * Containers are registered via a custom main() in test_main.cpp:
 *   ::testing::AddGlobalTestEnvironment(new ContainerEnvironment());
 */
#pragma once

#include <gtest/gtest.h>
#include <fstream>
#include <filesystem>
#include <cstdlib>
#include <string>
#include <vector>
#include <thread>
#include <nlohmann/json.hpp>

#include "../../src/adapters/sqlite/sqlite_adapter.hpp"
#include "../../include/dbal/core/types.hpp"

// POSIX process management for sidecar fork/exec
#ifndef _WIN32
#  include <unistd.h>
#  include <sys/wait.h>
#  include <sys/select.h>
#  include <sys/socket.h>
#  include <netinet/in.h>
#  include <arpa/inet.h>
#  include <signal.h>
#endif

// DBAL_TEST_TEMPLATE_DIR set by CMakeLists.txt at configure time.
#ifndef DBAL_TEST_TEMPLATE_DIR
#  define DBAL_TEST_TEMPLATE_DIR "dbal/templates/sql"
#endif

// TESTCONTAINERS_SIDECAR_BIN set by CMakeLists.txt via find_program().
#ifndef TESTCONTAINERS_SIDECAR_BIN
#  define TESTCONTAINERS_SIDECAR_BIN "testcontainers-sidecar"
#endif

namespace dbal_test {

// ─── Minimal URL parser ──────────────────────────────────────────────────────

struct ParsedUrl {
    std::string host;
    int         port = 0;
    std::string database;
    std::string user;
    std::string password;
};

inline ParsedUrl parseUrl(const std::string& url) {
    ParsedUrl p;
    std::string rem = url;

    auto scheme_end = rem.find("://");
    if (scheme_end != std::string::npos) rem = rem.substr(scheme_end + 3);

    auto at_pos = rem.find('@');
    if (at_pos != std::string::npos) {
        std::string cred = rem.substr(0, at_pos);
        rem = rem.substr(at_pos + 1);
        auto colon = cred.find(':');
        if (colon != std::string::npos) {
            p.user     = cred.substr(0, colon);
            p.password = cred.substr(colon + 1);
        } else {
            p.user = cred;
        }
    }

    auto slash = rem.find('/');
    if (slash != std::string::npos) {
        p.database = rem.substr(slash + 1);
        rem = rem.substr(0, slash);
    }

    auto colon = rem.find(':');
    if (colon != std::string::npos) {
        p.host = rem.substr(0, colon);
        try { p.port = std::stoi(rem.substr(colon + 1)); } catch (...) {}
    } else {
        p.host = rem;
    }

    auto q = p.database.find('?');
    if (q != std::string::npos) p.database = p.database.substr(0, q);

    return p;
}

// ─── TestItem entity JSON ────────────────────────────────────────────────────

static const char* TEST_ITEM_SCHEMA = R"({
  "entity": "TestItem",
  "fields": {
    "id":       {"type": "uuid",    "primary": true,  "required": true},
    "title":    {"type": "string",  "required": true},
    "language": {"type": "string",  "nullable": true},
    "score":    {"type": "integer", "nullable": true},
    "userId":   {"type": "string",  "nullable": true},
    "tenantId": {"type": "string",  "nullable": true},
    "createdAt":{"type": "bigint",  "nullable": true}
  },
  "indexes": [
    {"fields": ["tenantId", "language"]}
  ]
})";

// ─── Seed data ───────────────────────────────────────────────────────────────

struct SeedRow {
    const char* id;
    const char* title;
    const char* language;   // nullptr → JSON null
    int         score;
    const char* tenant;
};

static const SeedRow SEED_ROWS[] = {
    // tenantA — python (3 rows)
    {"a0000000-0000-0000-0000-000000000001", "py-alpha",   "python",     10,  "tenantA"},
    {"a0000000-0000-0000-0000-000000000002", "py-beta",    "python",     20,  "tenantA"},
    {"a0000000-0000-0000-0000-000000000003", "py-gamma",   "python",     30,  "tenantA"},
    // tenantA — typescript (2 rows)
    {"a0000000-0000-0000-0000-000000000004", "ts-alpha",   "typescript", 40,  "tenantA"},
    {"a0000000-0000-0000-0000-000000000005", "ts-beta",    "typescript", 50,  "tenantA"},
    // tenantA — null language (for IsNull tests)
    {"a0000000-0000-0000-0000-000000000006", "no-lang",    nullptr,      60,  "tenantA"},
    // tenantB — sql (must NOT appear in tenantA queries)
    {"b0000000-0000-0000-0000-000000000001", "sql-alpha",  "sql",        70,  "tenantB"},
    {"b0000000-0000-0000-0000-000000000002", "sql-beta",   "sql",        80,  "tenantB"},
};
static const size_t SEED_COUNT = sizeof(SEED_ROWS) / sizeof(SEED_ROWS[0]);
// tenantA: 6 rows; 5 non-null language; 3 python; 2 typescript

// ─── Sidecar container handle ────────────────────────────────────────────────

struct ContainerHandle {
    pid_t       pid        = -1;   // sidecar process pid (POSIX)
    int         host_port  = 0;    // mapped host port
    std::string container_id;
    bool        valid      = false;
    std::string error_msg;         // populated on failure (thread-safe, no GTest calls)
};

/**
 * Starts testcontainers-sidecar as a child process, reads the mapped host port
 * from its stdout, and returns a handle. Safe to call from background threads
 * (does NOT call ADD_FAILURE — errors go into handle.error_msg).
 *
 * @param image               Docker image, e.g. "postgres:16-alpine"
 * @param port                Container port to expose, e.g. 5432
 * @param env_vars            KEY=VALUE pairs
 * @param wait_log            Log line to wait for (empty = no log wait)
 * @param timeout_secs        Container startup timeout in seconds
 * @param wait_log_occurrence Number of times the log must appear (default 1)
 */
inline ContainerHandle startSidecar(
    const std::string&              image,
    int                             port,
    const std::vector<std::string>& env_vars,
    const std::string&              wait_log = "",
    int                             timeout_secs = 180,
    int                             wait_log_occurrence = 1)
{
    ContainerHandle h;

#ifndef _WIN32
    const std::string sidecar_bin = TESTCONTAINERS_SIDECAR_BIN;
    if (sidecar_bin.empty() || sidecar_bin == "TESTCONTAINERS_SIDECAR_BIN-NOTFOUND") {
        h.error_msg = "testcontainers-sidecar binary not found. "
                      "Run: ./deployment/build-testcontainers.sh";
        return h;
    }

    // Build argv for execvp
    std::vector<std::string> args_str = {
        sidecar_bin,
        "-image", image,
        "-port",  std::to_string(port),
        "-timeout", std::to_string(timeout_secs) + "s",
    };
    for (const auto& ev : env_vars) {
        args_str.push_back("-env");
        args_str.push_back(ev);
    }
    if (!wait_log.empty()) {
        args_str.push_back("-wait-log");
        args_str.push_back(wait_log);
        if (wait_log_occurrence > 1) {
            args_str.push_back("-wait-log-occurrence");
            args_str.push_back(std::to_string(wait_log_occurrence));
        }
    }

    std::vector<const char*> argv;
    argv.reserve(args_str.size() + 1);
    for (const auto& s : args_str) argv.push_back(s.c_str());
    argv.push_back(nullptr);

    // Create pipe: parent reads sidecar stdout
    int pipefd[2];
    if (pipe(pipefd) != 0) {
        h.error_msg = std::string("pipe() failed: ") + strerror(errno);
        return h;
    }

    pid_t pid = fork();
    if (pid < 0) {
        h.error_msg = std::string("fork() failed: ") + strerror(errno);
        close(pipefd[0]); close(pipefd[1]);
        return h;
    }

    if (pid == 0) {
        // Child: redirect stdout to pipe write end
        close(pipefd[0]);
        dup2(pipefd[1], STDOUT_FILENO);
        close(pipefd[1]);
        execvp(argv[0], const_cast<char* const*>(argv.data()));
        _exit(127);
    }

    // Parent: close write end, read JSON from read end with hard deadline.
    close(pipefd[1]);

    const int read_deadline_secs = timeout_secs + 30;
    std::string json_line;
    char ch;
    bool timed_out = false;
    {
        time_t start = time(nullptr);
        while (true) {
            fd_set rfds;
            FD_ZERO(&rfds);
            FD_SET(pipefd[0], &rfds);
            time_t elapsed = time(nullptr) - start;
            long remaining = read_deadline_secs - static_cast<long>(elapsed);
            if (remaining <= 0) { timed_out = true; break; }
            struct timeval tv{ remaining, 0 };
            int ready = select(pipefd[0] + 1, &rfds, nullptr, nullptr, &tv);
            if (ready <= 0) { timed_out = (ready == 0); break; }
            if (read(pipefd[0], &ch, 1) != 1) break;
            if (ch == '\n') break;
            json_line += ch;
        }
    }
    close(pipefd[0]);

    if (timed_out) {
        h.error_msg = "Timed out after " + std::to_string(read_deadline_secs)
                      + "s waiting for " + image
                      + " container. Check Docker and image availability.";
        kill(pid, SIGKILL);
        waitpid(pid, nullptr, 0);
        return h;
    }

    if (json_line.empty()) {
        h.error_msg = "testcontainers-sidecar produced no output for " + image
                      + " (startup failed? Check Docker).";
        waitpid(pid, nullptr, 0);
        return h;
    }

    try {
        auto j = nlohmann::json::parse(json_line);
        if (j.value("status", "") != "ready") {
            h.error_msg = "sidecar not ready for " + image + ": " + json_line;
            kill(pid, SIGTERM);
            waitpid(pid, nullptr, 0);
            return h;
        }
        h.host_port    = j.at("host_port").get<int>();
        h.container_id = j.value("container_id", "");
        h.pid          = pid;
        h.valid        = true;
    } catch (const std::exception& ex) {
        h.error_msg = "failed to parse sidecar JSON '" + json_line + "': " + ex.what();
        kill(pid, SIGTERM);
        waitpid(pid, nullptr, 0);
    }
#else
    h.error_msg = "testcontainers-sidecar not supported on Windows without POSIX layer";
#endif
    return h;
}

/**
 * Waits until a server on 127.0.0.1:port is truly accepting connections.
 *
 * @param port         TCP port to probe
 * @param read_probe   If true, also reads 1 byte after connecting.
 *                     Use for MySQL (sends a greeting first); skip for PostgreSQL
 *                     (which waits for the client to speak first).
 * @param timeout_secs Maximum seconds to wait
 * @return true if the port is ready within the deadline
 */
inline bool waitForTcpPort(int port, bool read_probe = false, int timeout_secs = 30) {
#ifndef _WIN32
    const time_t deadline = time(nullptr) + timeout_secs;
    while (time(nullptr) < deadline) {
        int sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock < 0) return false;

        struct sockaddr_in addr{};
        addr.sin_family      = AF_INET;
        addr.sin_port        = htons(static_cast<uint16_t>(port));
        addr.sin_addr.s_addr = inet_addr("127.0.0.1");

        if (connect(sock, reinterpret_cast<struct sockaddr*>(&addr), sizeof(addr)) == 0) {
            if (!read_probe) {
                close(sock);
                return true;
            }
            // For MySQL: wait for the server greeting (MySQL sends first)
            struct timeval tv{ 2, 0 };
            setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO,
                       reinterpret_cast<const void*>(&tv), sizeof(tv));
            char buf[1];
            ssize_t n = recv(sock, buf, 1, 0);
            close(sock);
            if (n > 0) return true;   // Server sent data → fully ready
        } else {
            close(sock);
        }

        struct timespec ts{ 0, 500'000'000 };   // 500ms between retries
        nanosleep(&ts, nullptr);
    }
    return false;
#else
    return true;
#endif
}

/**
 * Terminate the sidecar process (and thus the Docker container).
 * Sends SIGTERM first, waits up to 5 s, then SIGKILL if it's still running.
 */
inline void stopSidecar(ContainerHandle& h) {
#ifndef _WIN32
    if (h.pid > 0) {
        kill(h.pid, SIGTERM);

        // Wait up to 5s for graceful exit
        const int grace_ms = 5000;
        const int poll_ms  = 100;
        for (int waited = 0; waited < grace_ms; waited += poll_ms) {
            struct timespec ts{ 0, poll_ms * 1'000'000L };
            nanosleep(&ts, nullptr);
            int status;
            if (waitpid(h.pid, &status, WNOHANG) > 0) {
                h.pid   = -1;
                h.valid = false;
                return;
            }
        }

        // Grace period expired — force-kill
        kill(h.pid, SIGKILL);
        waitpid(h.pid, nullptr, 0);
        h.pid   = -1;
        h.valid = false;
    }
#endif
}

// ─── Global containers (populated by ContainerEnvironment before any tests) ──

struct GlobalContainers {
    ContainerHandle postgres;
    ContainerHandle mysql;
};

// Inline (C++17) — single definition shared across all TUs
inline GlobalContainers g_containers;

// ─── Signal handler: clean up containers on Ctrl+C / SIGTERM ─────────────────

#ifndef _WIN32
inline void containerSignalHandler(int sig) {
    // Best-effort cleanup (signal handler — keep it minimal)
    if (g_containers.postgres.pid > 0) kill(g_containers.postgres.pid, SIGKILL);
    if (g_containers.mysql.pid    > 0) kill(g_containers.mysql.pid,    SIGKILL);
    // Re-raise to allow default handler to run (produces correct exit code)
    signal(sig, SIG_DFL);
    raise(sig);
}
#endif

/**
 * GTest global environment: starts PostgreSQL and MySQL containers in PARALLEL
 * before any test suite runs, and tears them down after all suites complete.
 *
 * Register once in test_main.cpp:
 *   ::testing::AddGlobalTestEnvironment(new ContainerEnvironment());
 *
 * Total startup time = max(PG_time, MySQL_time) instead of PG_time + MySQL_time.
 * A progress thread prints elapsed time so the terminal isn't silent for 3 minutes.
 */
class ContainerEnvironment : public ::testing::Environment {
public:
    void SetUp() override {
#ifndef _WIN32
        // Install signal handlers so containers are killed on Ctrl+C / SIGTERM
        signal(SIGINT,  containerSignalHandler);
        signal(SIGTERM, containerSignalHandler);
#endif

        std::fprintf(stderr,
            "[ContainerEnvironment] Starting PG + MySQL containers in parallel "
            "(may take up to 3 min on cold pull)...\n");

        // ── Container startup threads ──────────────────────────────────────
        std::atomic<bool> done{false};

        std::thread pg_thread([&done] {
            g_containers.postgres = startSidecar(
                "postgres:16-alpine",
                5432,
                {
                    "POSTGRES_PASSWORD=testpass",
                    "POSTGRES_USER=testuser",
                    "POSTGRES_DB=dbal_test",
                },
                "database system is ready to accept connections",
                180,
                2   // postgres:16-alpine logs ready twice (init + real start)
            );
            if (g_containers.postgres.valid)
                std::fprintf(stderr, "[ContainerEnvironment] PG ready on port %d\n",
                             g_containers.postgres.host_port);
            else
                std::fprintf(stderr, "[ContainerEnvironment] PG FAILED: %s\n",
                             g_containers.postgres.error_msg.c_str());
        });

        std::thread mysql_thread([&done] {
            g_containers.mysql = startSidecar(
                "mysql:8-oracle",
                3306,
                {
                    "MYSQL_ROOT_PASSWORD=testpass",
                    "MYSQL_DATABASE=dbal_test",
                    "MYSQL_USER=testuser",
                    "MYSQL_PASSWORD=testpass",
                },
                "ready for connections",
                180,
                2   // mysql:8 restarts after init; wait for 2nd ready signal
            );
            if (g_containers.mysql.valid)
                std::fprintf(stderr, "[ContainerEnvironment] MySQL ready on port %d\n",
                             g_containers.mysql.host_port);
            else
                std::fprintf(stderr, "[ContainerEnvironment] MySQL FAILED: %s\n",
                             g_containers.mysql.error_msg.c_str());
        });

        // ── Progress monitor: print elapsed time every 5 s ─────────────────
        std::thread progress_thread([&done] {
            const time_t start = time(nullptr);
            while (!done.load()) {
                struct timespec ts{ 5, 0 };
                nanosleep(&ts, nullptr);
                if (!done.load()) {
                    int elapsed = static_cast<int>(time(nullptr) - start);
                    std::fprintf(stderr,
                        "[ContainerEnvironment] Waiting for containers... %ds elapsed\n",
                        elapsed);
                    std::fflush(stderr);
                }
            }
        });

        pg_thread.join();
        mysql_thread.join();
        done.store(true);
        progress_thread.join();

        // ── TCP readiness probes (after log-based wait) ────────────────────
        // PG: plain TCP connect is sufficient (PG speaks only after client sends)
        if (g_containers.postgres.valid) {
            std::fprintf(stderr, "[ContainerEnvironment] Probing PG TCP port %d...\n",
                         g_containers.postgres.host_port);
            if (!waitForTcpPort(g_containers.postgres.host_port, false, 30)) {
                g_containers.postgres.valid     = false;
                g_containers.postgres.error_msg = "TCP probe timed out on port "
                    + std::to_string(g_containers.postgres.host_port);
            }
        }
        // MySQL: read probe — MySQL sends a greeting before the client speaks
        if (g_containers.mysql.valid) {
            std::fprintf(stderr, "[ContainerEnvironment] Probing MySQL TCP port %d...\n",
                         g_containers.mysql.host_port);
            if (!waitForTcpPort(g_containers.mysql.host_port, true, 30)) {
                g_containers.mysql.valid     = false;
                g_containers.mysql.error_msg = "TCP read probe timed out on port "
                    + std::to_string(g_containers.mysql.host_port);
            }
        }

        // ── Report failures in the main GTest thread ───────────────────────
        if (!g_containers.postgres.valid)
            ADD_FAILURE() << "PostgreSQL container failed: "
                          << g_containers.postgres.error_msg;
        if (!g_containers.mysql.valid)
            ADD_FAILURE() << "MySQL container failed: "
                          << g_containers.mysql.error_msg;
    }

    void TearDown() override {
        std::fprintf(stderr, "[ContainerEnvironment] Stopping containers...\n");
        stopSidecar(g_containers.postgres);
        stopSidecar(g_containers.mysql);
        std::fprintf(stderr, "[ContainerEnvironment] Containers stopped.\n");
#ifndef _WIN32
        // Restore default signal handlers
        signal(SIGINT,  SIG_DFL);
        signal(SIGTERM, SIG_DFL);
#endif
    }
};

// ─── Base fixture ────────────────────────────────────────────────────────────

/**
 * Base fixture. Subclasses set adapter_url_ in their own SetUp() BEFORE
 * calling IntegrationFixture::SetUp(). For SQLite use adapter_url_ = ":memory:".
 */
class IntegrationFixture : public ::testing::Test {
public:
    std::unique_ptr<dbal::adapters::Adapter> adapter;

protected:
    std::string           adapter_url_ = ":memory:";
    std::filesystem::path schema_dir_;
    std::string           saved_schema_dir_;
    std::string           saved_template_dir_;

    void SetUp() override {
        // 1. Create temp schema dir and write TestItem.json
        schema_dir_ = std::filesystem::temp_directory_path() / "dbal_integration_test";
        std::filesystem::create_directories(schema_dir_);
        {
            std::ofstream f(schema_dir_ / "TestItem.json");
            f << TEST_ITEM_SCHEMA;
        }

        // 2. Save + set env vars
        const char* s = std::getenv("DBAL_SCHEMA_DIR");
        saved_schema_dir_ = s ? s : "";
        const char* t = std::getenv("DBAL_TEMPLATE_DIR");
        saved_template_dir_ = t ? t : "";

        setenv("DBAL_SCHEMA_DIR",   schema_dir_.string().c_str(), 1);
        setenv("DBAL_TEMPLATE_DIR", DBAL_TEST_TEMPLATE_DIR,       1);

        // 3. Construct adapter
        adapter = createAdapter();
        ASSERT_NE(adapter, nullptr) << "Failed to create adapter";

        // 4. Seed test data
        seedData();
    }

    void TearDown() override {
        if (adapter) {
            dropTestTable();
            adapter->close();
            adapter.reset();
        }

        std::filesystem::remove_all(schema_dir_);

        if (!saved_schema_dir_.empty())
            setenv("DBAL_SCHEMA_DIR",   saved_schema_dir_.c_str(),   1);
        else
            unsetenv("DBAL_SCHEMA_DIR");

        if (!saved_template_dir_.empty())
            setenv("DBAL_TEMPLATE_DIR", saved_template_dir_.c_str(), 1);
        else
            unsetenv("DBAL_TEMPLATE_DIR");
    }

    virtual std::unique_ptr<dbal::adapters::Adapter> createAdapter() {
        using namespace dbal::adapters::sqlite;
        return std::make_unique<SQLiteAdapter>(adapter_url_);
    }

    virtual void dropTestTable() {}

private:
    void seedData() {
        for (size_t i = 0; i < SEED_COUNT; ++i) {
            const auto& row = SEED_ROWS[i];
            nlohmann::json data;
            data["id"]       = row.id;
            data["title"]    = row.title;
            data["language"] = row.language
                ? nlohmann::json(row.language)
                : nlohmann::json(nullptr);
            data["score"]    = row.score;
            data["userId"]   = "user-test";
            data["tenantId"] = row.tenant;
            data["createdAt"]= static_cast<int64_t>(1700000000 + i * 1000);

            auto result = adapter->create("TestItem", data);
            ASSERT_TRUE(result.isOk())
                << "Seed insert failed for row " << i << ": " << result.error().what();
        }
    }
};

} // namespace dbal_test
