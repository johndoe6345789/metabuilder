//! Factory for MathMultiply plugin.

use super::MathMultiply;

/// Creates a new MathMultiply instance.
pub fn create() -> MathMultiply {
    MathMultiply::new()
}
