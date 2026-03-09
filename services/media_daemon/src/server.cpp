#include "media/server.hpp"
#include "media/plugins/ffmpeg_plugin.hpp"
#include "media/plugins/pandoc_plugin.hpp"
#include "media/stream_broadcaster.hpp"
#include <drogon/drogon.h>
#include <iostream>
#include <sstream>

// Route handler includes
#include "routes/health_routes.hpp"
#include "routes/job_routes.hpp"
#include "routes/radio_routes.hpp"
#include "routes/tv_routes.hpp"
#include "routes/plugin_routes.hpp"

namespace media {

// Pimpl: Drogon app is a singleton, but we store route context here
struct Server::Impl {
    // Route handler instances hold references to server components
    std::unique_ptr<routes::HealthRoutes> health;
    std::unique_ptr<routes::JobRoutes> jobs;
    std::unique_ptr<routes::RadioRoutes> radio;
    std::unique_ptr<routes::TvRoutes> tv;
    std::unique_ptr<routes::PluginRoutes> plugins;

    // Native HTTP audio broadcaster (replaces external Icecast)
    std::unique_ptr<StreamBroadcaster> broadcaster;
};

Server::Server()
    : plugin_manager_(std::make_unique<PluginManager>())
    , job_queue_(std::make_unique<JobQueue>())
    , radio_engine_(std::make_unique<RadioEngine>())
    , tv_engine_(std::make_unique<TvEngine>())
    , dbal_client_(std::make_unique<DbalClient>())
    , impl_(std::make_unique<Impl>())
{}

Server::~Server() {
    stop();
}

// ============================================================================
// Lifecycle
// ============================================================================

Result<void> Server::initialize(const ServerConfig& config) {
    if (initialized_.load()) {
        return Result<void>::ok();
    }

    config_ = config;

    std::cout << "[Server] Initializing components..." << std::endl;

    // Initialize DBAL client
    auto dbal_result = dbal_client_->initialize(config.dbal);
    if (dbal_result.is_error()) {
        std::cerr << "[Server] DBAL client init warning: " << dbal_result.error_message() << std::endl;
        // Non-fatal - continue without DBAL
    }

    // Initialize plugin manager
    auto pm_result = plugin_manager_->initialize(config.plugin_dir, "");
    if (pm_result.is_error()) {
        return pm_result;
    }

    // Register built-in plugins
    auto reg_result = register_builtin_plugins();
    if (reg_result.is_error()) {
        std::cerr << "[Server] Plugin registration warning: "
                  << reg_result.error_message() << std::endl;
        // Non-fatal
    }

    // Configure job queue notification callback
    auto notify_cb = [this](const Notification& n) {
        dbal_client_->send_notification(n);
    };
    config_.job_queue.notification_callback = notify_cb;

    // Initialize job queue
    auto jq_result = job_queue_->initialize(config.job_queue, plugin_manager_.get());
    if (jq_result.is_error()) {
        return jq_result;
    }

    // Initialize radio engine
    if (config.radio_enabled) {
        config_.radio.notification_callback = notify_cb;
        auto re_result = radio_engine_->initialize(config.radio, plugin_manager_.get());
        if (re_result.is_error()) {
            std::cerr << "[Server] Radio engine init warning: "
                      << re_result.error_message() << std::endl;
        }
    }

    // Initialize TV engine
    if (config.tv_enabled) {
        config_.tv.notification_callback = notify_cb;
        auto tv_result = tv_engine_->initialize(config.tv, plugin_manager_.get());
        if (tv_result.is_error()) {
            std::cerr << "[Server] TV engine init warning: "
                      << tv_result.error_message() << std::endl;
        }
    }

    // Instantiate the native audio broadcaster and wire it to RadioEngine
    impl_->broadcaster = std::make_unique<StreamBroadcaster>();
    radio_engine_->set_broadcaster(impl_->broadcaster.get());

    // Set up route handlers
    impl_->health = std::make_unique<routes::HealthRoutes>(
        *plugin_manager_, *job_queue_, *radio_engine_, *tv_engine_
    );
    impl_->jobs = std::make_unique<routes::JobRoutes>(*job_queue_);
    impl_->radio = std::make_unique<routes::RadioRoutes>(*radio_engine_);
    impl_->radio->set_broadcaster(impl_->broadcaster.get());
    impl_->tv = std::make_unique<routes::TvRoutes>(*tv_engine_);
    impl_->plugins = std::make_unique<routes::PluginRoutes>(*plugin_manager_);

    // Set up Drogon
    setup_middleware();
    setup_routes();

    initialized_.store(true);
    std::cout << "[Server] Initialized successfully" << std::endl;
    return Result<void>::ok();
}

void Server::run() {
    if (!initialized_.load()) {
        std::cerr << "[Server] Cannot run: not initialized" << std::endl;
        return;
    }

    running_.store(true);
    job_queue_->start();

    std::cout << "[Server] Starting Drogon on "
              << config_.bind_address << ":" << config_.port << std::endl;

    // Log to stdout only (no file — avoids permission issues with non-root container user)
    drogon::app()
        .setLogLevel(config_.development_mode
            ? trantor::Logger::kTrace : trantor::Logger::kInfo)
        .addListener(config_.bind_address, config_.port)
        .setThreadNum(config_.workers)
        .run();

    running_.store(false);
}

void Server::start() {
    if (!initialized_.load()) {
        std::cerr << "[Server] Cannot start: not initialized" << std::endl;
        return;
    }

    running_.store(true);
    job_queue_->start();
}

void Server::stop() {
    if (!running_.load()) return;

    std::cout << "[Server] Stopping..." << std::endl;

    job_queue_->stop(false);

    if (radio_engine_) radio_engine_->shutdown();
    if (tv_engine_) tv_engine_->shutdown();
    if (plugin_manager_) plugin_manager_->shutdown();

    running_.store(false);

    // Stop Drogon event loop
    drogon::app().quit();

    std::cout << "[Server] Stopped" << std::endl;
}

// ============================================================================
// Private: Middleware & Routes
// ============================================================================

void Server::setup_middleware() {
    // CORS
    if (config_.cors_enabled) {
        drogon::app().registerPreHandlingAdvice(
            [this](const drogon::HttpRequestPtr& req,
                   drogon::AdviceCallback&& acb,
                   drogon::AdviceChainCallback&& accb) {
                if (req->getMethod() == drogon::Options) {
                    auto resp = drogon::HttpResponse::newHttpResponse();
                    resp->addHeader("Access-Control-Allow-Origin", "*");
                    resp->addHeader("Access-Control-Allow-Methods",
                                   "GET, POST, PUT, DELETE, OPTIONS");
                    resp->addHeader("Access-Control-Allow-Headers",
                                   "Content-Type, X-API-Key, Authorization");
                    resp->setStatusCode(drogon::k204NoContent);
                    acb(resp);
                } else {
                    accb();
                }
            }
        );

        drogon::app().registerPostHandlingAdvice(
            [](const drogon::HttpRequestPtr& req,
               const drogon::HttpResponsePtr& resp) {
                resp->addHeader("Access-Control-Allow-Origin", "*");
                resp->addHeader("Access-Control-Allow-Methods",
                               "GET, POST, PUT, DELETE, OPTIONS");
                resp->addHeader("Access-Control-Allow-Headers",
                               "Content-Type, X-API-Key, Authorization");
            }
        );
    }
}

void Server::setup_routes() {
    // ========================================================================
    // Health & Metrics
    // ========================================================================

    drogon::app().registerHandler(
        "/health",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
            impl_->health->handle_health(req, std::move(cb));
        },
        {drogon::Get}
    );

