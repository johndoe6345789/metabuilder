#pragma once
/**
 * @file security.hpp
 * @brief Fort Knox Security Suite - includes all security headers
 * @details Each function is in its own .hpp file (1 function = 1 file)
 * 
 * Usage:
 *   #include "security.hpp"
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
#include "headers/secure_headers.hpp"

// Cryptographic signing
#include "crypto/hmac_sha256.hpp"
#include "crypto/timing_safe_equal.hpp"

// Path security
#include "validation/validate_path.hpp"
#include "validation/is_safe_filename.hpp"

// Input validation
#include "validation/is_valid_identifier.hpp"
#include "contains_sql_keyword.hpp"
#include "validation/is_valid_uuid.hpp"
#include "sanitize_string.hpp"
#include "validation/validate_length.hpp"

// Secure random generation
#include "crypto/secure_random_bytes.hpp"
#include "crypto/secure_random_hex.hpp"
#include "tokens/generate_request_id.hpp"
#include "tokens/generate_nonce.hpp"
#include "tokens/generate_token.hpp"

// Rate limiting functions
#include "rate_limiting/rate_limit_try_acquire.hpp"
#include "rate_limiting/rate_limit_remaining.hpp"

// Nonce functions
#include "nonce/nonce_check_and_store.hpp"
#include "nonce/nonce_cleanup.hpp"
#include "nonce/nonce_maybe_cleanup.hpp"
#include "nonce/nonce_size.hpp"

// Thread-safe wrappers (use these for convenience)
#include "rate_limiting/rate_limiter.hpp"
#include "nonce/nonce_store.hpp"

