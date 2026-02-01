//! Workflow plugin: slice a list.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ListSlice implements the NodeExecutor trait for slicing lists.
pub struct ListSlice {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ListSlice {
    /// Creates a new ListSlice instance.
    pub fn new() -> Self {
        Self {
            node_type: "list.slice",
            category: "list",
            description: "Slice a list",
        }
    }
}

impl Default for ListSlice {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ListSlice {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let list: Vec<Value> = inputs
            .get("list")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();
        let start: i64 = inputs
            .get("start")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(0);
        let end: Option<i64> = inputs
            .get("end")
            .and_then(|v| serde_json::from_value(v.clone()).ok());

        let len = list.len() as i64;

        // Handle negative indices
        let start_idx = if start < 0 { (len + start).max(0) } else { start.min(len) } as usize;
        let end_idx = match end {
            Some(e) if e < 0 => (len + e).max(0) as usize,
            Some(e) => e.min(len) as usize,
            None => len as usize,
        };

        let sliced: Vec<Value> = if start_idx < end_idx {
            list[start_idx..end_idx].to_vec()
        } else {
            vec![]
        };

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(sliced));
        result
    }
}

/// Creates a new ListSlice instance.
pub fn create() -> ListSlice {
    ListSlice::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_slice() {
        let executor = ListSlice::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([1, 2, 3, 4, 5]));
        inputs.insert("start".to_string(), serde_json::json!(1));
        inputs.insert("end".to_string(), serde_json::json!(4));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!([2, 3, 4])));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "list.slice");
        assert_eq!(executor.category, "list");
    }
}
