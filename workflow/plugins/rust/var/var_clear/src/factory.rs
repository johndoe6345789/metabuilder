//! Factory for VarClear plugin.

use super::VarClear;

/// Creates a new VarClear instance.
pub fn create() -> VarClear {
    VarClear::new()
}
