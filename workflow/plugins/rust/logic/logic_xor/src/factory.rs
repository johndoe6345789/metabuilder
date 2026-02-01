//! Factory for LogicXor plugin.

use super::LogicXor;

/// Creates a new LogicXor instance.
pub fn create() -> LogicXor {
    LogicXor::new()
}
