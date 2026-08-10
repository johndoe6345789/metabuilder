/**
 * @file seed_loader_action.cpp
 * @brief Seed data loader implementation
 */

#include "seed_loader_action.hpp"

#include <chrono>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

#include "../../security/crypto/sha256.hpp"

namespace fs = std::filesystem;

namespace dbal {
namespace daemon {
namespace actions {

namespace {

int64_t nowMs() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()
    ).count();
}

// nlohmann::json's default object_t is a std::map, so dump() serializes
// object keys in sorted order regardless of source insertion order — that
// makes this a stable fingerprint of the seed record's content.
std::string fingerprintOf(const nlohmann::json& record) {
    return dbal::security::sha256_hex(record.dump());
}

// Bootstrap reconciliation (see loadSeedFile) must tell "the seed file
// changed since we last applied it" (should propagate to the DB) apart from
// "an operator changed the live row through a real write path since then,
// e.g. POST /admin/credentials" (must NOT be clobbered on the next plain
// restart). SeedFingerprint remembers the seed content we last applied per
// bootstrap record so that distinction survives restarts. A record with no
// stored fingerprint yet (upgrading a pre-existing deployment) is treated
// as needing reconciliation once, then tracked from that point on.
bool bootstrapNeedsReconcile(Client& client, const std::string& entity_name,
                              const std::string& record_id, const std::string& current_fingerprint) {
    auto existing = client.getEntity("SeedFingerprint", entity_name + ":" + record_id);
    if (!existing.isOk()) return true;
    return existing.value().value("fingerprint", std::string()) != current_fingerprint;
}

void recordBootstrapFingerprint(Client& client, const std::string& entity_name,
                                 const std::string& record_id, const std::string& fingerprint) {
    std::string tracking_id = entity_name + ":" + record_id;
    nlohmann::json tracking_record = {
        {"id", tracking_id},
        {"entity", entity_name},
        {"recordId", record_id},
        {"fingerprint", fingerprint},
        {"appliedAt", nowMs()},
    };

    auto create_result = client.createEntity("SeedFingerprint", tracking_record);
    if (create_result.isOk()) return;
    if (create_result.error().code() != ErrorCode::Conflict) {
        spdlog::warn("Seed: failed to record fingerprint for {} id={}: {}",
                     entity_name, record_id, create_result.error().what());
        return;
    }
    auto update_result = client.updateEntity("SeedFingerprint", tracking_id, nlohmann::json{
        {"fingerprint", fingerprint},
        {"appliedAt", nowMs()},
    });
    if (!update_result.isOk()) {
        spdlog::warn("Seed: failed to update fingerprint for {} id={}: {}",
                     entity_name, record_id, update_result.error().what());
    }
}

} // namespace

std::string SeedLoaderAction::getDefaultSeedDir() {
    const char* env = std::getenv("DBAL_SEED_DIR");
    if (env) return env;

    std::vector<std::string> candidates = {
        "dbal/shared/seeds/database",
        "../shared/seeds/database",
        "/app/dbal/shared/seeds/database",
        "/app/seeds/database",
    };
    for (const auto& path : candidates) {
        if (fs::exists(path) && fs::is_directory(path)) return path;
    }
    return "dbal/shared/seeds/database";
}

std::vector<std::string> SeedLoaderAction::getSeedLoadOrder() {
    return {
        "users.json",
        "credentials.json",
        "test_logins.json",
        "workspaces.json",
        "installed_packages.json",
        "projects.json",
        "workflows.json",
        "products.json",
        "games.json",
        "artists.json",
        "videos.json",
        "forum.json",
        "notifications.json",
        "audit_logs.json",
    };
}

void SeedLoaderAction::applyCurrentTimestamps(nlohmann::json& record, const std::string& timestamp_field) {
    if (timestamp_field.empty()) return;

    auto now_ms = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()
    ).count();

    if (record.contains(timestamp_field) && record[timestamp_field].is_number() && record[timestamp_field] == 0)
        record[timestamp_field] = now_ms;

    static const std::vector<std::string> common_ts_fields = {
        "createdAt", "updatedAt", "publishedAt", "installedAt", "timestamp", "lastSyncAt"
    };
    for (const auto& field : common_ts_fields) {
        if (record.contains(field) && record[field].is_number() && record[field] == 0)
            record[field] = now_ms;
    }
}

