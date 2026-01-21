//! Variable management workflow plugins

use crate::{get_input, output, PluginResult, Runtime};
use serde_json::Value;
use std::collections::HashMap;

/// Get variable from workflow store.
pub fn get(runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let key: String = match get_input(inputs, "key") {
        Some(k) => k,
        None => return Ok(output!("result" => Value::Null, "exists" => false, "error" => "key is required")),
    };

    let default = inputs.get("default").cloned().unwrap_or(Value::Null);

    let exists = runtime.store.contains_key(&key);
    let value = runtime.store.get(&key).cloned().unwrap_or(default);

    Ok(output!("result" => value, "exists" => exists))
}

/// Set variable in workflow store.
pub fn set(runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let key: String = match get_input(inputs, "key") {
        Some(k) => k,
        None => return Ok(output!("success" => false, "error" => "key is required")),
    };

    let value = inputs.get("value").cloned().unwrap_or(Value::Null);
    runtime.store.insert(key.clone(), value);

    Ok(output!("success" => true, "key" => key))
}

/// Delete variable from workflow store.
pub fn delete(runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let key: String = match get_input(inputs, "key") {
        Some(k) => k,
        None => return Ok(output!("success" => false, "error" => "key is required")),
    };

    let existed = runtime.store.remove(&key).is_some();

    Ok(output!("success" => true, "existed" => existed))
}

/// Check if variable exists in workflow store.
pub fn exists(runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let key: String = match get_input(inputs, "key") {
        Some(k) => k,
        None => return Ok(output!("result" => false, "error" => "key is required")),
    };

    Ok(output!("result" => runtime.store.contains_key(&key)))
}

/// Get all variable keys from workflow store.
pub fn keys(runtime: &mut Runtime, _inputs: &HashMap<String, Value>) -> PluginResult {
    let keys: Vec<String> = runtime.store.keys().cloned().collect();
    Ok(output!("result" => keys))
}

/// Clear all variables from workflow store.
pub fn clear(runtime: &mut Runtime, _inputs: &HashMap<String, Value>) -> PluginResult {
    let count = runtime.store.len();
    runtime.store.clear();
    Ok(output!("success" => true, "cleared" => count))
}
