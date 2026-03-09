#pragma once

#include <drogon/HttpResponse.h>
#include <map>
#include <mutex>
#include <string>
#include <vector>

namespace media {

/**
 * StreamBroadcaster
 *
 * Thread-safe broadcaster that maintains a map of mount names to active
 * Drogon ResponseStreamWriter listeners. Audio chunks are broadcast to all
 * connected listeners; dead connections (send() == false) are pruned
 * automatically on each write.
 */
class StreamBroadcaster {
public:
    StreamBroadcaster() = default;
    ~StreamBroadcaster() = default;

    // Non-copyable, non-movable
    StreamBroadcaster(const StreamBroadcaster&) = delete;
    StreamBroadcaster& operator=(const StreamBroadcaster&) = delete;

    // ========================================================================
    // Mount management
    // ========================================================================

    /**
     * Create an empty mount point.
     * Idempotent — safe to call if the mount already exists.
     */
    void create_mount(const std::string& mount);

    /**
     * Remove a mount point and close all attached listeners.
     */
    void remove_mount(const std::string& mount);

    /**
     * Return true if the mount exists (was created and not yet removed).
     */
    bool is_active(const std::string& mount) const;

    // ========================================================================
    // Listener management
    // ========================================================================

    /**
     * Register a new Drogon async-stream writer for the given mount.
     * The caller must ensure the mount exists before calling this.
     */
    void add_listener(const std::string& mount, drogon::ResponseStreamPtr stream);

    // ========================================================================
    // Broadcasting
    // ========================================================================

    /**
     * Send `len` bytes from `data` to every listener on `mount`.
     * Listeners whose send() returns false are removed from the list.
     */
    void write(const std::string& mount, const char* data, size_t len);

private:
    // One mutex per mount so writers on different mounts don't block each other
    struct MountState {
        std::mutex mutex;
        std::vector<drogon::ResponseStreamPtr> listeners;
    };

    mutable std::mutex mounts_mutex_;
    std::map<std::string, std::unique_ptr<MountState>> mounts_;
};

} // namespace media
