#include "media/plugin.hpp"
#include <iostream>
#include <sstream>
#include <fstream>
#include <filesystem>
#include <map>
#include <mutex>
#include <vector>
#include <cstdio>
#include <cstdlib>
#include <algorithm>

// ImageMagick plugin - image processing via `convert` (ImageMagick) binary
// Binary is at /usr/bin/convert or /usr/local/bin/convert in Docker container

namespace media {
namespace plugins {

/**
 * ImageMagick Plugin Configuration
 */
struct ImageMagickConfig {
    std::string convert_path = "/usr/bin/convert";
    std::string identify_path = "/usr/bin/identify";
    int max_concurrent_jobs = 8;
    size_t max_input_size_mb = 100;
};

/**
 * ImageMagick Plugin
 *
 * Built-in plugin for image processing using ImageMagick.
 * Handles resize, crop, format conversion, watermarking, thumbnail generation.
 */
class ImageMagickPlugin : public Plugin {
public:
    ImageMagickPlugin() = default;
    ~ImageMagickPlugin() override { shutdown(); }

    // ========================================================================
    // Plugin Interface
    // ========================================================================

    PluginInfo info() const override {
        return PluginInfo{
            .id = "imagemagick",
            .name = "ImageMagick Processor",
            .version = "1.0.0",
            .author = "MetaBuilder",
            .description = "Image processing and conversion using ImageMagick. "
                           "Supports resize, crop, format conversion, filters, and thumbnails.",
            .type = PluginType::PROCESSOR,
            .supported_formats = {
                "jpg", "jpeg", "png", "webp", "avif", "gif", "bmp",
                "tiff", "tif", "heic", "svg", "ico", "pdf"
            },
            .capabilities = {
                "resize", "crop", "convert", "thumbnail", "watermark",
                "blur", "sharpen", "normalize", "rotate", "flip", "grayscale"
            },
            .is_loaded = initialized_,
            .is_builtin = true
        };
    }

    PluginCapabilities capabilities() const override {
        PluginCapabilities caps;
        caps.supports_video = false;
        caps.supports_audio = false;
        caps.supports_image = true;
        caps.supports_document = false;
        caps.supports_streaming = false;
        caps.supports_hardware_accel = false;
        caps.input_formats = {
            "jpg", "jpeg", "png", "webp", "gif", "bmp",
            "tiff", "tif", "heic", "svg", "ico"
        };
        caps.output_formats = {
            "jpg", "jpeg", "png", "webp", "avif", "gif",
            "bmp", "tiff", "ico", "pdf"
        };
        return caps;
    }

    Result<void> initialize(const std::string& /*config_path*/) override {
        std::cout << "[ImageMagickPlugin] Initializing..." << std::endl;

        // Verify ImageMagick is available
        std::string test_cmd = config_.convert_path + " --version 2>&1 | head -1";
        FILE* pipe = popen(test_cmd.c_str(), "r");
        if (!pipe) {
            return Result<void>::error(
                ErrorCode::SERVICE_UNAVAILABLE,
                "ImageMagick not found at: " + config_.convert_path
            );
        }

        char buf[256];
        std::string version_line;
        if (fgets(buf, sizeof(buf), pipe)) {
            version_line = buf;
        }
        pclose(pipe);

        if (version_line.find("ImageMagick") == std::string::npos
            && version_line.find("Version") == std::string::npos) {
            return Result<void>::error(
                ErrorCode::SERVICE_UNAVAILABLE,
                "ImageMagick convert not available at: " + config_.convert_path
            );
        }

        std::cout << "[ImageMagickPlugin] Found: "
                  << version_line.substr(0, version_line.find('\n')) << std::endl;

        initialized_ = true;
        std::cout << "[ImageMagickPlugin] Initialized successfully" << std::endl;
        return Result<void>::ok();
    }

    void shutdown() override {
        std::cout << "[ImageMagickPlugin] Shutting down..." << std::endl;
        initialized_ = false;
    }

    bool is_healthy() const override { return initialized_; }

    bool can_handle(JobType type, const JobParams& params) const override {
        if (type != JobType::IMAGE_PROCESS) return false;
        return std::holds_alternative<ImageProcessParams>(params);
    }

