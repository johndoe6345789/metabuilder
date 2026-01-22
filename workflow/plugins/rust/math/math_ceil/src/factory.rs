//! Factory for MathCeil plugin.

use super::MathCeil;

/// Creates a new MathCeil instance.
pub fn create() -> MathCeil {
    MathCeil::new()
}
