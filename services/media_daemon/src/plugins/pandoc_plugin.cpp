#include "media/plugins/pandoc_plugin.hpp"
#include <iostream>
#include <fstream>
#include <sstream>
#include <array>
#include <cstdio>
#include <filesystem>

#ifdef _WIN32
    #include <windows.h>
#else
    #include <unistd.h>
    #include <sys/wait.h>
    #include <signal.h>
#endif

namespace media {
namespace plugins {

PandocPlugin::PandocPlugin() = default;
PandocPlugin::~PandocPlugin() = default;

PluginInfo PandocPlugin::info() const {
    return PluginInfo{
        .id = "pandoc",
        .name = "Pandoc Document Converter",
        .version = "1.0.0",
        .author = "MetaBuilder",
        .description = "Document conversion using Pandoc - supports Markdown, HTML, LaTeX, DOCX, PDF, EPUB, and more",
        .type = PluginType::PROCESSOR,
        .supported_formats = {
            "md", "markdown", "html", "htm", "tex", "latex",
            "docx", "odt", "epub", "rst", "org", "txt",
            "pdf", "json", "yaml"
        },
        .capabilities = {
            "markdown_to_pdf", "markdown_to_html", "markdown_to_docx",
            "html_to_pdf", "docx_to_pdf", "latex_to_pdf",
            "syntax_highlighting", "table_of_contents", "custom_templates"
        },
        .is_loaded = initialized_,
        .is_builtin = true
    };
}

PluginCapabilities PandocPlugin::capabilities() const {
    PluginCapabilities caps;
    caps.supports_video = false;
    caps.supports_audio = false;
    caps.supports_image = false;
    caps.supports_document = true;
    caps.supports_streaming = false;
    caps.supports_hardware_accel = false;
    caps.input_formats = {
        "md", "markdown", "gfm", "commonmark",
        "html", "htm",
        "tex", "latex",
        "docx", "odt",
        "rst", "org", "txt",
        "json", "yaml"
    };
    caps.output_formats = {
        "pdf", "html", "html5",
        "docx", "odt", "rtf",
        "epub", "epub3",
        "latex", "beamer",
        "markdown", "gfm",
        "plain", "json"
    };
    return caps;
}

Result<void> PandocPlugin::initialize(const std::string& config_path) {
    std::cout << "[PandocPlugin] Initializing..." << std::endl;
    
    // Check if pandoc is available
    std::string version_cmd = config_.pandoc_path + " --version";
    int result = std::system(version_cmd.c_str());
    if (result != 0) {
        return Result<void>::error(
            ErrorCode::SERVICE_UNAVAILABLE,
            "Pandoc not found at: " + config_.pandoc_path
        );
    }
    
    // Load config if provided
    if (!config_path.empty() && std::filesystem::exists(config_path)) {
        // Parse YAML config...
        std::cout << "[PandocPlugin] Loading config from: " << config_path << std::endl;
    }
    
    initialized_ = true;
    std::cout << "[PandocPlugin] Initialized successfully" << std::endl;
    return Result<void>::ok();
}

void PandocPlugin::shutdown() {
    std::cout << "[PandocPlugin] Shutting down..." << std::endl;
    
    // Cancel any active jobs
    std::lock_guard<std::mutex> lock(jobs_mutex_);
    for (auto& [job_id, pid] : active_pids_) {
        if (pid > 0) {
#ifdef _WIN32
            // Windows: terminate process
            HANDLE hProcess = OpenProcess(PROCESS_TERMINATE, FALSE, pid);
            if (hProcess) {
                TerminateProcess(hProcess, 1);
                CloseHandle(hProcess);
            }
#else
            // Unix: send SIGTERM
            kill(pid, SIGTERM);
#endif
        }
    }
    active_pids_.clear();
    
    initialized_ = false;
}

bool PandocPlugin::is_healthy() const {
    return initialized_;
}

bool PandocPlugin::can_handle(JobType type, const JobParams& params) const {
    if (type != JobType::DOCUMENT_CONVERT) {
        return false;
    }
    
    if (auto* doc_params = std::get_if<DocumentConvertParams>(&params)) {
        std::string input_ext = detect_format(doc_params->input_path);
        std::string output_ext = doc_params->output_format;
        return supports_conversion(input_ext, output_ext);
    }
    
    return false;
}

Result<std::string> PandocPlugin::process(
    const JobRequest& request,
    JobProgressCallback progress_callback
) {
    if (!initialized_) {
        return Result<std::string>::error(
            ErrorCode::SERVICE_UNAVAILABLE,
            "Pandoc plugin not initialized"
        );
    }
    
    auto* doc_params = std::get_if<DocumentConvertParams>(&request.params);
    if (!doc_params) {
        return Result<std::string>::error(
            ErrorCode::VALIDATION_ERROR,
            "Invalid parameters for document conversion"
        );
    }
    
    // Detect formats
    std::string from_format = detect_format(doc_params->input_path);
    std::string to_format = doc_params->output_format;
    
    if (!supports_conversion(from_format, to_format)) {
        return Result<std::string>::error(
            ErrorCode::VALIDATION_ERROR,
            "Unsupported conversion: " + from_format + " → " + to_format
        );
    }
    
    // Build options map
    std::map<std::string, std::string> options = doc_params->variables;
    if (!doc_params->template_path.empty()) {
        options["template"] = doc_params->template_path;
    }
    
    // Report starting
    if (progress_callback) {
        progress_callback(request.id, JobProgress{
            .percent = 0.0,
            .stage = "preparing"
        });
    }
    
    // Build command
    auto args = build_command(
        doc_params->input_path,
        doc_params->output_path,
        from_format,
        to_format,
        options
    );
    
    // Execute
    if (progress_callback) {
        progress_callback(request.id, JobProgress{
            .percent = 20.0,
            .stage = "converting"
        });
    }
    
    auto result = execute_pandoc(args, request.id, progress_callback);
    if (result.is_error()) {
        return Result<std::string>::error(result.error_code(), result.error_message());
    }
    
    // Verify output exists
    if (!std::filesystem::exists(doc_params->output_path)) {
        return Result<std::string>::error(
            ErrorCode::INTERNAL_ERROR,
            "Output file was not created"
        );
    }
    
    if (progress_callback) {
        progress_callback(request.id, JobProgress{
            .percent = 100.0,
            .stage = "completed"
        });
    }
    
    return Result<std::string>::ok(doc_params->output_path);
}

Result<void> PandocPlugin::cancel(const std::string& job_id) {
    std::lock_guard<std::mutex> lock(jobs_mutex_);
    auto it = active_pids_.find(job_id);
    if (it == active_pids_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Job not found");
    }
    
    int pid = it->second;
    if (pid > 0) {
#ifdef _WIN32
        HANDLE hProcess = OpenProcess(PROCESS_TERMINATE, FALSE, pid);
        if (hProcess) {
            TerminateProcess(hProcess, 1);
            CloseHandle(hProcess);
        }
#else
        kill(pid, SIGTERM);
#endif
    }
    
    active_pids_.erase(it);
    return Result<void>::ok();
}

// ============================================================================
// Convenience Methods
// ============================================================================

Result<std::string> PandocPlugin::markdown_to_pdf(
    const std::string& input_path,
    const std::string& output_path,
    const std::map<std::string, std::string>& options
) {
    DocumentConvertParams params;
    params.input_path = input_path;
    params.output_path = output_path;
    params.output_format = "pdf";
    params.variables = options;
    
    JobRequest request;
    request.id = "md2pdf_" + std::to_string(std::time(nullptr));
    request.type = JobType::DOCUMENT_CONVERT;
    request.params = params;
    
    return process(request, nullptr);
}

Result<std::string> PandocPlugin::markdown_to_html(
    const std::string& input_path,
    const std::string& output_path,
    const std::map<std::string, std::string>& options
) {
    DocumentConvertParams params;
    params.input_path = input_path;
    params.output_path = output_path;
    params.output_format = "html";
    params.variables = options;
    
    JobRequest request;
    request.id = "md2html_" + std::to_string(std::time(nullptr));
    request.type = JobType::DOCUMENT_CONVERT;
    request.params = params;
    
    return process(request, nullptr);
}

Result<std::string> PandocPlugin::markdown_to_docx(
    const std::string& input_path,
    const std::string& output_path,
    const std::map<std::string, std::string>& options
) {
    DocumentConvertParams params;
    params.input_path = input_path;
    params.output_path = output_path;
    params.output_format = "docx";
    params.variables = options;
    
    JobRequest request;
    request.id = "md2docx_" + std::to_string(std::time(nullptr));
    request.type = JobType::DOCUMENT_CONVERT;
    request.params = params;
    
    return process(request, nullptr);
}

Result<std::string> PandocPlugin::html_to_pdf(
    const std::string& input_path,
    const std::string& output_path,
    const std::map<std::string, std::string>& options
) {
    DocumentConvertParams params;
    params.input_path = input_path;
    params.output_path = output_path;
    params.output_format = "pdf";
    params.variables = options;
    
    JobRequest request;
    request.id = "html2pdf_" + std::to_string(std::time(nullptr));
    request.type = JobType::DOCUMENT_CONVERT;
    request.params = params;
    
    return process(request, nullptr);
}

Result<std::string> PandocPlugin::docx_to_pdf(
    const std::string& input_path,
    const std::string& output_path,
    const std::map<std::string, std::string>& options
) {
    DocumentConvertParams params;
    params.input_path = input_path;
    params.output_path = output_path;
    params.output_format = "pdf";
    params.variables = options;
    
    JobRequest request;
    request.id = "docx2pdf_" + std::to_string(std::time(nullptr));
    request.type = JobType::DOCUMENT_CONVERT;
    request.params = params;
    
    return process(request, nullptr);
}

std::vector<std::string> PandocPlugin::get_input_formats() const {
    return capabilities().input_formats;
}

std::vector<std::string> PandocPlugin::get_output_formats() const {
    return capabilities().output_formats;
}

bool PandocPlugin::supports_conversion(
    const std::string& from_format,
    const std::string& to_format
) const {
    auto caps = capabilities();
    
    bool input_ok = false;
    for (const auto& fmt : caps.input_formats) {
        if (fmt == from_format) {
            input_ok = true;
            break;
        }
    }
    
    bool output_ok = false;
    for (const auto& fmt : caps.output_formats) {
        if (fmt == to_format) {
            output_ok = true;
            break;
        }
    }
    
    return input_ok && output_ok;
}

// ============================================================================
// Private Methods
// ============================================================================

std::vector<std::string> PandocPlugin::build_command(
    const std::string& input_path,
    const std::string& output_path,
    const std::string& from_format,
    const std::string& to_format,
    const std::map<std::string, std::string>& options
) {
    std::vector<std::string> args;
    args.push_back(config_.pandoc_path);
    
    // Input format
    args.push_back("--from=" + from_format);
    
    // Output format
    args.push_back("--to=" + to_format);
    
    // Output file
    args.push_back("-o");
    args.push_back(output_path);
    
    // PDF-specific options
    if (to_format == "pdf") {
        args.push_back("--pdf-engine=" + config_.pdf_engine);
        
        // Paper size and margins via variables
        args.push_back("-V");
        args.push_back("geometry:margin=" + config_.margin);
        args.push_back("-V");
        args.push_back("papersize=" + config_.paper_size);
        
        // Syntax highlighting
        args.push_back("--highlight-style=" + config_.highlight_style);
    }
    
    // Table of contents
    auto toc_it = options.find("toc");
    if (toc_it != options.end() && toc_it->second == "true") {
        args.push_back("--toc");
        args.push_back("--toc-depth=" + std::to_string(config_.toc_depth));
    } else if (config_.toc) {
        args.push_back("--toc");
        args.push_back("--toc-depth=" + std::to_string(config_.toc_depth));
    }
    
    // Custom template
    auto template_it = options.find("template");
    if (template_it != options.end() && !template_it->second.empty()) {
        args.push_back("--template=" + template_it->second);
    } else if (!config_.default_template.empty()) {
        args.push_back("--template=" + config_.default_template);
    }
    
    // Standalone document (includes header/footer)
    args.push_back("--standalone");
    
    // Custom variables
    for (const auto& [key, value] : options) {
        if (key != "toc" && key != "template") {
            args.push_back("-V");
            args.push_back(key + "=" + value);
        }
    }
    
    // Input file
    args.push_back(input_path);
    
    return args;
}

Result<void> PandocPlugin::execute_pandoc(
    const std::vector<std::string>& args,
    const std::string& job_id,
    JobProgressCallback progress_callback
) {
    // Build command string for logging
    std::string cmd;
    for (const auto& arg : args) {
        if (!cmd.empty()) cmd += " ";
        // Quote args with spaces
        if (arg.find(' ') != std::string::npos) {
            cmd += "\"" + arg + "\"";
        } else {
            cmd += arg;
        }
    }
    
    std::cout << "[PandocPlugin] Executing: " << cmd << std::endl;
    
    if (progress_callback) {
        progress_callback(job_id, JobProgress{
            .percent = 50.0,
            .stage = "running pandoc"
        });
    }
    
    // Execute using system() for simplicity
    // In production, use fork/exec or CreateProcess for better control
    int result = std::system(cmd.c_str());
    
    if (result != 0) {
        return Result<void>::error(
            ErrorCode::TRANSCODE_ERROR,
            "Pandoc conversion failed with exit code: " + std::to_string(result)
        );
    }
    
    return Result<void>::ok();
}

std::string PandocPlugin::detect_format(const std::string& path) const {
    std::filesystem::path p(path);
    std::string ext = p.extension().string();
    
    // Remove leading dot
    if (!ext.empty() && ext[0] == '.') {
        ext = ext.substr(1);
    }
    
    // Normalize common extensions
    if (ext == "md" || ext == "markdown" || ext == "mkd") {
        return "markdown";
    } else if (ext == "htm") {
        return "html";
    } else if (ext == "tex") {
        return "latex";
    } else if (ext == "rst") {
        return "rst";
    } else if (ext == "txt") {
        return "plain";
    }
    
    return ext;
}

std::vector<std::string> PandocPlugin::get_pdf_engine_flags() const {
    std::vector<std::string> flags;
    
    if (config_.pdf_engine == "xelatex") {
        // XeLaTeX supports Unicode and system fonts
        flags.push_back("-V");
        flags.push_back("mainfont=DejaVu Sans");
    } else if (config_.pdf_engine == "wkhtmltopdf") {
        // wkhtmltopdf uses HTML rendering
        flags.push_back("--pdf-engine-opt=--enable-local-file-access");
    }
    
    return flags;
}

} // namespace plugins
} // namespace media
