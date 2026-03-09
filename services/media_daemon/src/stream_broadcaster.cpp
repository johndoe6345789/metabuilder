#include "media/stream_broadcaster.hpp"
#include <algorithm>
#include <iostream>

namespace media {

// ============================================================================
// Mount management
// ============================================================================

void StreamBroadcaster::create_mount(const std::string& mount) {
    std::lock_guard<std::mutex> lock(mounts_mutex_);
    if (mounts_.count(mount) == 0) {
        mounts_[mount] = std::make_unique<MountState>();
        std::cout << "[StreamBroadcaster] Created mount: " << mount << std::endl;
    }
}

void StreamBroadcaster::remove_mount(const std::string& mount) {
    std::unique_ptr<MountState> dying;

    {
        std::lock_guard<std::mutex> lock(mounts_mutex_);
        auto it = mounts_.find(mount);
        if (it == mounts_.end()) return;
        // Move ownership out so we can close listeners without holding mounts_mutex_
        dying = std::move(it->second);
        mounts_.erase(it);
    }

    // Close all listeners on the dying mount
    if (dying) {
        std::lock_guard<std::mutex> mlock(dying->mutex);
        for (auto& stream : dying->listeners) {
            if (stream) {
                stream->close();
            }
        }
        dying->listeners.clear();
    }

    std::cout << "[StreamBroadcaster] Removed mount: " << mount << std::endl;
}

bool StreamBroadcaster::is_active(const std::string& mount) const {
    std::lock_guard<std::mutex> lock(mounts_mutex_);
    return mounts_.count(mount) > 0;
}

// ============================================================================
// Listener management
// ============================================================================

void StreamBroadcaster::add_listener(
    const std::string& mount,
    drogon::ResponseStreamPtr stream
) {
    std::lock_guard<std::mutex> lock(mounts_mutex_);
    auto it = mounts_.find(mount);
    if (it == mounts_.end()) {
        // Mount has been removed; close the stream immediately
        if (stream) stream->close();
        return;
    }

    MountState& ms = *it->second;
    {
        std::lock_guard<std::mutex> mlock(ms.mutex);
        ms.listeners.push_back(std::move(stream));
    }
    std::cout << "[StreamBroadcaster] Listener added to mount: " << mount << std::endl;
}

// ============================================================================
// Broadcasting
// ============================================================================

void StreamBroadcaster::write(
    const std::string& mount,
    const char* data,
    size_t len
) {
    MountState* ms = nullptr;

    {
        std::lock_guard<std::mutex> lock(mounts_mutex_);
        auto it = mounts_.find(mount);
        if (it == mounts_.end()) return;
        ms = it->second.get();
    }

    // Broadcast to all listeners, collecting dead ones
    std::lock_guard<std::mutex> mlock(ms->mutex);

    std::string chunk(data, len);

    ms->listeners.erase(
        std::remove_if(
            ms->listeners.begin(),
            ms->listeners.end(),
            [&chunk](const drogon::ResponseStreamPtr& stream) -> bool {
                if (!stream) return true;           // null — remove
                bool alive = stream->send(chunk);   // false == disconnected
                if (!alive) {
                    std::cout << "[StreamBroadcaster] Dead listener removed" << std::endl;
                }
                return !alive;
            }
        ),
        ms->listeners.end()
    );
}

} // namespace media
