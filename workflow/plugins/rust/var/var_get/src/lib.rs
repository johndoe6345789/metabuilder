//! Workflow plugin: get variable.

use serde_json::Value;
use std::collections::HashMap;

/// Get variable from workflow store.
pub fn run(runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let key: Option<String> = inputs
        .get("key")
        .and_then(|v| serde_json::from_value(v.clone()).ok());

    let mut output = HashMap::new();

    match key {
        Some(k) => {
            let default = inputs.get("default").cloned().unwrap_or(Value::Null);
            let exists = runtime.contains_key(&k);
            let value = runtime.get(&k).cloned().unwrap_or(default);

            output.insert("result".to_string(), value);
            output.insert("exists".to_string(), serde_json::json!(exists));
        }
        None => {
            output.insert("result".to_string(), Value::Null);
            output.insert("exists".to_string(), serde_json::json!(false));
            output.insert("error".to_string(), serde_json::json!("key is required"));
        }
    }

    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get() {
        let mut runtime = HashMap::new();
        runtime.insert("foo".to_string(), serde_json::json!("bar"));

        let mut inputs = HashMap::new();
        inputs.insert("key".to_string(), serde_json::json!("foo"));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!("bar")));
        assert_eq!(result.get("exists"), Some(&serde_json::json!(true)));
    }
}
