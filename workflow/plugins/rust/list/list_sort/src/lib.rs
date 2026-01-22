//! Workflow plugin: sort a list.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ListSort implements the NodeExecutor trait for sorting lists.
pub struct ListSort {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ListSort {
    /// Creates a new ListSort instance.
    pub fn new() -> Self {
        Self {
            node_type: "list.sort",
            category: "list",
            description: "Sort a list",
        }
    }
}

impl Default for ListSort {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ListSort {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let mut list: Vec<Value> = inputs
            .get("list")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        list.sort_by(|a, b| {
            match (a, b) {
                // Numbers
                (Value::Number(n1), Value::Number(n2)) => {
                    let f1 = n1.as_f64().unwrap_or(0.0);
                    let f2 = n2.as_f64().unwrap_or(0.0);
                    f1.partial_cmp(&f2).unwrap_or(std::cmp::Ordering::Equal)
                }
                // Strings
                (Value::String(s1), Value::String(s2)) => s1.cmp(s2),
                // Booleans (false < true)
                (Value::Bool(b1), Value::Bool(b2)) => b1.cmp(b2),
                // Null is smallest
                (Value::Null, Value::Null) => std::cmp::Ordering::Equal,
                (Value::Null, _) => std::cmp::Ordering::Less,
                (_, Value::Null) => std::cmp::Ordering::Greater,
                // Mixed types: compare by type name as fallback
                _ => std::cmp::Ordering::Equal,
            }
        });

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(list));
        result
    }
}

/// Creates a new ListSort instance.
pub fn create() -> ListSort {
    ListSort::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sort() {
        let executor = ListSort::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([3, 1, 2]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!([1, 2, 3])));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "list.sort");
        assert_eq!(executor.category, "list");
    }
}
