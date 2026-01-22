//! Workflow plugin: lowercase string.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// StringLower implements the NodeExecutor trait for converting strings to lowercase.
pub struct StringLower {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl StringLower {
    /// Creates a new StringLower instance.
    pub fn new() -> Self {
        Self {
            node_type: "string.lower",
            category: "string",
            description: "Convert string to lowercase",
        }
    }
}

impl Default for StringLower {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for StringLower {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let string: String = inputs
            .get("string")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(string.to_lowercase()));
        result
    }
}

/// Creates a new StringLower instance.
pub fn create() -> StringLower {
    StringLower::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lower() {
        let executor = StringLower::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("HELLO"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!("hello")));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "string.lower");
        assert_eq!(executor.category, "string");
    }
}
