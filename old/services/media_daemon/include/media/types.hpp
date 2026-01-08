#pragma once

#include <string>
#include <vector>
#include <memory>
#include <functional>
#include <chrono>
#include <optional>
#include <variant>
#include <map>

namespace media {

// Forward declarations
class Plugin;
class Job;
class RadioChannel;
class TvChannel;

// ============================================================================
// Error Handling (following DBAL patterns)
// ============================================================================

enum class ErrorCode {
    OK = 0,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    VALIDATION_ERROR = 422,
    INTERNAL_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
    TIMEOUT = 504,
    PLUGIN_ERROR = 1001,
    TRANSCODE_ERROR = 1002,
    STREAM_ERROR = 1003,
    STORAGE_ERROR = 1004
};

template<typename T>
class Result {
public:
    static Result<T> ok(T value) {
        Result<T> r;
        r.value_ = std::move(value);
        r.error_code_ = ErrorCode::OK;
        return r;
    }
    
    static Result<T> error(ErrorCode code, const std::string& message) {
        Result<T> r;
        r.error_code_ = code;
        r.error_message_ = message;
        return r;
    }
    
    bool is_ok() const { return error_code_ == ErrorCode::OK; }
    bool is_error() const { return error_code_ != ErrorCode::OK; }
    
    const T& value() const { return value_; }
    T& value() { return value_; }
    
    ErrorCode error_code() const { return error_code_; }
    const std::string& error_message() const { return error_message_; }
    
private:
    T value_;
    ErrorCode error_code_ = ErrorCode::OK;
    std::string error_message_;
};

// Specialization for void
template<>
class Result<void> {
public:
    static Result<void> ok() {
        Result<void> r;
        r.error_code_ = ErrorCode::OK;
        return r;
    }
    
    static Result<void> error(ErrorCode code, const std::string& message) {
        Result<void> r;
        r.error_code_ = code;
        r.error_message_ = message;
        return r;
    }
    
    bool is_ok() const { return error_code_ == ErrorCode::OK; }
    bool is_error() const { return error_code_ != ErrorCode::OK; }
    
    ErrorCode error_code() const { return error_code_; }
    const std::string& error_message() const { return error_message_; }
    
private:
    ErrorCode error_code_ = ErrorCode::OK;
    std::string error_message_;
};

// ============================================================================
// Job Types
// ============================================================================

enum class JobType {
    // Transcoding
    VIDEO_TRANSCODE,
    AUDIO_TRANSCODE,
    DOCUMENT_CONVERT,
    IMAGE_PROCESS,
    
    // Radio plugin jobs
    RadioStream,        ///< Start/manage radio streaming
    RadioIngest,        ///< Ingest audio into radio queue
    
    // TV plugin jobs
    TvBroadcast,        ///< Start/manage TV broadcast
    TvSegment,          ///< Process TV segment for schedule
    TvEpgGenerate,      ///< Generate EPG data
    
    // Libretro plugin jobs
    RetroSession,       ///< Start retro gaming session
    RetroRecord,        ///< Record gameplay
    RetroStream,        ///< Stream gameplay
    
    // Generic
    CUSTOM
};

enum class JobStatus {
    PENDING,
    QUEUED,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED
};

enum class JobPriority {
    URGENT = 0,
    HIGH = 1,
    NORMAL = 2,
    LOW = 3,
    BACKGROUND = 4
};

struct JobProgress {
    double percent = 0.0;          // 0-100
    std::string stage;             // Current stage (e.g., "encoding", "muxing")
    std::string eta;               // Estimated time remaining
    size_t bytes_processed = 0;
    size_t bytes_total = 0;
};

struct VideoTranscodeParams {
    std::string input_path;
    std::string output_path;
    std::string codec = "h264";    // h264, h265, vp9, av1
    int width = 0;                 // 0 = auto
    int height = 0;
    int bitrate_kbps = 0;          // 0 = auto
    std::string preset = "fast";
    std::string audio_codec = "aac";
    int audio_bitrate_kbps = 128;
    std::map<std::string, std::string> extra_params;
};

struct AudioTranscodeParams {
    std::string input_path;
    std::string output_path;
    std::string codec = "mp3";     // mp3, aac, flac, opus
    int bitrate_kbps = 128;
    int sample_rate = 44100;
    int channels = 2;
    bool normalize = true;
    double target_lufs = -14.0;
};

struct DocumentConvertParams {
    std::string input_path;
    std::string output_path;
    std::string output_format;     // pdf, docx, html, etc.
    std::string template_path;
    std::map<std::string, std::string> variables;
};

struct ImageProcessParams {
    std::string input_path;
    std::string output_path;
    std::string format;            // jpg, png, webp, avif
    int width = 0;
    int height = 0;
    int quality = 85;
    bool preserve_aspect = true;
    std::vector<std::string> filters;  // blur, sharpen, etc.
};

using JobParams = std::variant<
    VideoTranscodeParams,
    AudioTranscodeParams,
    DocumentConvertParams,
    ImageProcessParams,
    std::map<std::string, std::string>  // Custom params
>;

struct JobRequest {
    std::string id;                // Auto-generated if empty
    std::string tenant_id;
    std::string user_id;
    JobType type;
    JobPriority priority = JobPriority::NORMAL;
    JobParams params;
    std::string callback_url;      // Webhook on completion
    bool notify_user = true;       // Send DBAL notification
    std::map<std::string, std::string> metadata;
};

struct JobInfo {
    std::string id;
    std::string tenant_id;
    std::string user_id;
    JobType type;
    JobStatus status;
    JobPriority priority;
    JobProgress progress;
    std::chrono::system_clock::time_point created_at;
    std::chrono::system_clock::time_point started_at;
    std::chrono::system_clock::time_point completed_at;
    std::string error_message;
    std::string output_path;
    std::map<std::string, std::string> metadata;
};

// ============================================================================
// Radio Types
// ============================================================================

struct RadioTrack {
    std::string id;
    std::string path;
    std::string title;
    std::string artist;
    std::string album;
    std::string artwork_url;
    int duration_ms = 0;
    std::map<std::string, std::string> metadata;
};

struct RadioPlaylistEntry {
    RadioTrack track;
    std::chrono::system_clock::time_point scheduled_at;
    bool played = false;
};

struct RadioChannelConfig {
    std::string id;
    std::string tenant_id;
    std::string name;
    std::string description;
    std::string artwork_url;
    
