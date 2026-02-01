//! Workflow plugin: value in list check.

use serde_json::Value;
use std::collections::HashMap;

/// Check if value is in list.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let value = inputs.get("value").unwrap_or(&Value::Null);
    let list: Vec<Value> = inputs
        .get("list")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(list.contains(value)));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_in() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(2));
        inputs.insert("list".to_string(), serde_json::json!([1, 2, 3]));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }
}
