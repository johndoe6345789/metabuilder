/**
 * @file error_result.hpp
 * @brief Result<T> monad for functional error handling
 *
 * Provides Railway-Oriented Programming pattern for explicit
 * error handling without exceptions in performance-critical paths.
 */

#ifndef DBAL_ERROR_RESULT_HPP
#define DBAL_ERROR_RESULT_HPP

#include <stdexcept>
#include "error.hpp"

namespace dbal {

/**
 * @class Result
 * @brief Functional error handling monad (Railway-Oriented Programming)
 *
 * Result<T> represents either a successful value (Ok) or an error (Err).
 * This enables explicit error handling without exceptions for performance-
 * critical code paths.
 *
 * @tparam T The success value type
 *
 * @example
 * @code
 * Result<User> getUser(int id) {
 *     if (user_exists(id)) {
 *         return User{id, "John"};  // Ok
 *     }
 *     return Error::notFound("User not found");  // Err
 * }
 *
 * auto result = getUser(123);
 * if (result.isOk()) {
 *     std::cout << result.value().name;
 * } else {
 *     std::cerr << result.error().what();
 * }
 * @endcode
 */
template<typename T>
class Result {
public:
    /**
     * @brief Construct successful result with value
     * @param value Success value
     */
    Result(T value) : value_(std::move(value)), has_value_(true) {}

    /**
     * @brief Construct error result
     * @param error Error instance
     */
    Result(Error error) : error_(std::move(error)), has_value_(false) {}

    /**
     * @brief Check if result contains value
     * @return true if Ok, false if Err
     */
    bool isOk() const { return has_value_; }

    /**
     * @brief Check if result contains error
     * @return true if Err, false if Ok
     */
    bool isError() const { return !has_value_; }

    /**
     * @brief Get mutable reference to value
     * @return Value reference
     * @throws Error if result is Err
     */
    T& value() {
        if (!has_value_) throw error_;
        return value_;
    }

    /**
     * @brief Get const reference to value
     * @return Value reference
     * @throws Error if result is Err
     */
    const T& value() const {
        if (!has_value_) throw error_;
        return value_;
    }

    /**
     * @brief Get mutable reference to error
     * @return Error reference
     * @throws std::logic_error if result is Ok
     */
    Error& error() {
        if (has_value_) throw std::logic_error("No error present");
        return error_;
    }

    /**
     * @brief Get const reference to error
     * @return Error reference
     * @throws std::logic_error if result is Ok
     */
    const Error& error() const {
        if (has_value_) throw std::logic_error("No error present");
        return error_;
    }

    /**
     * @brief Check if result contains value (alias for isOk)
     * @return true if Ok, false if Err
     */
    bool hasValue() const { return has_value_; }

    /**
     * @brief Explicit bool conversion (enables if (result) syntax)
     * @return true if Ok, false if Err
     */
    explicit operator bool() const { return has_value_; }

    /**
     * @brief Dereference to const value (enables *result syntax)
     * @return Const reference to value
     * @throws Error if result is Err
     */
    const T& operator*() const {
        if (!has_value_) throw error_;
        return value_;
    }

    /**
     * @brief Dereference to mutable value (enables *result syntax)
     * @return Mutable reference to value
     * @throws Error if result is Err
     */
    T& operator*() {
        if (!has_value_) throw error_;
        return value_;
    }

private:
    T value_;          ///< Success value (if has_value_ == true)
    Error error_{ErrorCode::InternalError, ""};  ///< Error (if has_value_ == false)
    bool has_value_;   ///< true if Ok, false if Err
};

}

#endif
