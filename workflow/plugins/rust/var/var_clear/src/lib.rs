//! Workflow plugin: clear all variables.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// VarClear implements the NodeExecutor trait for clearing all variables.
pub struct VarClear {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl VarClear {
    /// Creates a new VarClear instance.
    pub fn new() -> Self {
        Self {
            node_type: "var.clear",
            category: "var",
            description: "Clear all variables from workflow store",
        }
    }
}

impl Default for VarClear {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for VarClear {
    fn execute(&self, _inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        // Count variables before clearing (actual clearing handled by executor)
        let count = if let Some(rt) = runtime {
            if let Some(store) = rt.downcast_ref::<HashMap<String, Value>>() {
                store.len()
            } else {
                0
            }
        } else {
            0
        };

        let mut output = HashMap::new();
        output.insert("success".to_string(), serde_json::json!(true));
        output.insert("cleared".to_string(), serde_json::json!(count));
        output
    }
}

/// Creates a new VarClear instance.
pub fn create() -> VarClear {
    VarClear::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clear() {
        let executor = VarClear::new();
        let mut store: HashMap<String, Value> = HashMap::new();
        store.insert("foo".to_string(), serde_json::json!("bar"));
        store.insert("baz".to_string(), serde_json::json!("qux"));

        let inputs = HashMap::new();
        let result = executor.execute(inputs, Some(&store));

        assert_eq!(result.get("success"), Some(&serde_json::json!(true)));
        assert_eq!(result.get("cleared"), Some(&serde_json::json!(2)));
    }

    #[test]
    fn test_clear_empty() {
        let executor = VarClear::new();
        let store: HashMap<String, Value> = HashMap::new();

        let inputs = HashMap::new();
        let result = executor.execute(inputs, Some(&store));

        assert_eq!(result.get("success"), Some(&serde_json::json!(true)));
        assert_eq!(result.get("cleared"), Some(&serde_json::json!(0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "var.clear");
        assert_eq!(executor.category, "var");
    }
}
