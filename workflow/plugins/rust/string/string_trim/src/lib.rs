//! Workflow plugin: trim string.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// StringTrim implements the NodeExecutor trait for trimming strings.
pub struct StringTrim {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl StringTrim {
    /// Creates a new StringTrim instance.
    pub fn new() -> Self {
        Self {
            node_type: "string.trim",
            category: "string",
            description: "Trim whitespace from string",
        }
    }
}

impl Default for StringTrim {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for StringTrim {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let string: String = inputs
            .get("string")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(string.trim()));
        result
    }
}

/// Creates a new StringTrim instance.
pub fn create() -> StringTrim {
    StringTrim::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_trim() {
        let executor = StringTrim::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("  hello  "));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!("hello")));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "string.trim");
        assert_eq!(executor.category, "string");
    }
}
