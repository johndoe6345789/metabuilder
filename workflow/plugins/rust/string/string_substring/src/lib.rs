//! Workflow plugin: substring.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// StringSubstring implements the NodeExecutor trait for extracting substrings.
pub struct StringSubstring {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl StringSubstring {
    /// Creates a new StringSubstring instance.
    pub fn new() -> Self {
        Self {
            node_type: "string.substring",
            category: "string",
            description: "Extract a substring from a string",
        }
    }
}

impl Default for StringSubstring {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for StringSubstring {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let string: String = inputs
            .get("string")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();
        let start: i64 = inputs
            .get("start")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(0);
        let end: Option<i64> = inputs
            .get("end")
            .and_then(|v| serde_json::from_value(v.clone()).ok());

        let chars: Vec<char> = string.chars().collect();
        let len = chars.len() as i64;

        // Handle negative indices
        let start_idx = if start < 0 { (len + start).max(0) } else { start.min(len) } as usize;
        let end_idx = match end {
            Some(e) if e < 0 => (len + e).max(0) as usize,
            Some(e) => e.min(len) as usize,
            None => len as usize,
        };

        let substring: String = if start_idx < end_idx {
            chars[start_idx..end_idx].iter().collect()
        } else {
            String::new()
        };

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(substring));
        result
    }
}

/// Creates a new StringSubstring instance.
pub fn create() -> StringSubstring {
    StringSubstring::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_substring() {
        let executor = StringSubstring::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("hello world"));
        inputs.insert("start".to_string(), serde_json::json!(0));
        inputs.insert("end".to_string(), serde_json::json!(5));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!("hello")));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "string.substring");
        assert_eq!(executor.category, "string");
    }
}
