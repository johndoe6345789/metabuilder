//! Factory for LogicAnd plugin.

use super::LogicAnd;

/// Creates a new LogicAnd instance.
pub fn create() -> LogicAnd {
    LogicAnd::new()
}