    drogon::app().registerHandler(
        "/metrics",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
            impl_->health->handle_metrics(req, std::move(cb));
        },
        {drogon::Get}
    );

    // ========================================================================
    // Jobs
    // ========================================================================

    drogon::app().registerHandler(
        "/api/jobs",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
            if (req->getMethod() == drogon::Post) {
                impl_->jobs->handle_create_job(req, std::move(cb));
            } else {
                impl_->jobs->handle_list_jobs(req, std::move(cb));
            }
        },
        {drogon::Get, drogon::Post}
    );

    drogon::app().registerHandler(
        "/api/jobs/{id}",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            if (req->getMethod() == drogon::Delete) {
                impl_->jobs->handle_cancel_job(req, std::move(cb), id);
            } else {
                impl_->jobs->handle_get_job(req, std::move(cb), id);
            }
        },
        {drogon::Get, drogon::Delete}
    );

    // ========================================================================
    // Radio
    // ========================================================================

    drogon::app().registerHandler(
        "/api/radio/channels",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
            if (req->getMethod() == drogon::Post) {
                impl_->radio->handle_create_channel(req, std::move(cb));
            } else {
                impl_->radio->handle_list_channels(req, std::move(cb));
            }
        },
        {drogon::Get, drogon::Post}
    );

    drogon::app().registerHandler(
        "/api/radio/channels/{id}",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            impl_->radio->handle_get_channel(req, std::move(cb), id);
        },
        {drogon::Get}
    );

    drogon::app().registerHandler(
        "/api/radio/channels/{id}/start",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            impl_->radio->handle_start_channel(req, std::move(cb), id);
        },
        {drogon::Post}
    );

    drogon::app().registerHandler(
        "/api/radio/channels/{id}/stop",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            impl_->radio->handle_stop_channel(req, std::move(cb), id);
        },
        {drogon::Post}
    );

    drogon::app().registerHandler(
        "/api/radio/channels/{id}/playlist",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            impl_->radio->handle_set_playlist(req, std::move(cb), id);
        },
        {drogon::Put}
    );

    drogon::app().registerHandler(
        "/api/radio/channels/{id}/now",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            impl_->radio->handle_now_playing(req, std::move(cb), id);
        },
        {drogon::Get}
    );

    // Audio stream endpoint — listeners connect here for live MP3 streaming
    // nginx-stream proxies /stream/ requests here from port 8088.
    drogon::app().registerHandler(
        "/stream/{1}",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& mount) {
            impl_->radio->handle_stream(req, std::move(cb), mount);
        },
        {drogon::Get}
    );

    // ========================================================================
    // TV
    // ========================================================================

    drogon::app().registerHandler(
        "/api/tv/channels",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
            if (req->getMethod() == drogon::Post) {
                impl_->tv->handle_create_channel(req, std::move(cb));
            } else {
                impl_->tv->handle_list_channels(req, std::move(cb));
            }
        },
        {drogon::Get, drogon::Post}
    );

    drogon::app().registerHandler(
        "/api/tv/channels/{id}",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            impl_->tv->handle_get_channel(req, std::move(cb), id);
        },
        {drogon::Get}
    );

    drogon::app().registerHandler(
        "/api/tv/channels/{id}/start",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            impl_->tv->handle_start_channel(req, std::move(cb), id);
        },
        {drogon::Post}
    );

    drogon::app().registerHandler(
        "/api/tv/channels/{id}/stop",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            impl_->tv->handle_stop_channel(req, std::move(cb), id);
        },
        {drogon::Post}
    );

    drogon::app().registerHandler(
        "/api/tv/channels/{id}/schedule",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            impl_->tv->handle_get_schedule(req, std::move(cb), id);
        },
        {drogon::Get}
    );

    drogon::app().registerHandler(
        "/api/tv/epg",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
            impl_->tv->handle_get_epg(req, std::move(cb));
        },
        {drogon::Get}
    );

    // ========================================================================
    // Plugins
    // ========================================================================

    drogon::app().registerHandler(
        "/api/plugins",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
            impl_->plugins->handle_list_plugins(req, std::move(cb));
        },
        {drogon::Get}
    );

    drogon::app().registerHandler(
        "/api/plugins/{id}/reload",
        [this](const drogon::HttpRequestPtr& req,
               std::function<void(const drogon::HttpResponsePtr&)>&& cb,
               const std::string& id) {
            impl_->plugins->handle_reload_plugin(req, std::move(cb), id);
        },
        {drogon::Post}
    );

    std::cout << "[Server] Routes registered" << std::endl;
}

