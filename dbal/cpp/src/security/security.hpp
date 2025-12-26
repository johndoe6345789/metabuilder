#pragma once
/**
 * @file security.hpp
 * @brief Fort Knox Security Suite - includes all security headers
 * @details Convenience header to include all security utilities
 * 
 * Usage:
 *   #include "security/security.hpp"
 *   
 *   // Apply headers
 *   dbal::security::apply_security_headers(response.headers);
 *   
 *   // Rate limit
 *   dbal::security::RateLimiter limiter(100, 200);  // 100/sec, burst 200
 *   if (!limiter.try_acquire(client_ip)) { return 429; }
 *   
 *   // Sign request
 *   auto sig = dbal::security::hmac_sha256(key, key_len, payload);
 *   
 *   // Validate path
 *   auto safe = dbal::security::validate_path("/data", user_input);
 *   
 *   // Validate input
 *   if (!dbal::security::is_valid_identifier(table_name)) { reject(); }
 *   
 *   // Generate secure IDs
 *   auto id = dbal::security::generate_request_id();
 *   
 *   // Prevent replay
 *   dbal::security::NonceStore nonces;
 *   if (!nonces.check_and_store(request.nonce)) { return 401; }
 */

// Security headers for HTTP responses
#include "secure_headers.hpp"

// HMAC signing and timing-safe comparison
#include "hmac_signer.hpp"

// Path traversal prevention
#include "path_validator.hpp"

// Token bucket rate limiting
#include "rate_limiter.hpp"

// Input validation and sanitization
#include "input_sanitizer.hpp"

// Nonce storage for replay prevention
#include "nonce_store.hpp"

// Cryptographic random generation
#include "secure_random.hpp"
