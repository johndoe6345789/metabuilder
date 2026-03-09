#pragma once

#include "media/plugin.hpp"
#include <map>
#include <mutex>

namespace media {
namespace plugins {

/**
 * Pandoc Plugin Configuration
 */
struct PandocConfig {
    std::string pandoc_path = "/usr/bin/pandoc";
    std::string pdf_engine = "xelatex";  // xelatex, pdflatex, lualatex, wkhtmltopdf
    std::string default_template;
    std::string data_dir = "/usr/share/pandoc";
    
    // PDF settings
    std::string paper_size = "a4";       // a4, letter, legal
    std::string margin = "1in";
    bool toc = false;                    // Table of contents
    int toc_depth = 3;
    
    // Syntax highlighting
    std::string highlight_style = "tango";  // pygments, kate, monochrome, espresso, zenburn, haddock, tango
    
    // Resource limits
    int timeout_seconds = 300;
    size_t max_input_size_mb = 50;
};

/**
 * Pandoc Plugin
 * 
 * Built-in plugin for document conversion using Pandoc.
 * Supports markdown, HTML, LaTeX, DOCX, ODT, EPUB, PDF, and more.
 * 
 * Supported conversions:
 * - Markdown → PDF, HTML, DOCX, ODT, EPUB, LaTeX
 * - HTML → PDF, Markdown, DOCX
 * - DOCX → PDF, Markdown, HTML
 * - LaTeX → PDF
 * - reStructuredText → PDF, HTML
 * - Org-mode → PDF, HTML
 */
class PandocPlugin : public Plugin {
public:
    PandocPlugin();
    ~PandocPlugin() override;
    
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
    
    // ========================================================================
    // Pandoc-specific Methods
    // ========================================================================
    
    /**
     * Convert markdown to PDF
     * @param input_path Path to markdown file
     * @param output_path Path for PDF output
     * @param options Conversion options
     * @return Result with output path or error
     */
    Result<std::string> markdown_to_pdf(
        const std::string& input_path,
        const std::string& output_path,
        const std::map<std::string, std::string>& options = {}
    );
    
    /**
     * Convert markdown to HTML
     */
    Result<std::string> markdown_to_html(
        const std::string& input_path,
        const std::string& output_path,
        const std::map<std::string, std::string>& options = {}
    );
    
    /**
     * Convert markdown to DOCX
     */
    Result<std::string> markdown_to_docx(
        const std::string& input_path,
        const std::string& output_path,
        const std::map<std::string, std::string>& options = {}
    );
    
    /**
     * Convert HTML to PDF
     */
    Result<std::string> html_to_pdf(
        const std::string& input_path,
        const std::string& output_path,
        const std::map<std::string, std::string>& options = {}
    );
    
    /**
     * Convert DOCX to PDF
     */
    Result<std::string> docx_to_pdf(
        const std::string& input_path,
        const std::string& output_path,
        const std::map<std::string, std::string>& options = {}
    );
    
    /**
     * Get list of supported input formats
     */
    std::vector<std::string> get_input_formats() const;
    
    /**
     * Get list of supported output formats
     */
    std::vector<std::string> get_output_formats() const;
    
    /**
     * Check if a specific conversion is supported
     */
    bool supports_conversion(
        const std::string& from_format,
        const std::string& to_format
    ) const;
    
private:
    /**
     * Build Pandoc command for conversion
     */
    std::vector<std::string> build_command(
        const std::string& input_path,
        const std::string& output_path,
        const std::string& from_format,
        const std::string& to_format,
        const std::map<std::string, std::string>& options
    );
    
    /**
     * Execute Pandoc command
     */
    Result<void> execute_pandoc(
        const std::vector<std::string>& args,
        const std::string& job_id,
        JobProgressCallback progress_callback
    );
    
    /**
     * Detect input format from file extension
     */
    std::string detect_format(const std::string& path) const;
    
    /**
     * Get PDF engine flags
     */
    std::vector<std::string> get_pdf_engine_flags() const;
    
    // Configuration
    PandocConfig config_;
    bool initialized_ = false;
    
    // Active jobs
    mutable std::mutex jobs_mutex_;
    std::map<std::string, int> active_pids_;  // job_id -> pid
};

} // namespace plugins
} // namespace media
