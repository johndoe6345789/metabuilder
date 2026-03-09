#include "schema_loader_action.hpp"

#include <filesystem>
#include <fstream>

namespace fs = std::filesystem;

namespace dbal {
namespace daemon {
namespace actions {

::Json::Value SchemaLoaderAction::load_registry(const std::string& path) {
    ::Json::Value registry;

    if (!fs::exists(path)) {
        registry["version"] = "1.0.0";
        registry["packages"] = ::Json::Value(::Json::objectValue);
        registry["migrationQueue"] = ::Json::Value(::Json::arrayValue);
        return registry;
    }

    std::ifstream file(path);
    if (!file.is_open()) {
        registry["version"] = "1.0.0";
        registry["packages"] = ::Json::Value(::Json::objectValue);
        registry["migrationQueue"] = ::Json::Value(::Json::arrayValue);
        return registry;
    }

    ::Json::CharReaderBuilder reader;
    JSONCPP_STRING errs;
    if (!::Json::parseFromStream(reader, file, &registry, &errs)) {
        registry["version"] = "1.0.0";
        registry["packages"] = ::Json::Value(::Json::objectValue);
        registry["migrationQueue"] = ::Json::Value(::Json::arrayValue);
    }

    return registry;
}

bool SchemaLoaderAction::save_registry(const ::Json::Value& registry, const std::string& path) {
    std::ofstream file(path);
    if (!file.is_open()) {
        return false;
    }

    ::Json::StreamWriterBuilder writer;
    writer["indentation"] = "  ";
    std::unique_ptr<::Json::StreamWriter> stream_writer(writer.newStreamWriter());
    stream_writer->write(registry, &file);
    return true;
}

::Json::Value SchemaLoaderAction::get_pending_migrations(const ::Json::Value& registry) {
    ::Json::Value pending(::Json::arrayValue);

    const auto& queue = registry["migrationQueue"];
    for (const auto& migration : queue) {
        if (migration["status"].asString() == "pending") {
            pending.append(migration);
        }
    }

    return pending;
}

::Json::Value SchemaLoaderAction::get_approved_migrations(const ::Json::Value& registry) {
    ::Json::Value approved(::Json::arrayValue);

    const auto& queue = registry["migrationQueue"];
    for (const auto& migration : queue) {
        if (migration["status"].asString() == "approved") {
            approved.append(migration);
        }
    }

    return approved;
}

} // namespace actions
} // namespace daemon
} // namespace dbal