std::vector<SeedResult> SeedLoaderAction::loadSeedFile(Client& client, const std::string& file_path, bool force) {
    std::vector<SeedResult> results;
    try {
        std::ifstream f(file_path);
        if (!f.is_open()) throw std::runtime_error("Cannot open file: " + file_path);
        nlohmann::json root = nlohmann::json::parse(f);

        // Support both single-document JSON objects and arrays of documents
        nlohmann::json documents;
        if (root.is_array()) documents = root;
        else if (root.is_object()) documents = nlohmann::json::array({root});
        else return results;

        for (const auto& doc : documents) {
            if (!doc.is_object()) continue;

            SeedResult result;
            std::string entity_name;
            if (doc.contains("entity"))      entity_name = doc["entity"].get<std::string>();
            else if (doc.contains("displayName")) entity_name = doc["displayName"].get<std::string>();
            else if (doc.contains("name"))   entity_name = doc["name"].get<std::string>();
            else continue;
            result.entity = entity_name;

            bool skip_if_exists = false;
            bool bootstrap = false;
            bool use_current_timestamp = false;
            std::string timestamp_field;

            if (doc.contains("metadata")) {
                const auto& meta = doc["metadata"];
                skip_if_exists        = meta.value("skipIfExists",        false);
                bootstrap              = meta.value("bootstrap",          false);
                use_current_timestamp = meta.value("useCurrentTimestamp", false);
                timestamp_field       = meta.value("timestampField",      std::string(""));
            }

            // Bootstrap records (fixed system fixtures like the demo Credential/User
            // rows — not organic content a user could have edited) always reconcile to
            // match the seed file, even once they already exist: skipIfExists only
            // short-circuits the *whole document* here for non-bootstrap seeds, so a
            // record whose format goes stale (e.g. a password hashing algorithm
            // migration) doesn't stay silently wrong forever. Per-record conflicts are
            // still handled below via updateEntity instead of being skipped.
            if (skip_if_exists && !force && !bootstrap) {
                ListOptions opts;
                opts.limit = 1;
                auto existing = client.listEntities(entity_name, opts);
                if (existing.isOk() && !existing.value().items.empty()) {
                    spdlog::info("Seed: skipping {} (records already exist)", entity_name);
                    result.skipped = doc.contains("records") ? static_cast<int>(doc["records"].size()) : 0;
                    results.push_back(result);
                    continue;
                }
            }

            if (!doc.contains("records") || !doc["records"].is_array()) {
                spdlog::warn("Seed: no records array in {} document of {}", entity_name, file_path);
                results.push_back(result);
                continue;
            }

            for (const auto& record_node : doc["records"]) {
                try {
                    nlohmann::json record = record_node;
                    if (use_current_timestamp) applyCurrentTimestamps(record, timestamp_field);

                    auto create_result = client.createEntity(entity_name, record);
                    if (create_result.isOk()) {
                        result.inserted++;
                        if (bootstrap && record.contains("id") && record["id"].is_string()) {
                            recordBootstrapFingerprint(client, entity_name, record["id"].get<std::string>(),
                                                        fingerprintOf(record));
                        }
                    } else if (create_result.error().code() == ErrorCode::Conflict) {
                        std::string id_str = record.contains("id") ? record["id"].dump() : "unknown";
                        bool bootstrap_record = bootstrap && record.contains("id") && record["id"].is_string();
                        std::string record_id = bootstrap_record ? record["id"].get<std::string>() : std::string();
                        std::string current_fingerprint = bootstrap_record ? fingerprintOf(record) : std::string();

                        if (bootstrap_record && bootstrapNeedsReconcile(client, entity_name, record_id, current_fingerprint)) {
                            // The seed file's content for this bootstrap record changed since
                            // we last applied it (or this is the first run tracking it at all)
                            // — reconcile the DB to match. If the DB instead drifted because an
                            // operator wrote to it directly (e.g. POST /admin/credentials) while
                            // the seed file stayed the same, bootstrapNeedsReconcile returns false
                            // and that write is left alone.
                            auto update_result = client.updateEntity(entity_name, record_id, record);
                            if (update_result.isOk()) {
                                result.updated++;
                                recordBootstrapFingerprint(client, entity_name, record_id, current_fingerprint);
                                spdlog::debug("Seed: {} id={} already exists, reconciled to seed", entity_name, id_str);
                            } else {
                                result.failed++;
                                std::string err = "Failed to reconcile bootstrap " + entity_name + " id=" + id_str +
                                                  ": " + std::string(update_result.error().what());
                                result.errors.push_back(err);
                                spdlog::warn("Seed: {}", err);
                            }
                        } else {
                            // Record already exists (duplicate primary key) — idempotent, skip silently.
                            // For bootstrap records, this also covers "the DB already matches what
                            // we last applied, or has been intentionally changed since — don't touch it".
                            result.skipped++;
                            spdlog::debug("Seed: {} id={} already exists, skipping", entity_name, id_str);
                        }
                    } else {
                        result.failed++;
                        std::string id_str = record.contains("id") ? record["id"].dump() : "unknown";
                        std::string err = "Failed to create " + entity_name + " id=" + id_str +
                                          ": " + std::string(create_result.error().what());
                        result.errors.push_back(err);
                        spdlog::warn("Seed: {}", err);
                    }
                } catch (const std::exception& e) {
                    result.failed++;
                    result.errors.push_back(std::string("Exception processing record: ") + e.what());
                    spdlog::warn("Seed: exception in {}: {}", entity_name, e.what());
                }
            }

            spdlog::info("Seed: {} — inserted={}, updated={}, skipped={}, failed={}",
                         entity_name, result.inserted, result.updated, result.skipped, result.failed);
            results.push_back(result);
        }

    } catch (const nlohmann::json::parse_error& e) {
        SeedResult err_result;
        err_result.entity = fs::path(file_path).filename().string();
        err_result.errors.push_back(std::string("JSON parse error: ") + e.what());
        err_result.failed = 1;
        results.push_back(err_result);
        spdlog::error("Seed: JSON error in {}: {}", file_path, e.what());
    } catch (const std::exception& e) {
        SeedResult err_result;
        err_result.entity = fs::path(file_path).filename().string();
        err_result.errors.push_back(std::string("Error: ") + e.what());
        err_result.failed = 1;
        results.push_back(err_result);
        spdlog::error("Seed: error loading {}: {}", file_path, e.what());
    }
    return results;
}

