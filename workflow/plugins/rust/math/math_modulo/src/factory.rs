//! Factory for MathModulo plugin.

use super::MathModulo;

/// Creates a new MathModulo instance.
pub fn create() -> MathModulo {
    MathModulo::new()
}
