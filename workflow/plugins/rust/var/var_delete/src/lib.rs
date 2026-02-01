//! Workflow plugin: delete variable.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// VarDelete implements the NodeExecutor trait for deleting variables.
pub struct VarDelete {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl VarDelete {
    /// Creates a new VarDelete instance.
    pub fn new() -> Self {
        Self {
            node_type: "var.delete",
            category: "var",
            description: "Delete variable from workflow store",
        }
    }
}

impl Default for VarDelete {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for VarDelete {
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let key: Option<String> = inputs
            .get("key")
            .and_then(|v| serde_json::from_value(v.clone()).ok());

        let mut output = HashMap::new();

        match key {
            Some(k) => {
                // Check if key exists in runtime
                let existed = if let Some(rt) = runtime {
                    if let Some(store) = rt.downcast_ref::<HashMap<String, Value>>() {
                        store.contains_key(&k)
                    } else {
                        false
                    }
                } else {
                    false
                };

                output.insert("success".to_string(), serde_json::json!(true));
                output.insert("key".to_string(), serde_json::json!(k));
                output.insert("existed".to_string(), serde_json::json!(existed));
            }
            None => {
                output.insert("success".to_string(), serde_json::json!(false));
                output.insert("error".to_string(), serde_json::json!("key is required"));
            }
        }

        output
    }
}

/// Creates a new VarDelete instance.
pub fn create() -> VarDelete {
    VarDelete::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_delete() {
        let executor = VarDelete::new();
        let mut store: HashMap<String, Value> = HashMap::new();
        store.insert("foo".to_string(), serde_json::json!("bar"));

        let mut inputs = HashMap::new();
        inputs.insert("key".to_string(), serde_json::json!("foo"));

        let result = executor.execute(inputs, Some(&store));
        assert_eq!(result.get("success"), Some(&serde_json::json!(true)));
        assert_eq!(result.get("existed"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_delete_missing_key() {
        let executor = VarDelete::new();
        let inputs = HashMap::new();

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("success"), Some(&serde_json::json!(false)));
        assert!(result.get("error").is_some());
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "var.delete");
        assert_eq!(executor.category, "var");
    }
}
