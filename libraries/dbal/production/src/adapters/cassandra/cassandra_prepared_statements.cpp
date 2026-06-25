#include "cassandra_prepared_statements.hpp"
#include <memory>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace cassandra {

namespace {
    struct CassFutureDeleter {
        void operator()(CassFuture* f) const { if (f) cass_future_free(f); }
    };
    using UniqueCassFuture = std::unique_ptr<CassFuture, CassFutureDeleter>;
} // anonymous namespace

CassandraPreparedStatements::CassandraPreparedStatements(CassSession* session)
    : session_(session) {
}

CassandraPreparedStatements::~CassandraPreparedStatements() {
    clear();
}

const CassPrepared* CassandraPreparedStatements::getPrepared(const std::string& cql) {
    std::lock_guard<std::mutex> lock(cache_mutex_);

    // Check cache first
    auto it = cache_.find(cql);
    if (it != cache_.end()) {
        spdlog::debug("CassandraPreparedStatements: Cache hit for CQL: {}", cql.substr(0, 50));
        return it->second;
    }

    // Not in cache - prepare it
    const CassPrepared* prepared = prepareStatement(cql);
    if (prepared != nullptr) {
        cache_[cql] = prepared;
        spdlog::debug("CassandraPreparedStatements: Cached new prepared statement (total: {})", cache_.size());
    }

    return prepared;
}

const CassPrepared* CassandraPreparedStatements::prepareStatement(const std::string& cql) {
    if (session_ == nullptr) {
        spdlog::error("CassandraPreparedStatements: Cannot prepare statement - session is null");
        return nullptr;
    }

    spdlog::debug("CassandraPreparedStatements: Preparing CQL: {}", cql.substr(0, 100));

    UniqueCassFuture prepare_future(cass_session_prepare(session_, cql.c_str()));
    CassError rc = cass_future_error_code(prepare_future.get());

    const CassPrepared* prepared = nullptr;
    if (rc == CASS_OK) {
        prepared = cass_future_get_prepared(prepare_future.get());
        spdlog::debug("CassandraPreparedStatements: Successfully prepared statement");
    } else {
        spdlog::error("CassandraPreparedStatements: Failed to prepare statement: {}", cass_error_desc(rc));
    }

    return prepared;
}

void CassandraPreparedStatements::clear() {
    std::lock_guard<std::mutex> lock(cache_mutex_);
    spdlog::debug("CassandraPreparedStatements: Clearing {} cached statements", cache_.size());

    for (auto& [key, prepared] : cache_) {
        if (prepared != nullptr) {
            cass_prepared_free(prepared);
        }
    }

    cache_.clear();
}

size_t CassandraPreparedStatements::getCacheSize() const {
    std::lock_guard<std::mutex> lock(cache_mutex_);
    return cache_.size();
}

} // namespace cassandra
} // namespace adapters
} // namespace dbal
