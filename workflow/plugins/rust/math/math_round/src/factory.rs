//! Factory for MathRound plugin.

use super::MathRound;

/// Creates a new MathRound instance.
pub fn create() -> MathRound {
    MathRound::new()
}
