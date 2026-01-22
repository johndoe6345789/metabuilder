//! Workflow plugin: string starts with.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// StringStartsWith implements the NodeExecutor trait for checking if string starts with prefix.
pub struct StringStartsWith {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl StringStartsWith {
    /// Creates a new StringStartsWith instance.
    pub fn new() -> Self {
        Self {
            node_type: "string.starts_with",
            category: "string",
            description: "Check if string starts with prefix",
        }
    }
}

impl Default for StringStartsWith {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for StringStartsWith {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let string: String = inputs
            .get("string")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();
        let prefix: String = inputs
            .get("prefix")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(string.starts_with(&prefix)));
        result
    }
}

/// Creates a new StringStartsWith instance.
pub fn create() -> StringStartsWith {
    StringStartsWith::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_starts_with() {
        let executor = StringStartsWith::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("hello world"));
        inputs.insert("prefix".to_string(), serde_json::json!("hello"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "string.starts_with");
        assert_eq!(executor.category, "string");
    }
}
