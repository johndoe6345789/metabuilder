//! Factory for VarKeys plugin.

use super::VarKeys;

/// Creates a new VarKeys instance.
pub fn create() -> VarKeys {
    VarKeys::new()
}
