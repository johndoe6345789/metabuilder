//! Type conversion workflow plugins

use crate::{get_input, output, PluginResult, Runtime};
use serde_json::Value;
use std::collections::HashMap;

/// Convert value to string.
pub fn to_string(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value = inputs.get("value").unwrap_or(&Value::Null);

    let result = match value {
        Value::String(s) => s.clone(),
        Value::Null => String::new(),
        _ => serde_json::to_string(value).unwrap_or_default(),
    };

    Ok(output!("result" => result))
}

/// Convert value to number.
pub fn to_number(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value = inputs.get("value").unwrap_or(&Value::Null);

    let result = match value {
        Value::Number(n) => n.as_f64().unwrap_or(0.0),
        Value::String(s) => s.parse::<f64>().unwrap_or(0.0),
        Value::Bool(b) => if *b { 1.0 } else { 0.0 },
        _ => 0.0,
    };

    Ok(output!("result" => result))
}

/// Convert value to boolean.
pub fn to_boolean(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value = inputs.get("value").unwrap_or(&Value::Null);

    let result = match value {
        Value::Bool(b) => *b,
        Value::Number(n) => n.as_f64().map(|f| f != 0.0).unwrap_or(false),
        Value::String(s) => {
            let lower = s.to_lowercase();
            lower == "true" || lower == "1" || lower == "yes"
        }
        Value::Null => false,
        Value::Array(a) => !a.is_empty(),
        Value::Object(o) => !o.is_empty(),
    };

    Ok(output!("result" => result))
}

/// Convert value to JSON string.
pub fn to_json(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value = inputs.get("value").unwrap_or(&Value::Null);
    let pretty: bool = get_input(inputs, "pretty").unwrap_or(false);

    let result = if pretty {
        serde_json::to_string_pretty(value).unwrap_or_default()
    } else {
        serde_json::to_string(value).unwrap_or_default()
    };

    Ok(output!("result" => result))
}

/// Parse JSON string to value.
pub fn parse_json(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();

    match serde_json::from_str::<Value>(&string) {
        Ok(value) => Ok(output!("result" => value)),
        Err(e) => Ok(output!("result" => Value::Null, "error" => e.to_string())),
    }
}

/// Convert value to list.
pub fn to_list(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value = inputs.get("value").unwrap_or(&Value::Null);

    let result = match value {
        Value::Array(a) => a.clone(),
        Value::String(s) => s.chars().map(|c| Value::String(c.to_string())).collect(),
        Value::Null => vec![],
        _ => vec![value.clone()],
    };

    Ok(output!("result" => result))
}

/// Convert value to object/dict.
pub fn to_object(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value = inputs.get("value").unwrap_or(&Value::Null);

    let result = match value {
        Value::Object(o) => Value::Object(o.clone()),
        Value::Array(a) => {
            // Convert array of [key, value] pairs to object
            let mut obj = serde_json::Map::new();
            for item in a {
                if let Value::Array(pair) = item {
                    if pair.len() >= 2 {
                        if let Value::String(key) = &pair[0] {
                            obj.insert(key.clone(), pair[1].clone());
                        }
                    }
                }
            }
            Value::Object(obj)
        }
        _ => Value::Object(serde_json::Map::new()),
    };

    Ok(output!("result" => result))
}
