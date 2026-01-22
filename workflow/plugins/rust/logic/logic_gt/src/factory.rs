//! Factory for LogicGt plugin.

use super::LogicGt;

/// Creates a new LogicGt instance.
pub fn create() -> LogicGt {
    LogicGt::new()
}
