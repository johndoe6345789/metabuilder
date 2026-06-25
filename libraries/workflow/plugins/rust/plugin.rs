//! MetaBuilder Workflow Plugin Base Types
//!
//! Shared types for all Rust workflow plugins.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

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
#[derive(Debug)]
pub enum PluginError {
    MissingInput(String),
    InvalidType(String),
    OperationFailed(String),
}

impl std::fmt::Display for PluginError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PluginError::MissingInput(s) => write!(f, "Missing required input: {}", s),
            PluginError::InvalidType(s) => write!(f, "Invalid input type: {}", s),
            PluginError::OperationFailed(s) => write!(f, "Operation failed: {}", s),
        }
    }
}

impl std::error::Error for PluginError {}

/// Trait for workflow plugins (legacy).
pub trait Plugin {
    fn run(&self, runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult;
}

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// Helper to get a value from inputs with type conversion
pub fn get_input<T: serde::de::DeserializeOwned>(
    inputs: &HashMap<String, Value>,
    key: &str,
) -> Option<T> {
    inputs.get(key).and_then(|v| serde_json::from_value(v.clone()).ok())
}

/// Helper macro to create output map
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
