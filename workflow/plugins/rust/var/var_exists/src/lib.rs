//! Workflow plugin: check if variable exists.

use serde_json::Value;
use std::collections::HashMap;

/// Check if variable exists in workflow store.
pub fn run(runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let key: Option<String> = inputs
        .get("key")
        .and_then(|v| serde_json::from_value(v.clone()).ok());

    let mut output = HashMap::new();

    match key {
        Some(k) => {
            output.insert("result".to_string(), serde_json::json!(runtime.contains_key(&k)));
        }
        None => {
            output.insert("result".to_string(), serde_json::json!(false));
            output.insert("error".to_string(), serde_json::json!("key is required"));
        }
    }

    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_exists() {
        let mut runtime = HashMap::new();
        runtime.insert("foo".to_string(), serde_json::json!("bar"));

        let mut inputs = HashMap::new();
        inputs.insert("key".to_string(), serde_json::json!("foo"));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }
}
