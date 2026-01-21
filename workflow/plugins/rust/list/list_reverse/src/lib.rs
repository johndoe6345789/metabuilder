//! Workflow plugin: reverse a list.

use serde_json::Value;
use std::collections::HashMap;

/// Reverse a list.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let mut list: Vec<Value> = inputs
        .get("list")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    list.reverse();

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(list));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reverse() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([1, 2, 3]));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!([3, 2, 1])));
    }
}
