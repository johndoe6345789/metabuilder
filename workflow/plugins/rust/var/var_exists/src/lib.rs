//! Workflow plugin: check if variable exists.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// VarExists implements the NodeExecutor trait for checking variable existence.
pub struct VarExists {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl VarExists {
    /// Creates a new VarExists instance.
    pub fn new() -> Self {
        Self {
            node_type: "var.exists",
            category: "var",
            description: "Check if variable exists in workflow store",
        }
    }
}

impl Default for VarExists {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for VarExists {
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let key: Option<String> = inputs
            .get("key")
            .and_then(|v| serde_json::from_value(v.clone()).ok());

        let mut output = HashMap::new();

        match key {
            Some(k) => {
                let exists = if let Some(rt) = runtime {
                    if let Some(store) = rt.downcast_ref::<HashMap<String, Value>>() {
                        store.contains_key(&k)
                    } else {
                        false
                    }
                } else {
                    false
                };

                output.insert("result".to_string(), serde_json::json!(exists));
            }
            None => {
                output.insert("result".to_string(), serde_json::json!(false));
                output.insert("error".to_string(), serde_json::json!("key is required"));
            }
        }

        output
    }
}

/// Creates a new VarExists instance.
pub fn create() -> VarExists {
    VarExists::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_exists() {
        let executor = VarExists::new();
        let mut store: HashMap<String, Value> = HashMap::new();
        store.insert("foo".to_string(), serde_json::json!("bar"));

        let mut inputs = HashMap::new();
        inputs.insert("key".to_string(), serde_json::json!("foo"));

        let result = executor.execute(inputs, Some(&store));
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_not_exists() {
        let executor = VarExists::new();
        let store: HashMap<String, Value> = HashMap::new();

        let mut inputs = HashMap::new();
        inputs.insert("key".to_string(), serde_json::json!("missing"));

        let result = executor.execute(inputs, Some(&store));
        assert_eq!(result.get("result"), Some(&serde_json::json!(false)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "var.exists");
        assert_eq!(executor.category, "var");
    }
}
