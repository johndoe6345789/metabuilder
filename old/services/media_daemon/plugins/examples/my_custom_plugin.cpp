#include "media/plugin.hpp"
#include <iostream>
#include <fstream>
#include <sstream>
#include <array>
#include <memory>
#include <cstdio>

namespace media {
namespace plugins {

/**
 * Example Custom Plugin
 * 
 * This demonstrates how to create a custom plugin for the media daemon.
 * Plugins are loaded dynamically at runtime from shared libraries.
 * 
 * Build with:
 *   g++ -shared -fPIC -o my_custom_plugin.so my_custom_plugin.cpp -std=c++17
 */
class MyCustomPlugin : public Plugin {
public:
    MyCustomPlugin() = default;
    ~MyCustomPlugin() override = default;
    
    PluginInfo info() const override {
        return PluginInfo{
            .id = "my_custom_plugin",
            .name = "My Custom Plugin",
            .version = "1.0.0",
            .author = "Your Name",
            .description = "Example custom plugin for media processing",
            .type = PluginType::PROCESSOR,
            .supported_formats = {"txt", "json", "xml"},
            .capabilities = {"text_transform", "json_validate"},
            .is_loaded = initialized_,
            .is_builtin = false
        };
    }
    
    PluginCapabilities capabilities() const override {
        PluginCapabilities caps;
        caps.supports_video = false;
        caps.supports_audio = false;
        caps.supports_image = false;
        caps.supports_document = true;
        caps.supports_streaming = false;
        caps.supports_hardware_accel = false;
        caps.input_formats = {"txt", "json", "xml"};
        caps.output_formats = {"txt", "json", "xml"};
        return caps;
    }
    
    Result<void> initialize(const std::string& config_path) override {
        std::cout << "[MyCustomPlugin] Initializing with config: " << config_path << std::endl;
        
        // Load configuration if provided
        if (!config_path.empty()) {
            std::ifstream config_file(config_path);
            if (config_file.is_open()) {
                // Parse config...
                config_file.close();
            }
        }
        
        initialized_ = true;
        return Result<void>::ok();
    }
    
    void shutdown() override {
        std::cout << "[MyCustomPlugin] Shutting down" << std::endl;
        initialized_ = false;
    }
    
    bool is_healthy() const override {
        return initialized_;
    }
    
    bool can_handle(JobType type, const JobParams& params) const override {
        // This plugin only handles custom jobs
        if (type != JobType::CUSTOM) {
            return false;
        }
        
        // Check if params contain our supported operation
        if (auto* custom_params = std::get_if<std::map<std::string, std::string>>(&params)) {
            auto it = custom_params->find("operation");
            if (it != custom_params->end()) {
                return it->second == "text_transform" || 
                       it->second == "json_validate";
            }
        }
        
        return false;
    }
    
    Result<std::string> process(
        const JobRequest& request,
        JobProgressCallback progress_callback
    ) override {
        if (!initialized_) {
            return Result<std::string>::error(
                ErrorCode::SERVICE_UNAVAILABLE,
                "Plugin not initialized"
            );
        }
        
        // Extract custom params
        auto* custom_params = std::get_if<std::map<std::string, std::string>>(&request.params);
        if (!custom_params) {
            return Result<std::string>::error(
                ErrorCode::VALIDATION_ERROR,
                "Invalid parameters for custom plugin"
            );
        }
        
        std::string operation = (*custom_params)["operation"];
        std::string input_path = (*custom_params)["input_path"];
        std::string output_path = (*custom_params)["output_path"];
        
        // Report starting
        if (progress_callback) {
            progress_callback(request.id, JobProgress{
                .percent = 0.0,
                .stage = "starting",
                .eta = "calculating..."
            });
        }
        
        // Process based on operation
        Result<std::string> result;
        if (operation == "text_transform") {
            result = process_text_transform(input_path, output_path, *custom_params, request.id, progress_callback);
        } else if (operation == "json_validate") {
            result = process_json_validate(input_path, output_path, *custom_params, request.id, progress_callback);
        } else {
            return Result<std::string>::error(
                ErrorCode::VALIDATION_ERROR,
                "Unknown operation: " + operation
            );
        }
        
        // Report completion
        if (progress_callback) {
            progress_callback(request.id, JobProgress{
                .percent = 100.0,
                .stage = "completed"
            });
        }
        
        return result;
    }
    
