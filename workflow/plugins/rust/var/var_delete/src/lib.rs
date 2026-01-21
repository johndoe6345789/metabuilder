//! Workflow plugin: delete variable.

use serde_json::Value;
use std::collections::HashMap;

/// Delete variable from workflow store.
pub fn run(runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let key: Option<String> = inputs
        .get("key")
        .and_then(|v| serde_json::from_value(v.clone()).ok());

    let mut output = HashMap::new();

    match key {
        Some(k) => {
            let existed = runtime.remove(&k).is_some();

            output.insert("success".to_string(), serde_json::json!(true));
            output.insert("existed".to_string(), serde_json::json!(existed));
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
    fn test_delete() {
        let mut runtime = HashMap::new();
        runtime.insert("foo".to_string(), serde_json::json!("bar"));

        let mut inputs = HashMap::new();
        inputs.insert("key".to_string(), serde_json::json!("foo"));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("success"), Some(&serde_json::json!(true)));
        assert_eq!(result.get("existed"), Some(&serde_json::json!(true)));
        assert!(!runtime.contains_key("foo"));
    }
}
