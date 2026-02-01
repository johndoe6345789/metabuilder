//! Factory for LogicEquals plugin.

use super::LogicEquals;

/// Creates a new LogicEquals instance.
pub fn create() -> LogicEquals {
    LogicEquals::new()
}
