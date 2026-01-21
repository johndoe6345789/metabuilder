//! Workflow plugin: equals comparison.

use serde_json::Value;
use std::collections::HashMap;

/// Check if two values are equal.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let a = inputs.get("a").unwrap_or(&Value::Null);
    let b = inputs.get("b").unwrap_or(&Value::Null);

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(a == b));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_equals() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("a".to_string(), serde_json::json!(5));
        inputs.insert("b".to_string(), serde_json::json!(5));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }
}
