//! Workflow plugin: convert to object.

use serde_json::Value;
use std::collections::HashMap;

/// Convert value to object/dict.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let value = inputs.get("value").unwrap_or(&Value::Null);

    let result = match value {
        Value::Object(o) => Value::Object(o.clone()),
        Value::Array(a) => {
            // Convert array of [key, value] pairs to object
            let mut obj = serde_json::Map::new();
            for item in a {
                if let Value::Array(pair) = item {
                    if pair.len() >= 2 {
                        if let Value::String(key) = &pair[0] {
                            obj.insert(key.clone(), pair[1].clone());
                        }
                    }
                }
            }
            Value::Object(obj)
        }
        _ => Value::Object(serde_json::Map::new()),
    };

    let mut output = HashMap::new();
    output.insert("result".to_string(), result);
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_object() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!([["a", 1], ["b", 2]]));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!({"a": 1, "b": 2})));
    }
}
