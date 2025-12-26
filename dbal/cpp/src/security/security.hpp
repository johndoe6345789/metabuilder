#pragma once
/**
 * @file security.hpp
 * @brief Fort Knox Security Suite - includes all security headers
 * @details Convenience header to include all security utilities
 *          Each function is in its own .hpp file (1 function = 1 file)
 * 
 * Usage:
 *   #include "security/security.hpp"
 *   
 *   // Apply headers
 *   dbal::security::apply_security_headers(response.headers);
 *   
 *   // Rate limit
 *   dbal::security::RateLimiter limiter(100, 200);
 *   if (!limiter.try_acquire(client_ip)) { return 429; }
 *   
 *   // Sign request
 *   auto sig = dbal::security::hmac_sha256(key, key_len, payload);
 *   
 *   // Validate path
 *   auto safe = dbal::security::validate_path("/data", user_input);
 */

// HTTP security headers
#include "secure_headers.hpp"

// Cryptographic signing
#include "hmac_sha256.hpp"
#include "timing_safe_equal.hpp"

// Path security
#include "validate_path.hpp"
#include "is_safe_filename.hpp"

// Input validation
#include "is_valid_identifier.hpp"
#include "contains_sql_keyword.hpp"
#include "is_valid_uuid.hpp"
#include "sanitize_string.hpp"
#include "validate_length.hpp"

// Secure random generation
#include "secure_random_bytes.hpp"
#include "secure_random_hex.hpp"
#include "generate_request_id.hpp"
#include "generate_nonce.hpp"
#include "generate_token.hpp"

// Classes (cohesive units, stay as single files)
#include "rate_limiter.hpp"
#include "nonce_store.hpp"

