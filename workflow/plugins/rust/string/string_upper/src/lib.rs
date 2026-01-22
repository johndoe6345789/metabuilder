//! Workflow plugin: uppercase string.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// StringUpper implements the NodeExecutor trait for converting strings to uppercase.
pub struct StringUpper {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl StringUpper {
    /// Creates a new StringUpper instance.
    pub fn new() -> Self {
        Self {
            node_type: "string.upper",
            category: "string",
            description: "Convert string to uppercase",
        }
    }
}

impl Default for StringUpper {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for StringUpper {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let string: String = inputs
            .get("string")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(string.to_uppercase()));
        result
    }
}

/// Creates a new StringUpper instance.
pub fn create() -> StringUpper {
    StringUpper::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_upper() {
        let executor = StringUpper::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("hello"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!("HELLO")));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "string.upper");
        assert_eq!(executor.category, "string");
    }
}
