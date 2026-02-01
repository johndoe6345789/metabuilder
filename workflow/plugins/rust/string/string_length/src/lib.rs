//! Workflow plugin: string length.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// StringLength implements the NodeExecutor trait for getting string length.
pub struct StringLength {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl StringLength {
    /// Creates a new StringLength instance.
    pub fn new() -> Self {
        Self {
            node_type: "string.length",
            category: "string",
            description: "Get string length",
        }
    }
}

impl Default for StringLength {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for StringLength {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let string: String = inputs
            .get("string")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(string.len()));
        result
    }
}

/// Creates a new StringLength instance.
pub fn create() -> StringLength {
    StringLength::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_length() {
        let executor = StringLength::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("hello"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(5)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "string.length");
        assert_eq!(executor.category, "string");
    }
}
