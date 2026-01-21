//! Workflow plugin: clear all variables.

use serde_json::Value;
use std::collections::HashMap;

/// Clear all variables from workflow store.
pub fn run(runtime: &mut HashMap<String, Value>, _inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let count = runtime.len();
    runtime.clear();

    let mut output = HashMap::new();
    output.insert("success".to_string(), serde_json::json!(true));
    output.insert("cleared".to_string(), serde_json::json!(count));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clear() {
        let mut runtime = HashMap::new();
        runtime.insert("foo".to_string(), serde_json::json!("bar"));
        runtime.insert("baz".to_string(), serde_json::json!("qux"));

        let inputs = HashMap::new();
        let result = run(&mut runtime, &inputs).unwrap();

        assert_eq!(result.get("success"), Some(&serde_json::json!(true)));
        assert_eq!(result.get("cleared"), Some(&serde_json::json!(2)));
        assert!(runtime.is_empty());
    }
}
