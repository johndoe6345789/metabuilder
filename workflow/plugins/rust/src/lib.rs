//! MetaBuilder Workflow Plugins for Rust
//!
//! Rust plugins follow the same pattern as Python:
//! - Each module contains one operation
//! - All plugins implement the `run` function
//! - Input/output are `serde_json::Value`

use serde_json::Value;
use std::collections::HashMap;

pub mod convert;
pub mod list;
pub mod logic;
pub mod math;
pub mod string;
pub mod var;

/// Runtime context for plugin execution.
pub struct Runtime {
    /// Workflow state storage
    pub store: HashMap<String, Value>,
    /// Shared context (clients, config)
    pub context: HashMap<String, Value>,
}

impl Runtime {
    pub fn new() -> Self {
        Runtime {
            store: HashMap::new(),
            context: HashMap::new(),
        }
    }
}

impl Default for Runtime {
    fn default() -> Self {
        Self::new()
    }
}

/// Result type for plugin operations
pub type PluginResult = Result<HashMap<String, Value>, PluginError>;

/// Error type for plugin operations
#[derive(Debug, thiserror::Error)]
pub enum PluginError {
    #[error("Missing required input: {0}")]
    MissingInput(String),
    #[error("Invalid input type: {0}")]
    InvalidType(String),
    #[error("Operation failed: {0}")]
    OperationFailed(String),
}

/// Trait for workflow plugins
pub trait Plugin {
    fn run(&self, runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult;
}

/// Helper to get a value from inputs with type conversion
pub fn get_input<T: serde::de::DeserializeOwned>(
    inputs: &HashMap<String, Value>,
    key: &str,
) -> Option<T> {
    inputs.get(key).and_then(|v| serde_json::from_value(v.clone()).ok())
}

/// Helper to create output map
#[macro_export]
macro_rules! output {
    ($($key:expr => $value:expr),* $(,)?) => {{
        let mut map = std::collections::HashMap::new();
        $(
            map.insert($key.to_string(), serde_json::json!($value));
        )*
        map
    }};
}
