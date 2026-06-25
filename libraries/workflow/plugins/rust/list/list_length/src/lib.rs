//! Workflow plugin: list length.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ListLength implements the NodeExecutor trait for getting list length.
pub struct ListLength {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ListLength {
    /// Creates a new ListLength instance.
    pub fn new() -> Self {
        Self {
            node_type: "list.length",
            category: "list",
            description: "Get list length",
        }
    }
}

impl Default for ListLength {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ListLength {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let list: Vec<Value> = inputs
            .get("list")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(list.len()));
        result
    }
}

/// Creates a new ListLength instance.
pub fn create() -> ListLength {
    ListLength::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_length() {
        let executor = ListLength::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([1, 2, 3, 4, 5]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(5)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "list.length");
        assert_eq!(executor.category, "list");
    }
}