    // Audio settings
    int bitrate_kbps = 128;
    std::string codec = "mp3";
    int sample_rate = 44100;
    
    // Crossfade
    bool crossfade_enabled = true;
    int crossfade_ms = 3000;
    
    // Auto-DJ settings
    bool auto_dj_enabled = true;
    std::vector<std::string> auto_dj_folders;
    bool shuffle = true;
};

struct RadioChannelStatus {
    std::string id;
    std::string name;
    bool is_live = false;
    int listeners = 0;
    std::optional<RadioTrack> now_playing;
    std::optional<RadioTrack> next_track;
    int uptime_seconds = 0;
    std::string stream_url;
};

// ============================================================================
// TV Channel Types
// ============================================================================

struct TvProgram {
    std::string id;
    std::string title;
    std::string description;
    std::string category;          // movie, series, news, sports, etc.
    std::string content_path;      // Video file or playlist
    int duration_seconds = 0;
    std::string thumbnail_url;
    std::string rating;            // G, PG, PG-13, R, etc.
    std::map<std::string, std::string> metadata;
};

struct TvScheduleEntry {
    TvProgram program;
    std::chrono::system_clock::time_point start_time;
    std::chrono::system_clock::time_point end_time;
    bool is_live = false;
    std::string bumper_before;     // Pre-roll video
    std::string bumper_after;      // Post-roll video
};

struct TvChannelConfig {
    std::string id;
    std::string tenant_id;
    std::string name;
    std::string description;
    std::string logo_url;
    int channel_number = 0;
    
    // Video settings
    std::vector<std::string> resolutions;  // 1080p, 720p, 480p
    std::string codec = "h264";
    
    // HLS settings
    int segment_duration_seconds = 4;
    int playlist_size = 10;
    
    // Filler content (when nothing scheduled)
    std::string filler_playlist;
    std::string offline_image;
};

struct TvChannelStatus {
    std::string id;
    std::string name;
    int channel_number;
    bool is_live = false;
    std::optional<TvProgram> now_playing;
    std::optional<TvProgram> next_program;
    int viewers = 0;
    std::string hls_url;
    std::string dash_url;
};

struct EpgEntry {
    std::string channel_id;
    std::string channel_name;
    TvProgram program;
    std::chrono::system_clock::time_point start_time;
    std::chrono::system_clock::time_point end_time;
};

// ============================================================================
// Plugin Types
// ============================================================================

enum class PluginType {
    TRANSCODER,      // Video/audio transcoding
    PROCESSOR,       // Image/document processing
    STREAMER,        // Streaming output
    ANALYZER,        // Media analysis
    CUSTOM
};

struct PluginInfo {
    std::string id;
    std::string name;
    std::string version;
    std::string author;
    std::string description;
    PluginType type;
    std::vector<std::string> supported_formats;
    std::vector<std::string> capabilities;
    bool is_loaded = false;
    bool is_builtin = false;
};

struct PluginCapabilities {
    bool supports_video = false;
    bool supports_audio = false;
    bool supports_image = false;
    bool supports_document = false;
    bool supports_streaming = false;
    bool supports_hardware_accel = false;
    std::vector<std::string> input_formats;
    std::vector<std::string> output_formats;
};

// ============================================================================
// Notification Types (for DBAL integration)
// ============================================================================

enum class NotificationType {
    JOB_STARTED,
    JOB_PROGRESS,
    JOB_COMPLETED,
    JOB_FAILED,
    STREAM_STARTED,
    STREAM_STOPPED,
    CHANNEL_LIVE,
    CHANNEL_OFFLINE
};

struct Notification {
    std::string tenant_id;
    std::string user_id;
    NotificationType type;
    std::string title;
    std::string message;
    std::string icon;              // success, error, warning, info
    std::map<std::string, std::string> data;
};

// ============================================================================
// Callback Types
// ============================================================================

using JobProgressCallback = std::function<void(const std::string& job_id, const JobProgress& progress)>;
using JobCompletionCallback = std::function<void(const std::string& job_id, bool success, const std::string& result)>;
using NotificationCallback = std::function<void(const Notification& notification)>;

} // namespace media
