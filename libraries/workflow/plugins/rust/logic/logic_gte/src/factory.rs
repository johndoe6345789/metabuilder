//! Factory for LogicGte plugin.

use super::LogicGte;

/// Creates a new LogicGte instance.
pub fn create() -> LogicGte {
    LogicGte::new()
}
