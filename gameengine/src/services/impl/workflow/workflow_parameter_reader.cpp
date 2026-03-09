#include "services/interfaces/workflow/workflow_parameter_reader.hpp"

#include <stdexcept>
#include <utility>
#include <vector>

namespace sdl3cpp::services::impl {

WorkflowParameterReader::WorkflowParameterReader(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {
    if (logger_) {
        logger_->Trace("WorkflowParameterReader", "Constructor", "Entry");
    }
}

std::string WorkflowParameterReader::ReadRequiredString(const rapidjson::Value& object, const char* name) const {
    if (logger_) {
        logger_->Trace("WorkflowParameterReader", "ReadRequiredString", "Entry");
    }
    if (!object.HasMember(name) || !object[name].IsString()) {
        throw std::runtime_error("Workflow member '" + std::string(name) + "' must be a string");
    }
    return object[name].GetString();
}

std::unordered_map<std::string, std::string> WorkflowParameterReader::ReadStringMap(
    const rapidjson::Value& object,
    const char* name) const {
    if (logger_) {
        logger_->Trace("WorkflowParameterReader", "ReadStringMap", "Entry");
    }

    std::unordered_map<std::string, std::string> result;
    if (!object.HasMember(name)) {
        return result;
    }
    const auto& mapValue = object[name];
    if (!mapValue.IsObject()) {
        throw std::runtime_error("Workflow member '" + std::string(name) + "' must be an object");
    }
    for (auto it = mapValue.MemberBegin(); it != mapValue.MemberEnd(); ++it) {
        if (!it->value.IsString()) {
            throw std::runtime_error("Workflow map '" + std::string(name) + "' must map to strings");
        }
        result[it->name.GetString()] = it->value.GetString();
    }
    return result;
}

std::unordered_map<std::string, WorkflowParameterValue> WorkflowParameterReader::ReadParameterMap(
    const rapidjson::Value& object,
    const char* name) const {
    if (logger_) {
        logger_->Trace("WorkflowParameterReader", "ReadParameterMap", "Entry");
    }

    std::unordered_map<std::string, WorkflowParameterValue> result;
    if (!object.HasMember(name)) {
        return result;
    }
    const auto& mapValue = object[name];
    if (!mapValue.IsObject()) {
        throw std::runtime_error("Workflow member '" + std::string(name) + "' must be an object");
    }

    for (auto it = mapValue.MemberBegin(); it != mapValue.MemberEnd(); ++it) {
        const std::string key = it->name.GetString();
        const auto& value = it->value;

        // Skip nested 'inputs' and 'outputs' objects - extracted separately by parser
        if ((key == "inputs" || key == "outputs") && value.IsObject()) {
            continue;
        }

        if (value.IsString()) {
            result.emplace(key, WorkflowParameterValue::FromString(value.GetString()));
            continue;
        }
        if (value.IsBool()) {
            result.emplace(key, WorkflowParameterValue::FromBool(value.GetBool()));
            continue;
        }
        if (value.IsNumber()) {
            result.emplace(key, WorkflowParameterValue::FromNumber(value.GetDouble()));
            continue;
        }
        if (value.IsArray()) {
            std::vector<std::string> stringItems;
            std::vector<double> numberItems;
            for (rapidjson::SizeType i = 0; i < value.Size(); ++i) {
                const auto& entry = value[i];
                if (entry.IsString()) {
                    stringItems.emplace_back(entry.GetString());
                } else if (entry.IsNumber()) {
                    numberItems.emplace_back(entry.GetDouble());
                } else {
                    throw std::runtime_error("Workflow parameter '" + key + "' array must contain strings or numbers");
                }
            }
            if (!stringItems.empty() && !numberItems.empty()) {
                throw std::runtime_error("Workflow parameter '" + key + "' cannot mix string and number values");
            }
            if (!stringItems.empty() || value.Empty()) {
                result.emplace(key, WorkflowParameterValue::FromStringList(std::move(stringItems)));
            } else {
                result.emplace(key, WorkflowParameterValue::FromNumberList(std::move(numberItems)));
            }
            continue;
        }
        throw std::runtime_error("Workflow parameter '" + key + "' must be a string, number, bool, or array");
    }
    return result;
}

std::string WorkflowParameterReader::ReadNodeId(const rapidjson::Value& node, size_t index) const {
    if (logger_) {
        logger_->Trace("WorkflowParameterReader", "ReadNodeId", "Entry");
    }
    if (node.HasMember("id") && node["id"].IsString()) {
        return node["id"].GetString();
    }
    if (node.HasMember("name") && node["name"].IsString()) {
        return node["name"].GetString();
    }
    throw std::runtime_error("Workflow node[" + std::to_string(index) + "] requires string id or name");
}

std::string WorkflowParameterReader::ReadNodePlugin(const rapidjson::Value& node, const std::string& nodeId) const {
    if (logger_) {
        logger_->Trace("WorkflowParameterReader", "ReadNodePlugin", "Entry");
    }
    if (node.HasMember("plugin") && node["plugin"].IsString()) {
        return node["plugin"].GetString();
    }
    if (node.HasMember("type") && node["type"].IsString()) {
        return node["type"].GetString();
    }
    throw std::runtime_error("Workflow node '" + nodeId + "' requires string plugin or type");
}

}  // namespace sdl3cpp::services::impl
