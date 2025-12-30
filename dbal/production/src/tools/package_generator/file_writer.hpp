/**
 * File writer utility for generated package files
 */

#pragma once

#include <string>
#include <vector>
#include <filesystem>
#include <fstream>
#include <iostream>

namespace fs = std::filesystem;

namespace tools {

struct GeneratedFile;

class FileWriter {
public:
    explicit FileWriter(const fs::path& base_path) 
        : base_path_(base_path) {}

    /**
     * Write all generated files to disk
     * @return Number of files written
     */
    int write_all(const std::vector<GeneratedFile>& files) {
        int written = 0;
        
        for (const auto& file : files) {
            if (write_file(file)) {
                ++written;
            }
        }
        
        return written;
    }

    /**
     * Write a single file
     */
    bool write_file(const GeneratedFile& file) {
        auto full_path = base_path_ / file.path;
        auto dir = full_path.parent_path();
        
        // Create directories
        if (!dir.empty() && !fs::exists(dir)) {
            std::error_code ec;
            fs::create_directories(dir, ec);
            if (ec) {
                std::cerr << "Error creating directory " << dir << ": " << ec.message() << "\n";
                return false;
            }
        }
        
        // Write file
        std::ofstream out(full_path, std::ios::binary);
        if (!out) {
            std::cerr << "Error opening file for writing: " << full_path << "\n";
            return false;
        }
        
        out << file.content;
        out.close();
        
        if (verbose_) {
            std::cout << "  Created: " << file.path << "\n";
        }
        
        return true;
    }

    void set_verbose(bool verbose) { verbose_ = verbose; }

private:
    fs::path base_path_;
    bool verbose_ = true;
};

} // namespace tools
