//! Factory for VarDelete plugin.

use super::VarDelete;

/// Creates a new VarDelete instance.
pub fn create() -> VarDelete {
    VarDelete::new()
}
