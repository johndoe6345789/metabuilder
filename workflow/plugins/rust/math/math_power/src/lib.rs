//! Workflow plugin: power operation.

use serde_json::Value;
use std::collections::HashMap;

/// Calculate power of a number.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let base: f64 = inputs
        .get("base")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(0.0);
    let exp: f64 = inputs
        .get("exponent")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(1.0);

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(base.powf(exp)));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_power() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("base".to_string(), serde_json::json!(2.0));
        inputs.insert("exponent".to_string(), serde_json::json!(3.0));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(8.0)));
    }
}
