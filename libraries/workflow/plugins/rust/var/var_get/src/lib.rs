//! Workflow plugin: get variable.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// VarGet implements the NodeExecutor trait for getting variables.
pub struct VarGet {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl VarGet {
    /// Creates a new VarGet instance.
    pub fn new() -> Self {
        Self {
            node_type: "var.get",
            category: "var",
            description: "Get variable from workflow store",
        }
    }
}

impl Default for VarGet {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for VarGet {
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let key: Option<String> = inputs
            .get("key")
            .and_then(|v| serde_json::from_value(v.clone()).ok());

        let mut output = HashMap::new();

        match key {
            Some(k) => {
                let default = inputs.get("default").cloned().unwrap_or(Value::Null);

                // Try to downcast runtime to HashMap<String, Value>
                let (value, exists) = if let Some(rt) = runtime {
                    if let Some(store) = rt.downcast_ref::<HashMap<String, Value>>() {
                        let exists = store.contains_key(&k);
                        let value = store.get(&k).cloned().unwrap_or(default);
                        (value, exists)
                    } else {
                        (default, false)
                    }
                } else {
                    (default, false)
                };

                output.insert("result".to_string(), value);
                output.insert("exists".to_string(), serde_json::json!(exists));
            }
            None => {
                output.insert("result".to_string(), Value::Null);
                output.insert("exists".to_string(), serde_json::json!(false));
                output.insert("error".to_string(), serde_json::json!("key is required"));
            }
        }

        output
    }
}

/// Creates a new VarGet instance.
pub fn create() -> VarGet {
    VarGet::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_with_runtime() {
        let executor = VarGet::new();
        let mut store: HashMap<String, Value> = HashMap::new();
        store.insert("foo".to_string(), serde_json::json!("bar"));

        let mut inputs = HashMap::new();
        inputs.insert("key".to_string(), serde_json::json!("foo"));

        let result = executor.execute(inputs, Some(&store));
        assert_eq!(result.get("result"), Some(&serde_json::json!("bar")));
        assert_eq!(result.get("exists"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_get_missing_key() {
        let executor = VarGet::new();
        let store: HashMap<String, Value> = HashMap::new();

        let mut inputs = HashMap::new();
        inputs.insert("key".to_string(), serde_json::json!("missing"));
        inputs.insert("default".to_string(), serde_json::json!("default_value"));

        let result = executor.execute(inputs, Some(&store));
        assert_eq!(result.get("result"), Some(&serde_json::json!("default_value")));
        assert_eq!(result.get("exists"), Some(&serde_json::json!(false)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "var.get");
        assert_eq!(executor.category, "var");
    }
}
