#pragma once

#include "media/plugin.hpp"
#include <map>
#include <mutex>
#include <atomic>

namespace media {
namespace plugins {

/**
 * FFmpeg Plugin Configuration
 */
struct FFmpegConfig {
    std::string ffmpeg_path = "/usr/bin/ffmpeg";
    std::string ffprobe_path = "/usr/bin/ffprobe";
    
    // Hardware acceleration
    enum class HwAccel {
        NONE,
        AUTO,
        NVIDIA,   // NVENC
        VAAPI,    // Intel/AMD
        QSV,      // Intel Quick Sync
        VIDEOTOOLBOX  // macOS
    };
    HwAccel hardware_accel = HwAccel::AUTO;
    
    // Threading
    int threads = 0;  // 0 = auto
    
    // Limits
    int max_concurrent_jobs = 4;
    size_t max_output_size_gb = 50;
};

/**
 * FFmpeg Plugin
 * 
 * Built-in plugin for video and audio transcoding using FFmpeg.
 * Supports hardware acceleration, multiple codecs, and streaming output.
 */
class FFmpegPlugin : public Plugin {
public:
    FFmpegPlugin();
    ~FFmpegPlugin() override;
    
    // ========================================================================
    // Plugin Interface
    // ========================================================================
    
    PluginInfo info() const override;
    PluginCapabilities capabilities() const override;
    
    Result<void> initialize(const std::string& config_path) override;
    void shutdown() override;
    bool is_healthy() const override;
    
    bool can_handle(JobType type, const JobParams& params) const override;
    
    Result<std::string> process(
        const JobRequest& request,
        JobProgressCallback progress_callback
    ) override;
    
    Result<void> cancel(const std::string& job_id) override;
    
    // Streaming support
    Result<std::string> start_stream(
        const std::string& channel_id,
        const std::map<std::string, std::string>& source,
        const std::map<std::string, std::string>& output
    ) override;
    
    Result<void> stop_stream(const std::string& channel_id) override;
    
    // ========================================================================
    // FFmpeg-specific Methods
    // ========================================================================
    
    /**
     * Get media info using ffprobe
     * @param path Path to media file
     * @return Result with media info JSON or error
     */
    Result<std::string> probe(const std::string& path);
    
    /**
     * Get video duration in seconds
     */
    Result<double> get_duration(const std::string& path);
    
    /**
     * Get available hardware encoders
     */
    std::vector<std::string> get_available_encoders();
    
    /**
     * Check if codec is available
     */
    bool is_codec_available(const std::string& codec);
    
private:
    /**
     * Build FFmpeg command for video transcoding
     */
    std::vector<std::string> build_video_command(
        const VideoTranscodeParams& params
    );
    
    /**
     * Build FFmpeg command for audio transcoding
     */
    std::vector<std::string> build_audio_command(
        const AudioTranscodeParams& params
    );
    
    /**
     * Build FFmpeg command for HLS streaming
     */
    std::vector<std::string> build_hls_command(
        const std::string& input,
        const std::string& output_dir,
        const std::map<std::string, std::string>& options
    );
    
    /**
     * Execute FFmpeg command with progress tracking
     */
    Result<void> execute_ffmpeg(
        const std::vector<std::string>& args,
        const std::string& job_id,
        double total_duration,
        JobProgressCallback progress_callback
    );
    
    /**
     * Parse FFmpeg progress output
     */
    JobProgress parse_progress(
        const std::string& output,
        double total_duration
    );
    
    /**
     * Detect available hardware acceleration
     */
    FFmpegConfig::HwAccel detect_hardware_accel();
    
    /**
     * Get hardware encoder name for codec
     */
    std::string get_hw_encoder(const std::string& codec);
    
    // Configuration
    FFmpegConfig config_;
    bool initialized_ = false;
    
    // Active jobs/streams
    struct ProcessInfo {
        int pid = 0;
        std::atomic<bool> cancelled{false};

        ProcessInfo() = default;
        // std::atomic is not movable — provide explicit move ops that reset the value
        ProcessInfo(ProcessInfo&& o) noexcept : pid(o.pid), cancelled(o.cancelled.load()) {}
        ProcessInfo& operator=(ProcessInfo&& o) noexcept {
            pid = o.pid;
            cancelled.store(o.cancelled.load());
            return *this;
        }
    };
    
    mutable std::mutex processes_mutex_;
    std::map<std::string, ProcessInfo> active_processes_;
    
    // Cached probe data
    mutable std::mutex cache_mutex_;
    std::map<std::string, std::string> probe_cache_;
};

} // namespace plugins
} // namespace media
