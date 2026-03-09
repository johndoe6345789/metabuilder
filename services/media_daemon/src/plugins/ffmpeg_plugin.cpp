#include "media/plugins/ffmpeg_plugin.hpp"
#include <iostream>
#include <sstream>
#include <fstream>
#include <filesystem>
#include <array>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <regex>

#ifndef _WIN32
#include <unistd.h>
#include <sys/wait.h>
#include <signal.h>
#endif

namespace media {
namespace plugins {

FFmpegPlugin::FFmpegPlugin() = default;
FFmpegPlugin::~FFmpegPlugin() {
    shutdown();
}

// ============================================================================
// Plugin Interface
// ============================================================================

PluginInfo FFmpegPlugin::info() const {
    return PluginInfo{
        .id = "ffmpeg",
        .name = "FFmpeg Transcoder",
        .version = "1.0.0",
        .author = "MetaBuilder",
        .description = "Video and audio transcoding using FFmpeg. "
                       "Supports hardware acceleration, HLS streaming, and Icecast radio.",
        .type = PluginType::TRANSCODER,
        .supported_formats = {
            // Video
            "mp4", "mkv", "avi", "mov", "webm", "flv", "ts", "m2ts",
            // Audio
            "mp3", "aac", "flac", "ogg", "opus", "wav", "m4a", "wma",
            // Container
            "hls", "dash", "rtmp"
        },
        .capabilities = {
            "video_transcode", "audio_transcode", "hls_output", "dash_output",
            "hardware_accel", "audio_normalize", "crossfade", "icecast_stream"
        },
        .is_loaded = initialized_,
        .is_builtin = true
    };
}

PluginCapabilities FFmpegPlugin::capabilities() const {
    PluginCapabilities caps;
    caps.supports_video = true;
    caps.supports_audio = true;
    caps.supports_image = true;
    caps.supports_document = false;
    caps.supports_streaming = true;
    caps.supports_hardware_accel = true;
    caps.input_formats = {
        "mp4", "mkv", "avi", "mov", "webm", "flv", "ts",
        "mp3", "aac", "flac", "ogg", "opus", "wav", "m4a"
    };
    caps.output_formats = {
        "mp4", "mkv", "webm", "ts",
        "mp3", "aac", "flac", "ogg", "opus",
        "hls", "m3u8"
    };
    return caps;
}

Result<void> FFmpegPlugin::initialize(const std::string& /*config_path*/) {
    std::cout << "[FFmpegPlugin] Initializing..." << std::endl;

    // Verify ffmpeg is available
    std::string test_cmd = config_.ffmpeg_path + " -version 2>&1 | head -1";
    FILE* pipe = popen(test_cmd.c_str(), "r");
    if (!pipe) {
        return Result<void>::error(
            ErrorCode::SERVICE_UNAVAILABLE,
            "Failed to execute ffmpeg at: " + config_.ffmpeg_path
        );
    }

    char buf[256];
    std::string version_line;
    if (fgets(buf, sizeof(buf), pipe)) {
        version_line = buf;
    }
    pclose(pipe);

    if (version_line.find("ffmpeg") == std::string::npos) {
        return Result<void>::error(
            ErrorCode::SERVICE_UNAVAILABLE,
            "FFmpeg not found at: " + config_.ffmpeg_path
        );
    }

    std::cout << "[FFmpegPlugin] Found: " << version_line.substr(0, version_line.find('\n')) << std::endl;

    // Detect hardware acceleration
    if (config_.hardware_accel == FFmpegConfig::HwAccel::AUTO) {
        config_.hardware_accel = detect_hardware_accel();
    }

    initialized_ = true;
    std::cout << "[FFmpegPlugin] Initialized successfully" << std::endl;
    return Result<void>::ok();
}

void FFmpegPlugin::shutdown() {
    std::cout << "[FFmpegPlugin] Shutting down..." << std::endl;

    // Kill all active processes
    std::lock_guard<std::mutex> lock(processes_mutex_);
    for (auto& [id, info] : active_processes_) {
        info.cancelled.store(true);
        if (info.pid > 0) {
#ifndef _WIN32
            kill(info.pid, SIGTERM);
#endif
        }
    }
    active_processes_.clear();
    initialized_ = false;
}

bool FFmpegPlugin::is_healthy() const {
    return initialized_;
}

bool FFmpegPlugin::can_handle(JobType type, const JobParams& params) const {
    switch (type) {
        case JobType::VIDEO_TRANSCODE:
            return std::holds_alternative<VideoTranscodeParams>(params);
        case JobType::AUDIO_TRANSCODE:
            return std::holds_alternative<AudioTranscodeParams>(params);
        case JobType::IMAGE_PROCESS:
            // FFmpeg can do basic image operations
            return std::holds_alternative<ImageProcessParams>(params);
        default:
            return false;
    }
}

Result<std::string> FFmpegPlugin::process(
    const JobRequest& request,
    JobProgressCallback progress_callback
) {
    if (!initialized_) {
        return Result<std::string>::error(
            ErrorCode::SERVICE_UNAVAILABLE,
            "FFmpeg plugin not initialized"
        );
    }

    // Register job
    {
        std::lock_guard<std::mutex> lock(processes_mutex_);
        active_processes_[request.id] = ProcessInfo{};
    }

    if (progress_callback) {
        progress_callback(request.id, JobProgress{.percent = 0.0, .stage = "preparing"});
    }

    Result<std::string> result;

    if (auto* vp = std::get_if<VideoTranscodeParams>(&request.params)) {
        auto args = build_video_command(*vp);

        // Get duration for progress
        double duration = 0.0;
        auto dur_result = get_duration(vp->input_path);
        if (dur_result.is_ok()) duration = dur_result.value();

        auto exec_result = execute_ffmpeg(args, request.id, duration, progress_callback);
        if (exec_result.is_error()) {
            result = Result<std::string>::error(exec_result.error_code(), exec_result.error_message());
        } else {
            result = Result<std::string>::ok(vp->output_path);
        }

    } else if (auto* ap = std::get_if<AudioTranscodeParams>(&request.params)) {
        auto args = build_audio_command(*ap);

        double duration = 0.0;
        auto dur_result = get_duration(ap->input_path);
        if (dur_result.is_ok()) duration = dur_result.value();

        auto exec_result = execute_ffmpeg(args, request.id, duration, progress_callback);
        if (exec_result.is_error()) {
            result = Result<std::string>::error(exec_result.error_code(), exec_result.error_message());
        } else {
            result = Result<std::string>::ok(ap->output_path);
        }

    } else if (auto* ip = std::get_if<ImageProcessParams>(&request.params)) {
        // Use ffmpeg for image processing
        std::vector<std::string> args;
        args.push_back(config_.ffmpeg_path);
        args.push_back("-i");
        args.push_back(ip->input_path);

        if (ip->width > 0 || ip->height > 0) {
            std::string scale = "scale=";
            scale += ip->width > 0 ? std::to_string(ip->width) : "-1";
            scale += ":";
            scale += ip->height > 0 ? std::to_string(ip->height) : "-1";
            args.push_back("-vf");
            args.push_back(scale);
        }

        if (!ip->format.empty()) {
            args.push_back("-f");
            args.push_back("image2");
        }

        args.push_back("-q:v");
        args.push_back(std::to_string(ip->quality / 10 + 1));  // Map 0-100 to 1-10
        args.push_back("-y");
        args.push_back(ip->output_path);

        auto exec_result = execute_ffmpeg(args, request.id, 0.0, progress_callback);
        if (exec_result.is_error()) {
            result = Result<std::string>::error(exec_result.error_code(), exec_result.error_message());
        } else {
            result = Result<std::string>::ok(ip->output_path);
        }
    } else {
        result = Result<std::string>::error(
            ErrorCode::VALIDATION_ERROR,
            "Unsupported parameter type for FFmpeg plugin"
        );
    }

    // Cleanup
    {
        std::lock_guard<std::mutex> lock(processes_mutex_);
        active_processes_.erase(request.id);
    }

    if (progress_callback && result.is_ok()) {
        progress_callback(request.id, JobProgress{.percent = 100.0, .stage = "completed"});
    }

    return result;
}

Result<void> FFmpegPlugin::cancel(const std::string& job_id) {
    std::lock_guard<std::mutex> lock(processes_mutex_);
    auto it = active_processes_.find(job_id);
    if (it == active_processes_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Job not found: " + job_id);
    }

    it->second.cancelled.store(true);
    if (it->second.pid > 0) {
#ifndef _WIN32
        kill(it->second.pid, SIGTERM);
#endif
    }

    return Result<void>::ok();
}

// ============================================================================
// Streaming Support
// ============================================================================

Result<std::string> FFmpegPlugin::start_stream(
    const std::string& channel_id,
    const std::map<std::string, std::string>& source,
    const std::map<std::string, std::string>& output
) {
    auto src_it = source.find("path");
    if (src_it == source.end()) {
        return Result<std::string>::error(
            ErrorCode::VALIDATION_ERROR,
            "source.path is required for streaming"
        );
    }

    auto out_type_it = output.find("type");
    std::string out_type = (out_type_it != output.end()) ? out_type_it->second : "hls";

    std::string stream_url;

    if (out_type == "icecast") {
        // Radio via Icecast: ffmpeg -re -i input.mp3 -f mp3 icy://source:password@icecast:8000/mount
        auto host_it = output.find("host");
        auto port_it = output.find("port");
        auto pass_it = output.find("password");
        auto mount_it = output.find("mount");

        std::string host = (host_it != output.end()) ? host_it->second : "localhost";
        std::string port = (port_it != output.end()) ? port_it->second : "8000";
        std::string pass = (pass_it != output.end()) ? pass_it->second : "hackme";
        std::string mount = (mount_it != output.end()) ? mount_it->second : "/" + channel_id;

        stream_url = "icy://source:" + pass + "@" + host + ":" + port + mount;

        std::string cmd = config_.ffmpeg_path
            + " -re -i \"" + src_it->second + "\""
            + " -f mp3"
            + " \"" + stream_url + "\""
            + " &";  // Run in background

        std::system(cmd.c_str());

    } else {
        // HLS output
        auto hls_dir_it = output.find("hls_dir");
        std::string hls_dir = (hls_dir_it != output.end())
            ? hls_dir_it->second
            : "/data/hls/" + channel_id;

        std::filesystem::create_directories(hls_dir);

        auto args = build_hls_command(src_it->second, hls_dir, output);
        stream_url = "/hls/" + channel_id + "/stream.m3u8";

        // Build and run command string
        std::string cmd;
        for (const auto& arg : args) {
            if (!cmd.empty()) cmd += " ";
            cmd += "\"" + arg + "\"";
        }
        cmd += " &";

        std::system(cmd.c_str());
    }

    return Result<std::string>::ok(stream_url);
}

Result<void> FFmpegPlugin::stop_stream(const std::string& channel_id) {
    std::lock_guard<std::mutex> lock(processes_mutex_);

    auto it = active_processes_.find(channel_id);
    if (it == active_processes_.end()) {
        return Result<void>::ok();  // Not found, already stopped
    }

    it->second.cancelled.store(true);
    if (it->second.pid > 0) {
#ifndef _WIN32
        kill(it->second.pid, SIGTERM);
#endif
    }

    active_processes_.erase(it);
    return Result<void>::ok();
}

// ============================================================================
// FFmpeg-specific Methods
// ============================================================================

Result<std::string> FFmpegPlugin::probe(const std::string& path) {
    {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        auto it = probe_cache_.find(path);
        if (it != probe_cache_.end()) {
            return Result<std::string>::ok(it->second);
        }
    }

    std::string cmd = config_.ffprobe_path
        + " -v quiet -print_format json -show_format -show_streams"
        + " \"" + path + "\" 2>/dev/null";

    FILE* pipe = popen(cmd.c_str(), "r");
    if (!pipe) {
        return Result<std::string>::error(
            ErrorCode::PLUGIN_ERROR,
            "Failed to run ffprobe on: " + path
        );
    }

    std::string output;
    char buf[4096];
    while (fgets(buf, sizeof(buf), pipe)) {
        output += buf;
    }
    int ret = pclose(pipe);

    if (ret != 0) {
        return Result<std::string>::error(
            ErrorCode::PLUGIN_ERROR,
            "ffprobe failed for: " + path
        );
    }

    {
        std::lock_guard<std::mutex> lock(cache_mutex_);
        probe_cache_[path] = output;
    }

    return Result<std::string>::ok(output);
}

Result<double> FFmpegPlugin::get_duration(const std::string& path) {
    std::string cmd = config_.ffprobe_path
        + " -v quiet -show_entries format=duration"
        + " -print_format flat -i \"" + path + "\" 2>/dev/null";

    FILE* pipe = popen(cmd.c_str(), "r");
    if (!pipe) {
        return Result<double>::error(ErrorCode::PLUGIN_ERROR, "Failed to run ffprobe");
    }

    char buf[256];
    std::string line;
    if (fgets(buf, sizeof(buf), pipe)) {
        line = buf;
    }
    pclose(pipe);

    auto eq = line.find('=');
    if (eq == std::string::npos) {
        return Result<double>::ok(0.0);
    }

    try {
        double dur = std::stod(line.substr(eq + 1));
        return Result<double>::ok(dur);
    } catch (...) {
        return Result<double>::ok(0.0);
    }
}

std::vector<std::string> FFmpegPlugin::get_available_encoders() {
    std::vector<std::string> encoders;

    std::string cmd = config_.ffmpeg_path + " -encoders 2>/dev/null | grep '^ V'";
    FILE* pipe = popen(cmd.c_str(), "r");
    if (!pipe) return encoders;

    char buf[512];
    while (fgets(buf, sizeof(buf), pipe)) {
        std::string line(buf);
        // Parse encoder name from line
        size_t start = line.find_first_not_of(" VASEDFX");
        if (start != std::string::npos) {
            size_t end = line.find(' ', start);
            if (end != std::string::npos) {
                encoders.push_back(line.substr(start, end - start));
            }
        }
    }
    pclose(pipe);

    return encoders;
}

bool FFmpegPlugin::is_codec_available(const std::string& codec) {
    std::string cmd = config_.ffmpeg_path
        + " -codecs 2>/dev/null | grep -q ' " + codec + " '";
    return std::system(cmd.c_str()) == 0;
}

// ============================================================================
// Private: Command Building
// ============================================================================

std::vector<std::string> FFmpegPlugin::build_video_command(
    const VideoTranscodeParams& params
) {
    std::vector<std::string> args;
    args.push_back(config_.ffmpeg_path);

    // Input
    args.push_back("-i");
    args.push_back(params.input_path);

    // Video codec
    std::string vcodec = params.codec;
    std::string hw_enc = get_hw_encoder(vcodec);
    if (!hw_enc.empty() && config_.hardware_accel != FFmpegConfig::HwAccel::NONE) {
        args.push_back("-c:v");
        args.push_back(hw_enc);
    } else {
        if (vcodec == "h264") {
            args.push_back("-c:v");
            args.push_back("libx264");
        } else if (vcodec == "h265") {
            args.push_back("-c:v");
            args.push_back("libx265");
        } else if (vcodec == "vp9") {
            args.push_back("-c:v");
            args.push_back("libvpx-vp9");
        } else if (vcodec == "av1") {
            args.push_back("-c:v");
            args.push_back("libaom-av1");
        } else {
            args.push_back("-c:v");
            args.push_back(vcodec);
        }
    }

    // Video preset
    if (!params.preset.empty()) {
        args.push_back("-preset");
        args.push_back(params.preset);
    }

    // Bitrate
    if (params.bitrate_kbps > 0) {
        args.push_back("-b:v");
        args.push_back(std::to_string(params.bitrate_kbps) + "k");
    }

    // Resolution
    if (params.width > 0 || params.height > 0) {
        std::string scale = "scale=";
        scale += params.width > 0 ? std::to_string(params.width) : "-1";
        scale += ":";
        scale += params.height > 0 ? std::to_string(params.height) : "-1";
        args.push_back("-vf");
        args.push_back(scale);
    }

    // Audio codec
    if (!params.audio_codec.empty()) {
        args.push_back("-c:a");
        if (params.audio_codec == "aac") {
            args.push_back("aac");
        } else if (params.audio_codec == "mp3") {
            args.push_back("libmp3lame");
        } else {
            args.push_back(params.audio_codec);
        }
    }

    if (params.audio_bitrate_kbps > 0) {
        args.push_back("-b:a");
        args.push_back(std::to_string(params.audio_bitrate_kbps) + "k");
    }

    // Threading
    if (config_.threads > 0) {
        args.push_back("-threads");
        args.push_back(std::to_string(config_.threads));
    }

    // Extra params
    for (const auto& [k, v] : params.extra_params) {
        args.push_back("-" + k);
        args.push_back(v);
    }

    // Progress output (to stderr, parseable)
    args.push_back("-progress");
    args.push_back("pipe:2");

    // Overwrite output
    args.push_back("-y");
    args.push_back(params.output_path);

    return args;
}

std::vector<std::string> FFmpegPlugin::build_audio_command(
    const AudioTranscodeParams& params
) {
    std::vector<std::string> args;
    args.push_back(config_.ffmpeg_path);

    args.push_back("-i");
    args.push_back(params.input_path);

    // Audio codec
    if (params.codec == "mp3") {
        args.push_back("-c:a");
        args.push_back("libmp3lame");
    } else if (params.codec == "aac") {
        args.push_back("-c:a");
        args.push_back("aac");
    } else if (params.codec == "opus") {
        args.push_back("-c:a");
        args.push_back("libopus");
    } else {
        args.push_back("-c:a");
        args.push_back(params.codec);
    }

    args.push_back("-b:a");
    args.push_back(std::to_string(params.bitrate_kbps) + "k");

    args.push_back("-ar");
    args.push_back(std::to_string(params.sample_rate));

    args.push_back("-ac");
    args.push_back(std::to_string(params.channels));

    // Normalization using loudnorm filter
    if (params.normalize) {
        args.push_back("-af");
        args.push_back("loudnorm=I=" + std::to_string(static_cast<int>(params.target_lufs))
                       + ":LRA=11:TP=-1.5");
    }

    args.push_back("-vn");  // No video
    args.push_back("-progress");
    args.push_back("pipe:2");
    args.push_back("-y");
    args.push_back(params.output_path);

    return args;
}

std::vector<std::string> FFmpegPlugin::build_hls_command(
    const std::string& input,
    const std::string& output_dir,
    const std::map<std::string, std::string>& options
) {
    std::vector<std::string> args;
    args.push_back(config_.ffmpeg_path);

    args.push_back("-re");  // Real-time input
    args.push_back("-i");
    args.push_back(input);

    // Video
    args.push_back("-c:v");
    auto vcodec_it = options.find("video_codec");
    args.push_back(vcodec_it != options.end() ? vcodec_it->second : "libx264");

    // Audio
    args.push_back("-c:a");
    auto acodec_it = options.find("audio_codec");
    args.push_back(acodec_it != options.end() ? acodec_it->second : "aac");

    // HLS settings
    args.push_back("-hls_time");
    auto seg_it = options.find("segment_duration");
    args.push_back(seg_it != options.end() ? seg_it->second : "4");

    args.push_back("-hls_list_size");
    auto list_it = options.find("playlist_size");
    args.push_back(list_it != options.end() ? list_it->second : "10");

    args.push_back("-hls_flags");
    args.push_back("delete_segments+append_list");

    args.push_back("-hls_segment_filename");
    args.push_back(output_dir + "/seg_%05d.ts");

    args.push_back("-y");
    args.push_back(output_dir + "/stream.m3u8");

    return args;
}

Result<void> FFmpegPlugin::execute_ffmpeg(
    const std::vector<std::string>& args,
    const std::string& job_id,
    double total_duration,
    JobProgressCallback progress_callback
) {
    // Build command string
    std::string cmd;
    for (const auto& arg : args) {
        if (!cmd.empty()) cmd += " ";
        // Quote args containing spaces or special chars
        bool needs_quote = arg.find(' ') != std::string::npos
                        || arg.find('"') != std::string::npos;
        if (needs_quote) {
            cmd += "\"" + arg + "\"";
        } else {
            cmd += arg;
        }
    }

    // Capture stderr for progress parsing
    cmd += " 2>&1";

    std::cout << "[FFmpegPlugin] Executing job " << job_id << std::endl;

    // Check if cancelled before starting
    {
        std::lock_guard<std::mutex> lock(processes_mutex_);
        auto it = active_processes_.find(job_id);
        if (it != active_processes_.end() && it->second.cancelled.load()) {
            return Result<void>::error(ErrorCode::CONFLICT, "Job cancelled before start");
        }
    }

    FILE* pipe = popen(cmd.c_str(), "r");
    if (!pipe) {
        return Result<void>::error(ErrorCode::PLUGIN_ERROR, "Failed to execute ffmpeg");
    }

    char buf[1024];
    std::string progress_block;
    double last_time = 0.0;

    while (fgets(buf, sizeof(buf), pipe)) {
        // Check for cancellation
        {
            std::lock_guard<std::mutex> lock(processes_mutex_);
            auto it = active_processes_.find(job_id);
            if (it != active_processes_.end() && it->second.cancelled.load()) {
                pclose(pipe);
                return Result<void>::error(ErrorCode::CONFLICT, "Job cancelled");
            }
        }

        std::string line(buf);

        // Parse progress output (from -progress pipe:2)
        if (line.find("out_time_ms=") != std::string::npos) {
            auto eq = line.find('=');
            if (eq != std::string::npos) {
                try {
                    double time_ms = std::stod(line.substr(eq + 1));
                    double time_s = time_ms / 1000000.0;

                    if (progress_callback && total_duration > 0) {
                        double pct = std::min(99.9, (time_s / total_duration) * 100.0);
                        JobProgress prog;
                        prog.percent = pct;
                        prog.stage = "encoding";
                        prog.bytes_processed = static_cast<size_t>(time_s);
                        prog.bytes_total = static_cast<size_t>(total_duration);
                        progress_callback(job_id, prog);
                    }

                    last_time = time_s;
                } catch (...) {}
            }
        }
    }

    int exit_code = pclose(pipe);

    if (exit_code != 0) {
        return Result<void>::error(
            ErrorCode::TRANSCODE_ERROR,
            "FFmpeg exited with code " + std::to_string(exit_code)
        );
    }

    return Result<void>::ok();
}

JobProgress FFmpegPlugin::parse_progress(
    const std::string& output,
    double total_duration
) {
    JobProgress progress;

    // Parse "out_time_ms=NNNNNN" lines
    auto pos = output.find("out_time_ms=");
    if (pos != std::string::npos) {
        try {
            double ms = std::stod(output.substr(pos + 12));
            double s = ms / 1000000.0;
            if (total_duration > 0) {
                progress.percent = std::min(99.9, (s / total_duration) * 100.0);
            }
        } catch (...) {}
    }

    progress.stage = "encoding";
    return progress;
}

FFmpegConfig::HwAccel FFmpegPlugin::detect_hardware_accel() {
    // Test NVENC
    std::string test = config_.ffmpeg_path + " -hide_banner -hwaccels 2>/dev/null";
    FILE* pipe = popen(test.c_str(), "r");
    if (!pipe) return FFmpegConfig::HwAccel::NONE;

    std::string output;
    char buf[256];
    while (fgets(buf, sizeof(buf), pipe)) {
        output += buf;
    }
    pclose(pipe);

    if (output.find("videotoolbox") != std::string::npos) {
        std::cout << "[FFmpegPlugin] Hardware accel: VideoToolbox (macOS)" << std::endl;
        return FFmpegConfig::HwAccel::VIDEOTOOLBOX;
    }
    if (output.find("cuda") != std::string::npos || output.find("nvenc") != std::string::npos) {
        std::cout << "[FFmpegPlugin] Hardware accel: NVIDIA NVENC" << std::endl;
        return FFmpegConfig::HwAccel::NVIDIA;
    }
    if (output.find("vaapi") != std::string::npos) {
        std::cout << "[FFmpegPlugin] Hardware accel: VAAPI" << std::endl;
        return FFmpegConfig::HwAccel::VAAPI;
    }
    if (output.find("qsv") != std::string::npos) {
        std::cout << "[FFmpegPlugin] Hardware accel: Intel QSV" << std::endl;
        return FFmpegConfig::HwAccel::QSV;
    }

    return FFmpegConfig::HwAccel::NONE;
}

std::string FFmpegPlugin::get_hw_encoder(const std::string& codec) {
    switch (config_.hardware_accel) {
        case FFmpegConfig::HwAccel::NVIDIA:
            if (codec == "h264") return "h264_nvenc";
            if (codec == "h265") return "hevc_nvenc";
            break;
        case FFmpegConfig::HwAccel::VAAPI:
            if (codec == "h264") return "h264_vaapi";
            if (codec == "h265") return "hevc_vaapi";
            break;
        case FFmpegConfig::HwAccel::QSV:
            if (codec == "h264") return "h264_qsv";
            if (codec == "h265") return "hevc_qsv";
            break;
        case FFmpegConfig::HwAccel::VIDEOTOOLBOX:
            if (codec == "h264") return "h264_videotoolbox";
            if (codec == "h265") return "hevc_videotoolbox";
            break;
        default:
            break;
    }
    return "";
}

} // namespace plugins
} // namespace media
