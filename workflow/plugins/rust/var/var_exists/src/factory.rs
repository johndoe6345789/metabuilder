//! Factory for VarExists plugin.

use super::VarExists;

/// Creates a new VarExists instance.
pub fn create() -> VarExists {
    VarExists::new()
}
