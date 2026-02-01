//! Workflow plugin: set variable.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// VarSet implements the NodeExecutor trait for setting variables.
pub struct VarSet {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl VarSet {
    /// Creates a new VarSet instance.
    pub fn new() -> Self {
        Self {
            node_type: "var.set",
            category: "var",
            description: "Set variable in workflow store",
        }
    }
}

impl Default for VarSet {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for VarSet {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        // Note: In a real implementation, runtime mutation would be handled by the executor
        // This plugin returns the key/value to be set, and the executor handles the mutation
        let key: Option<String> = inputs
            .get("key")
            .and_then(|v| serde_json::from_value(v.clone()).ok());

        let mut output = HashMap::new();

        match key {
            Some(k) => {
                let value = inputs.get("value").cloned().unwrap_or(Value::Null);

                output.insert("success".to_string(), serde_json::json!(true));
                output.insert("key".to_string(), serde_json::json!(k));
                output.insert("value".to_string(), value);
            }
            None => {
                output.insert("success".to_string(), serde_json::json!(false));
                output.insert("error".to_string(), serde_json::json!("key is required"));
            }
        }

        output
    }
}

/// Creates a new VarSet instance.
pub fn create() -> VarSet {
    VarSet::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set() {
        let executor = VarSet::new();
        let mut inputs = HashMap::new();
        inputs.insert("key".to_string(), serde_json::json!("foo"));
        inputs.insert("value".to_string(), serde_json::json!("bar"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("success"), Some(&serde_json::json!(true)));
        assert_eq!(result.get("key"), Some(&serde_json::json!("foo")));
        assert_eq!(result.get("value"), Some(&serde_json::json!("bar")));
    }

    #[test]
    fn test_set_missing_key() {
        let executor = VarSet::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!("bar"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("success"), Some(&serde_json::json!(false)));
        assert!(result.get("error").is_some());
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "var.set");
        assert_eq!(executor.category, "var");
    }
}
