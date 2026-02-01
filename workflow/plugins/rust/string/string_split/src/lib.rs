//! Workflow plugin: split a string.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// StringSplit implements the NodeExecutor trait for splitting strings.
pub struct StringSplit {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl StringSplit {
    /// Creates a new StringSplit instance.
    pub fn new() -> Self {
        Self {
            node_type: "string.split",
            category: "string",
            description: "Split a string by separator",
        }
    }
}

impl Default for StringSplit {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for StringSplit {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let string: String = inputs
            .get("string")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();
        let separator: String = inputs
            .get("separator")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let parts: Vec<String> = if separator.is_empty() {
            string.chars().map(|c| c.to_string()).collect()
        } else {
            string.split(&separator).map(|s| s.to_string()).collect()
        };

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(parts));
        result
    }
}

/// Creates a new StringSplit instance.
pub fn create() -> StringSplit {
    StringSplit::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_split() {
        let executor = StringSplit::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("a,b,c"));
        inputs.insert("separator".to_string(), serde_json::json!(","));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(["a", "b", "c"])));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "string.split");
        assert_eq!(executor.category, "string");
    }
}
