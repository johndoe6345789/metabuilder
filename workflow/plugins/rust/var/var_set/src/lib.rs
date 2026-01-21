//! Workflow plugin: set variable.

use serde_json::Value;
use std::collections::HashMap;

/// Set variable in workflow store.
pub fn run(runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let key: Option<String> = inputs
        .get("key")
        .and_then(|v| serde_json::from_value(v.clone()).ok());

    let mut output = HashMap::new();

    match key {
        Some(k) => {
            let value = inputs.get("value").cloned().unwrap_or(Value::Null);
            runtime.insert(k.clone(), value);

            output.insert("success".to_string(), serde_json::json!(true));
            output.insert("key".to_string(), serde_json::json!(k));
        }
        None => {
            output.insert("success".to_string(), serde_json::json!(false));
            output.insert("error".to_string(), serde_json::json!("key is required"));
        }
    }

    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("key".to_string(), serde_json::json!("foo"));
        inputs.insert("value".to_string(), serde_json::json!("bar"));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("success"), Some(&serde_json::json!(true)));
        assert_eq!(runtime.get("foo"), Some(&serde_json::json!("bar")));
    }
}
