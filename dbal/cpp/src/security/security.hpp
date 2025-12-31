#pragma once
/**
 * @file security.hpp
 * @brief Fort Knox Security Suite - includes all security headers
 * @details Each function is in its own .hpp file (1 function = 1 file)
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
 *   // Or use functions directly
 *   dbal::security::TokenBucket bucket;
 *   if (!dbal::security::rate_limit_try_acquire(bucket, 100, 200)) { return 429; }
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

// Rate limiting functions
#include "rate_limit_try_acquire.hpp"
#include "rate_limit_remaining.hpp"

// Nonce functions
#include "nonce_check_and_store.hpp"
#include "nonce_cleanup.hpp"
#include "nonce_maybe_cleanup.hpp"
#include "nonce_size.hpp"

// Thread-safe wrappers (use these for convenience)
#include "rate_limiter.hpp"
#include "nonce_store.hpp"

