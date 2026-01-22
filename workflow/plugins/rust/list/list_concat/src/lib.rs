//! Workflow plugin: concatenate lists.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ListConcat implements the NodeExecutor trait for concatenating lists.
pub struct ListConcat {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ListConcat {
    /// Creates a new ListConcat instance.
    pub fn new() -> Self {
        Self {
            node_type: "list.concat",
            category: "list",
            description: "Concatenate multiple lists",
        }
    }
}

impl Default for ListConcat {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ListConcat {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let lists: Vec<Vec<Value>> = inputs
            .get("lists")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let concatenated: Vec<Value> = lists.into_iter().flatten().collect();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(concatenated));
        result
    }
}

/// Creates a new ListConcat instance.
pub fn create() -> ListConcat {
    ListConcat::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_concat() {
        let executor = ListConcat::new();
        let mut inputs = HashMap::new();
        inputs.insert("lists".to_string(), serde_json::json!([[1, 2], [3, 4]]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!([1, 2, 3, 4])));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "list.concat");
        assert_eq!(executor.category, "list");
    }
}
