//! Workflow plugin: concatenate strings.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// StringConcat implements the NodeExecutor trait for concatenating strings.
pub struct StringConcat {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl StringConcat {
    /// Creates a new StringConcat instance.
    pub fn new() -> Self {
        Self {
            node_type: "string.concat",
            category: "string",
            description: "Concatenate multiple strings",
        }
    }
}

impl Default for StringConcat {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for StringConcat {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let strings: Vec<String> = inputs
            .get("strings")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();
        let separator: String = inputs
            .get("separator")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let concatenated = strings.join(&separator);

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(concatenated));
        result
    }
}

/// Creates a new StringConcat instance.
pub fn create() -> StringConcat {
    StringConcat::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_concat() {
        let executor = StringConcat::new();
        let mut inputs = HashMap::new();
        inputs.insert("strings".to_string(), serde_json::json!(["hello", " ", "world"]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!("hello world")));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "string.concat");
        assert_eq!(executor.category, "string");
    }
}
