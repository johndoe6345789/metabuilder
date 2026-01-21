//! Workflow plugin: concatenate lists.

use serde_json::Value;
use std::collections::HashMap;

/// Concatenate multiple lists.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let lists: Vec<Vec<Value>> = inputs
        .get("lists")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let result: Vec<Value> = lists.into_iter().flatten().collect();

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_concat() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("lists".to_string(), serde_json::json!([[1, 2], [3, 4]]));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!([1, 2, 3, 4])));
    }
}
