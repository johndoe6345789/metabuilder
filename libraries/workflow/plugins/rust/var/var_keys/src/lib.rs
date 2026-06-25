//! Workflow plugin: get all variable keys.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// VarKeys implements the NodeExecutor trait for getting all variable keys.
pub struct VarKeys {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl VarKeys {
    /// Creates a new VarKeys instance.
    pub fn new() -> Self {
        Self {
            node_type: "var.keys",
            category: "var",
            description: "Get all variable keys from workflow store",
        }
    }
}

impl Default for VarKeys {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for VarKeys {
    fn execute(&self, _inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let keys: Vec<String> = if let Some(rt) = runtime {
            if let Some(store) = rt.downcast_ref::<HashMap<String, Value>>() {
                store.keys().cloned().collect()
            } else {
                Vec::new()
            }
        } else {
            Vec::new()
        };

        let mut output = HashMap::new();
        output.insert("result".to_string(), serde_json::json!(keys));
        output
    }
}

/// Creates a new VarKeys instance.
pub fn create() -> VarKeys {
    VarKeys::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_keys() {
        let executor = VarKeys::new();
        let mut store: HashMap<String, Value> = HashMap::new();
        store.insert("foo".to_string(), serde_json::json!("bar"));
        store.insert("baz".to_string(), serde_json::json!("qux"));

        let inputs = HashMap::new();
        let result = executor.execute(inputs, Some(&store));

        let keys = result.get("result").unwrap().as_array().unwrap();
        assert_eq!(keys.len(), 2);
    }

    #[test]
    fn test_keys_empty() {
        let executor = VarKeys::new();
        let store: HashMap<String, Value> = HashMap::new();

        let inputs = HashMap::new();
        let result = executor.execute(inputs, Some(&store));

        let keys = result.get("result").unwrap().as_array().unwrap();
        assert!(keys.is_empty());
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "var.keys");
        assert_eq!(executor.category, "var");
    }
}
