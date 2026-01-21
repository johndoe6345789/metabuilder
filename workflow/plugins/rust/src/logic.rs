//! Boolean logic workflow plugins

use crate::{get_input, output, PluginResult, Runtime};
use serde_json::Value;
use std::collections::HashMap;

/// Helper to convert Value to bool
fn to_bool(v: &Value) -> bool {
    match v {
        Value::Bool(b) => *b,
        Value::Number(n) => n.as_f64().map(|f| f != 0.0).unwrap_or(false),
        Value::String(s) => !s.is_empty(),
        Value::Null => false,
        Value::Array(a) => !a.is_empty(),
        Value::Object(o) => !o.is_empty(),
    }
}

/// Logical AND on boolean values.
pub fn and(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let values: Vec<Value> = get_input(inputs, "values").unwrap_or_default();

    let result = values.iter().all(to_bool);
    Ok(output!("result" => result))
}

/// Logical OR on boolean values.
pub fn or(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let values: Vec<Value> = get_input(inputs, "values").unwrap_or_default();

    let result = values.iter().any(to_bool);
    Ok(output!("result" => result))
}

/// Logical NOT on a boolean value.
pub fn not(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value = inputs.get("value").unwrap_or(&Value::Null);
    Ok(output!("result" => !to_bool(value)))
}

/// Logical XOR on boolean values.
pub fn xor(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let values: Vec<Value> = get_input(inputs, "values").unwrap_or_default();

    let true_count = values.iter().filter(|v| to_bool(v)).count();
    Ok(output!("result" => true_count == 1))
}

/// Check if two values are equal.
pub fn equals(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let a = inputs.get("a").unwrap_or(&Value::Null);
    let b = inputs.get("b").unwrap_or(&Value::Null);

    Ok(output!("result" => a == b))
}

/// Check if a > b.
pub fn greater_than(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let a: f64 = get_input(inputs, "a").unwrap_or(0.0);
    let b: f64 = get_input(inputs, "b").unwrap_or(0.0);

    Ok(output!("result" => a > b))
}

/// Check if a >= b.
pub fn greater_than_or_equal(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let a: f64 = get_input(inputs, "a").unwrap_or(0.0);
    let b: f64 = get_input(inputs, "b").unwrap_or(0.0);

    Ok(output!("result" => a >= b))
}

/// Check if a < b.
pub fn less_than(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let a: f64 = get_input(inputs, "a").unwrap_or(0.0);
    let b: f64 = get_input(inputs, "b").unwrap_or(0.0);

    Ok(output!("result" => a < b))
}

/// Check if a <= b.
pub fn less_than_or_equal(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let a: f64 = get_input(inputs, "a").unwrap_or(0.0);
    let b: f64 = get_input(inputs, "b").unwrap_or(0.0);

    Ok(output!("result" => a <= b))
}

/// Check if value is in list.
pub fn is_in(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value = inputs.get("value").unwrap_or(&Value::Null);
    let list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();

    Ok(output!("result" => list.contains(value)))
}
