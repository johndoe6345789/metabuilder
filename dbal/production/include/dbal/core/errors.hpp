/**
 * @file errors.hpp
 * @brief Unified error handling header (includes all error modules)
 *
 * This is the main header for error handling in DBAL. It includes
 * all modular error components for convenient single-include usage.
 *
 * For fine-grained control, include specific headers:
 * - error_codes.hpp - ErrorCode enum only
 * - error.hpp - Error class
 * - error_result.hpp - Result<T> monad
 * - error_formatter.hpp - HTTP/JSON formatting
 * - error_logger.hpp - Structured logging
 * - error_translator.hpp - Backend error translation
 */

#ifndef DBAL_ERRORS_HPP
#define DBAL_ERRORS_HPP

#include "error_codes.hpp"
#include "error.hpp"
#include "error_result.hpp"

#endif
