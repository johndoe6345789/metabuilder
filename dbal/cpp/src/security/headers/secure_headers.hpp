#pragma once
/**
 * @file secure_headers.hpp
 * @brief Fort Knox security headers for HTTP responses
 * @details Header-only implementation of security headers
 */

#include <string>
#include <unordered_map>

namespace dbal::security {

/**
 * Apply all security headers to an HTTP response
 * @param headers Reference to response headers map
 */
inline void apply_security_headers(std::unordered_map<std::string, std::string>& headers) {
    // Prevent MIME type sniffing
    headers["X-Content-Type-Options"] = "nosniff";
    
    // Block clickjacking via iframes
    headers["X-Frame-Options"] = "DENY";
    
    // Disable caching for sensitive responses
    headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private";
    headers["Pragma"] = "no-cache";
    
    // Force HTTPS (HSTS)
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
    
    // Content Security Policy for API responses
    headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
    
    // Referrer policy
    headers["Referrer-Policy"] = "no-referrer";
    
    // Disable browser features
    headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()";
    
    // XSS protection (legacy browsers)
    headers["X-XSS-Protection"] = "1; mode=block";
}

} // namespace dbal::security
