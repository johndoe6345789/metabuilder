//! Workflow plugin: parse JSON string.

use serde_json::Value;
use std::collections::HashMap;

/// Parse JSON string to value.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let string: String = inputs
        .get("string")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let mut output = HashMap::new();

    match serde_json::from_str::<Value>(&string) {
        Ok(value) => {
            output.insert("result".to_string(), value);
        }
        Err(e) => {
            output.insert("result".to_string(), Value::Null);
            output.insert("error".to_string(), serde_json::json!(e.to_string()));
        }
    }

    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_json() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("{\"a\":1}"));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!({"a": 1})));
    }
}