SeedSummary SeedLoaderAction::loadSeeds(Client& client, const std::string& seed_dir, bool force) {
    SeedSummary summary;

    if (!fs::exists(seed_dir)) {
        summary.success = false;
        summary.errors.push_back("Seed directory not found: " + seed_dir);
        spdlog::error("Seed: directory not found: {}", seed_dir);
        return summary;
    }

    spdlog::info("Seed: loading from {}{}", seed_dir, force ? " (force mode)" : "");

    auto load_order = getSeedLoadOrder();
    std::set<std::string> loaded_files;

    for (const auto& filename : load_order) {
        fs::path file_path = fs::path(seed_dir) / filename;
        if (!fs::exists(file_path)) { spdlog::debug("Seed: skipping {} (not found)", filename); continue; }
        loaded_files.insert(filename);
        auto file_results = loadSeedFile(client, file_path.string(), force);
        for (auto& r : file_results) {
            summary.total_inserted += r.inserted;
            summary.total_updated  += r.updated;
            summary.total_skipped  += r.skipped;
            summary.total_failed   += r.failed;
            if (!r.errors.empty()) { summary.success = false; for (const auto& e : r.errors) summary.errors.push_back(e); }
            summary.results.push_back(std::move(r));
        }
    }

    for (const auto& entry : fs::directory_iterator(seed_dir)) {
        if (!entry.is_regular_file() || entry.path().extension() != ".json") continue;
        std::string filename = entry.path().filename().string();
        if (loaded_files.count(filename)) continue;
        if (filename == "package_permissions.json" || filename == "smtp_credentials.json") continue;
        loaded_files.insert(filename);
        auto file_results = loadSeedFile(client, entry.path().string(), force);
        for (auto& r : file_results) {
            summary.total_inserted += r.inserted;
            summary.total_updated  += r.updated;
            summary.total_skipped  += r.skipped;
            summary.total_failed   += r.failed;
            if (!r.errors.empty()) { for (const auto& e : r.errors) summary.errors.push_back(e); }
            summary.results.push_back(std::move(r));
        }
    }

    summary.success = (summary.total_failed == 0);
    spdlog::info("Seed: complete — inserted={}, updated={}, skipped={}, failed={}",
                 summary.total_inserted, summary.total_updated, summary.total_skipped, summary.total_failed);
    return summary;
}

} // namespace actions
} // namespace daemon
} // namespace dbal
