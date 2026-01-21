//! Workflow plugin: check if list contains value.

use serde_json::Value;
use std::collections::HashMap;

/// Check if list contains value.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let list: Vec<Value> = inputs
        .get("list")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();
    let value = inputs.get("value").unwrap_or(&Value::Null);

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(list.contains(value)));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_contains() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([1, 2, 3]));
        inputs.insert("value".to_string(), serde_json::json!(2));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }
}
