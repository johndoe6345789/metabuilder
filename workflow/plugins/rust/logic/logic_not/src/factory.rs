//! Factory for LogicNot plugin.

use super::LogicNot;

/// Creates a new LogicNot instance.
pub fn create() -> LogicNot {
    LogicNot::new()
}