Result<void> Server::register_builtin_plugins() {
    // FFmpeg plugin
    auto ffmpeg = std::make_unique<plugins::FFmpegPlugin>();
    auto ffmpeg_init = ffmpeg->initialize("");
    if (ffmpeg_init.is_error()) {
        std::cerr << "[Server] FFmpeg plugin init warning: "
                  << ffmpeg_init.error_message() << std::endl;
        // Still register it - it may handle degraded mode
    }
    auto reg1 = plugin_manager_->register_builtin(std::move(ffmpeg));
    if (reg1.is_error()) {
        std::cerr << "[Server] FFmpeg registration failed: " << reg1.error_message() << std::endl;
    }

    // Pandoc plugin
    auto pandoc = std::make_unique<plugins::PandocPlugin>();
    auto pandoc_init = pandoc->initialize("");
    if (pandoc_init.is_error()) {
        std::cerr << "[Server] Pandoc plugin init warning: "
                  << pandoc_init.error_message() << std::endl;
    }
    auto reg2 = plugin_manager_->register_builtin(std::move(pandoc));
    if (reg2.is_error()) {
        std::cerr << "[Server] Pandoc registration failed: " << reg2.error_message() << std::endl;
    }

    return Result<void>::ok();
}

// ============================================================================
// Unused route handle stubs (declared in header, delegated to route classes)
// ============================================================================

void Server::handle_health() {}
void Server::handle_metrics() {}
void Server::handle_create_job() {}
void Server::handle_get_job() {}
void Server::handle_list_jobs() {}
void Server::handle_cancel_job() {}
void Server::handle_create_radio_channel() {}
void Server::handle_get_radio_channel() {}
void Server::handle_list_radio_channels() {}
void Server::handle_start_radio() {}
void Server::handle_stop_radio() {}
void Server::handle_set_playlist() {}
void Server::handle_get_now_playing() {}
void Server::handle_create_tv_channel() {}
void Server::handle_get_tv_channel() {}
void Server::handle_list_tv_channels() {}
void Server::handle_start_tv() {}
void Server::handle_stop_tv() {}
void Server::handle_set_schedule() {}
void Server::handle_get_epg() {}
void Server::handle_list_plugins() {}
void Server::handle_reload_plugin() {}

} // namespace media
