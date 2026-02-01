//! Workflow plugin: get element at index.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ListAt implements the NodeExecutor trait for getting element at index.
pub struct ListAt {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ListAt {
    /// Creates a new ListAt instance.
    pub fn new() -> Self {
        Self {
            node_type: "list.at",
            category: "list",
            description: "Get element at index",
        }
    }
}

impl Default for ListAt {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ListAt {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let list: Vec<Value> = inputs
            .get("list")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();
        let index: i64 = inputs
            .get("index")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(0);

        let len = list.len() as i64;
        let idx = if index < 0 { len + index } else { index };

        let value = if idx >= 0 && (idx as usize) < list.len() {
            list[idx as usize].clone()
        } else {
            Value::Null
        };

        let mut result = HashMap::new();
        result.insert("result".to_string(), value);
        result
    }
}

/// Creates a new ListAt instance.
pub fn create() -> ListAt {
    ListAt::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_at() {
        let executor = ListAt::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([1, 2, 3]));
        inputs.insert("index".to_string(), serde_json::json!(1));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(2)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "list.at");
        assert_eq!(executor.category, "list");
    }
}
