//! Workflow plugin: get all variable keys.

use serde_json::Value;
use std::collections::HashMap;

/// Get all variable keys from workflow store.
pub fn run(runtime: &mut HashMap<String, Value>, _inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let keys: Vec<String> = runtime.keys().cloned().collect();

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(keys));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_keys() {
        let mut runtime = HashMap::new();
        runtime.insert("foo".to_string(), serde_json::json!("bar"));
        runtime.insert("baz".to_string(), serde_json::json!("qux"));

        let inputs = HashMap::new();
        let result = run(&mut runtime, &inputs).unwrap();

        let keys = result.get("result").unwrap().as_array().unwrap();
        assert_eq!(keys.len(), 2);
    }
}
