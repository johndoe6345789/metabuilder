//! Workflow plugin: split a string.

use serde_json::Value;
use std::collections::HashMap;

/// Split a string by separator.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let string: String = inputs
        .get("string")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();
    let separator: String = inputs
        .get("separator")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let result: Vec<String> = if separator.is_empty() {
        string.chars().map(|c| c.to_string()).collect()
    } else {
        string.split(&separator).map(|s| s.to_string()).collect()
    };

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_split() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("a,b,c"));
        inputs.insert("separator".to_string(), serde_json::json!(","));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(["a", "b", "c"])));
    }
}