    Result<std::string> process(
        const JobRequest& request,
        JobProgressCallback progress_callback
    ) override {
        if (!initialized_) {
            return Result<std::string>::error(
                ErrorCode::SERVICE_UNAVAILABLE,
                "ImageMagick plugin not initialized"
            );
        }

        auto* ip = std::get_if<ImageProcessParams>(&request.params);
        if (!ip) {
            return Result<std::string>::error(
                ErrorCode::VALIDATION_ERROR,
                "Invalid parameters for image processing"
            );
        }

        if (progress_callback) {
            progress_callback(request.id, JobProgress{.percent = 0.0, .stage = "preparing"});
        }

        // Verify input exists
        if (!std::filesystem::exists(ip->input_path)) {
            return Result<std::string>::error(
                ErrorCode::NOT_FOUND,
                "Input file not found: " + ip->input_path
            );
        }

        // Create output directory if needed
        std::filesystem::path out_path(ip->output_path);
        if (out_path.has_parent_path()) {
            std::filesystem::create_directories(out_path.parent_path());
        }

        // Build convert command
        auto args = build_convert_command(*ip);

        if (progress_callback) {
            progress_callback(request.id, JobProgress{.percent = 20.0, .stage = "processing"});
        }

        // Execute
        auto result = execute_convert(args, request.id);

        if (result.is_error()) {
            return Result<std::string>::error(result.error_code(), result.error_message());
        }

        if (!std::filesystem::exists(ip->output_path)) {
            return Result<std::string>::error(
                ErrorCode::INTERNAL_ERROR,
                "Output file was not created: " + ip->output_path
            );
        }

        if (progress_callback) {
            progress_callback(request.id, JobProgress{.percent = 100.0, .stage = "completed"});
        }

        return Result<std::string>::ok(ip->output_path);
    }

    Result<void> cancel(const std::string& job_id) override {
        std::lock_guard<std::mutex> lock(jobs_mutex_);
        active_jobs_.erase(job_id);
        return Result<void>::ok();
    }

    // ========================================================================
    // ImageMagick-specific conveniences
    // ========================================================================

    Result<std::string> resize(
        const std::string& input_path,
        const std::string& output_path,
        int width, int height,
        bool preserve_aspect = true
    ) {
        ImageProcessParams params;
        params.input_path = input_path;
        params.output_path = output_path;
        params.width = width;
        params.height = height;
        params.preserve_aspect = preserve_aspect;
        params.quality = 85;

        // Get format from output extension
        std::filesystem::path p(output_path);
        std::string ext = p.extension().string();
        if (!ext.empty() && ext[0] == '.') ext = ext.substr(1);
        params.format = ext;

        JobRequest req;
        req.id = "im_resize_" + std::to_string(std::time(nullptr));
        req.type = JobType::IMAGE_PROCESS;
        req.params = params;

        return process(req, nullptr);
    }

    Result<std::string> thumbnail(
        const std::string& input_path,
        const std::string& output_path,
        int size = 256
    ) {
        return resize(input_path, output_path, size, size, true);
    }

    Result<std::string> convert_format(
        const std::string& input_path,
        const std::string& output_path,
        const std::string& format,
        int quality = 85
    ) {
        ImageProcessParams params;
        params.input_path = input_path;
        params.output_path = output_path;
        params.format = format;
        params.quality = quality;

        JobRequest req;
        req.id = "im_convert_" + std::to_string(std::time(nullptr));
        req.type = JobType::IMAGE_PROCESS;
        req.params = params;

        return process(req, nullptr);
    }

