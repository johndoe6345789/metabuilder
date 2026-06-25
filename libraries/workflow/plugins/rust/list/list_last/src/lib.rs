//! Workflow plugin: get last element.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ListLast implements the NodeExecutor trait for getting last element.
pub struct ListLast {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ListLast {
    /// Creates a new ListLast instance.
    pub fn new() -> Self {
        Self {
            node_type: "list.last",
            category: "list",
            description: "Get last element of list",
        }
    }
}

impl Default for ListLast {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ListLast {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let list: Vec<Value> = inputs
            .get("list")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let value = list.last().cloned().unwrap_or(Value::Null);

        let mut result = HashMap::new();
        result.insert("result".to_string(), value);
        result
    }
}

/// Creates a new ListLast instance.
pub fn create() -> ListLast {
    ListLast::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_last() {
        let executor = ListLast::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([1, 2, 3]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(3)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "list.last");
        assert_eq!(executor.category, "list");
    }
}
