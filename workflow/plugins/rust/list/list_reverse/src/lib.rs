//! Workflow plugin: reverse a list.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ListReverse implements the NodeExecutor trait for reversing lists.
pub struct ListReverse {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ListReverse {
    /// Creates a new ListReverse instance.
    pub fn new() -> Self {
        Self {
            node_type: "list.reverse",
            category: "list",
            description: "Reverse a list",
        }
    }
}

impl Default for ListReverse {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ListReverse {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let mut list: Vec<Value> = inputs
            .get("list")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        list.reverse();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(list));
        result
    }
}

/// Creates a new ListReverse instance.
pub fn create() -> ListReverse {
    ListReverse::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reverse() {
        let executor = ListReverse::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([1, 2, 3]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!([3, 2, 1])));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "list.reverse");
        assert_eq!(executor.category, "list");
    }
}