    /**
     * Get image dimensions
     */
    Result<std::pair<int, int>> get_dimensions(const std::string& path) {
        std::string cmd = config_.identify_path
            + " -format \"%wx%h\" \"" + path + "\" 2>/dev/null";

        FILE* pipe = popen(cmd.c_str(), "r");
        if (!pipe) {
            return Result<std::pair<int,int>>::error(
                ErrorCode::PLUGIN_ERROR,
                "Failed to run identify"
            );
        }

        char buf[64];
        std::string line;
        if (fgets(buf, sizeof(buf), pipe)) {
            line = buf;
        }
        pclose(pipe);

        auto x_pos = line.find('x');
        if (x_pos == std::string::npos) {
            return Result<std::pair<int,int>>::ok({0, 0});
        }

        try {
            int w = std::stoi(line.substr(0, x_pos));
            int h = std::stoi(line.substr(x_pos + 1));
            return Result<std::pair<int,int>>::ok({w, h});
        } catch (...) {
            return Result<std::pair<int,int>>::ok({0, 0});
        }
    }

private:

    std::vector<std::string> build_convert_command(const ImageProcessParams& params) {
        std::vector<std::string> args;
        args.push_back(config_.convert_path);

        // Input
        args.push_back(params.input_path);

        // Resize
        if (params.width > 0 || params.height > 0) {
            std::string geometry;
            if (params.preserve_aspect) {
                // Fit within bounds preserving aspect ratio
                if (params.width > 0 && params.height > 0) {
                    geometry = std::to_string(params.width) + "x" + std::to_string(params.height);
                } else if (params.width > 0) {
                    geometry = std::to_string(params.width);
                } else {
                    geometry = "x" + std::to_string(params.height);
                }
            } else {
                // Exact resize (ignore aspect ratio)
                geometry = std::to_string(params.width > 0 ? params.width : 0)
                    + "x" + std::to_string(params.height > 0 ? params.height : 0)
                    + "!";
            }
            args.push_back("-resize");
            args.push_back(geometry);
        }

        // Filters
        for (const auto& filter : params.filters) {
            if (filter == "blur") {
                args.push_back("-blur");
                args.push_back("0x2");
            } else if (filter == "sharpen") {
                args.push_back("-sharpen");
                args.push_back("0x1");
            } else if (filter == "grayscale") {
                args.push_back("-colorspace");
                args.push_back("Gray");
            } else if (filter == "normalize") {
                args.push_back("-normalize");
            } else if (filter == "flip") {
                args.push_back("-flip");
            } else if (filter == "flop") {
                args.push_back("-flop");
            }
        }

        // Quality
        if (params.quality > 0) {
            args.push_back("-quality");
            args.push_back(std::to_string(params.quality));
        }

        // Strip metadata for web output
        args.push_back("-strip");

        // Output format (prepend to output path for ImageMagick format hint)
        std::string output = params.output_path;
        if (!params.format.empty()) {
            output = params.format + ":" + params.output_path;
        }

        args.push_back(output);

        return args;
    }

    Result<void> execute_convert(
        const std::vector<std::string>& args,
        const std::string& job_id
    ) {
        std::string cmd;
        for (const auto& arg : args) {
            if (!cmd.empty()) cmd += " ";
            bool needs_quote = arg.find(' ') != std::string::npos
                            || arg.find('"') != std::string::npos;
            if (needs_quote) {
                cmd += "\"" + arg + "\"";
            } else {
                cmd += arg;
            }
        }
        cmd += " 2>&1";

        std::cout << "[ImageMagickPlugin] Executing: " << cmd << std::endl;

        FILE* pipe = popen(cmd.c_str(), "r");
        if (!pipe) {
            return Result<void>::error(
                ErrorCode::PLUGIN_ERROR,
                "Failed to execute ImageMagick convert"
            );
        }

        std::string output;
        char buf[1024];
        while (fgets(buf, sizeof(buf), pipe)) {
            output += buf;
        }

        int exit_code = pclose(pipe);

        if (exit_code != 0) {
            return Result<void>::error(
                ErrorCode::TRANSCODE_ERROR,
                "ImageMagick convert failed (code " + std::to_string(exit_code)
                    + "): " + output.substr(0, 200)
            );
        }

        return Result<void>::ok();
    }

    ImageMagickConfig config_;
    bool initialized_ = false;
    mutable std::mutex jobs_mutex_;
    std::map<std::string, bool> active_jobs_;
};

} // namespace plugins
} // namespace media

// Export plugin
MEDIA_PLUGIN_EXPORT(media::plugins::ImageMagickPlugin)