    Result<void> cancel(const std::string& job_id) override {
        // Mark job as cancelled
        std::lock_guard<std::mutex> lock(jobs_mutex_);
        auto it = active_jobs_.find(job_id);
        if (it != active_jobs_.end()) {
            it->second = true;  // cancelled
            return Result<void>::ok();
        }
        return Result<void>::error(ErrorCode::NOT_FOUND, "Job not found");
    }
    
private:
    Result<std::string> process_text_transform(
        const std::string& input_path,
        const std::string& output_path,
        const std::map<std::string, std::string>& params,
        const std::string& job_id,
        JobProgressCallback progress_callback
    ) {
        // Read input file
        std::ifstream input(input_path);
        if (!input.is_open()) {
            return Result<std::string>::error(
                ErrorCode::NOT_FOUND,
                "Cannot open input file: " + input_path
            );
        }
        
        std::stringstream buffer;
        buffer << input.rdbuf();
        std::string content = buffer.str();
        input.close();
        
        if (progress_callback) {
            progress_callback(job_id, JobProgress{.percent = 30.0, .stage = "processing"});
        }
        
        // Get transform type
        std::string transform = "uppercase";
        auto it = params.find("transform");
        if (it != params.end()) {
            transform = it->second;
        }
        
        // Apply transformation
        if (transform == "uppercase") {
            for (char& c : content) {
                c = std::toupper(c);
            }
        } else if (transform == "lowercase") {
            for (char& c : content) {
                c = std::tolower(c);
            }
        } else if (transform == "reverse") {
            std::reverse(content.begin(), content.end());
        }
        
        if (progress_callback) {
            progress_callback(job_id, JobProgress{.percent = 70.0, .stage = "writing"});
        }
        
        // Write output file
        std::ofstream output(output_path);
        if (!output.is_open()) {
            return Result<std::string>::error(
                ErrorCode::STORAGE_ERROR,
                "Cannot create output file: " + output_path
            );
        }
        
        output << content;
        output.close();
        
        return Result<std::string>::ok(output_path);
    }
    
    Result<std::string> process_json_validate(
        const std::string& input_path,
        const std::string& output_path,
        const std::map<std::string, std::string>& params,
        const std::string& job_id,
        JobProgressCallback progress_callback
    ) {
        // Read input file
        std::ifstream input(input_path);
        if (!input.is_open()) {
            return Result<std::string>::error(
                ErrorCode::NOT_FOUND,
                "Cannot open input file: " + input_path
            );
        }
        
        std::stringstream buffer;
        buffer << input.rdbuf();
        std::string content = buffer.str();
        input.close();
        
        if (progress_callback) {
            progress_callback(job_id, JobProgress{.percent = 50.0, .stage = "validating"});
        }
        
        // Simple JSON validation (check for balanced braces)
        int brace_count = 0;
        int bracket_count = 0;
        bool in_string = false;
        bool escaped = false;
        
        for (char c : content) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (c == '\\') {
                escaped = true;
                continue;
            }
            if (c == '"') {
                in_string = !in_string;
                continue;
            }
            if (!in_string) {
                if (c == '{') brace_count++;
                else if (c == '}') brace_count--;
                else if (c == '[') bracket_count++;
                else if (c == ']') bracket_count--;
            }
        }
        
        bool valid = (brace_count == 0 && bracket_count == 0 && !in_string);
        
        // Write validation result
        std::ofstream output(output_path);
        if (!output.is_open()) {
            return Result<std::string>::error(
                ErrorCode::STORAGE_ERROR,
                "Cannot create output file: " + output_path
            );
        }
        
        output << "{\n";
        output << "  \"valid\": " << (valid ? "true" : "false") << ",\n";
        output << "  \"input_file\": \"" << input_path << "\",\n";
        output << "  \"brace_balance\": " << brace_count << ",\n";
        output << "  \"bracket_balance\": " << bracket_count << "\n";
        output << "}\n";
        output.close();
        
        if (!valid) {
            return Result<std::string>::error(
                ErrorCode::VALIDATION_ERROR,
                "JSON validation failed"
            );
        }
        
        return Result<std::string>::ok(output_path);
    }
    
    bool initialized_ = false;
    std::mutex jobs_mutex_;
    std::map<std::string, bool> active_jobs_;  // job_id -> cancelled
};

} // namespace plugins
} // namespace media

// Export plugin functions
MEDIA_PLUGIN_EXPORT(media::plugins::MyCustomPlugin)
