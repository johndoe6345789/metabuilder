//! Workflow plugin: sort a list.

use serde_json::Value;
use std::collections::HashMap;

/// Sort a list.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let mut list: Vec<Value> = inputs
        .get("list")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    list.sort_by(|a, b| {
        match (a, b) {
            // Numbers
            (Value::Number(n1), Value::Number(n2)) => {
                let f1 = n1.as_f64().unwrap_or(0.0);
                let f2 = n2.as_f64().unwrap_or(0.0);
                f1.partial_cmp(&f2).unwrap_or(std::cmp::Ordering::Equal)
            }
            // Strings
            (Value::String(s1), Value::String(s2)) => s1.cmp(s2),
            // Booleans (false < true)
            (Value::Bool(b1), Value::Bool(b2)) => b1.cmp(b2),
            // Null is smallest
            (Value::Null, Value::Null) => std::cmp::Ordering::Equal,
            (Value::Null, _) => std::cmp::Ordering::Less,
            (_, Value::Null) => std::cmp::Ordering::Greater,
            // Mixed types: compare by type name as fallback
            _ => std::cmp::Ordering::Equal,
        }
    });

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(list));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sort() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([3, 1, 2]));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!([1, 2, 3])));
    }
}
