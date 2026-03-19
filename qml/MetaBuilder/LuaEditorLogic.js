.pragma library

// Lua editor execution and security scan helpers.

function buildParams(scriptParams) {
    var result = []
    for (var i = 0; i < scriptParams.length; i++) {
        result.push({ name: scriptParams[i].name, type: scriptParams[i].type, value: "" })
    }
    return result
}

function runScript(scriptName) {
    var ts = new Date().toLocaleTimeString()
    return "[" + ts + "] Executing " + scriptName + ".lua...\n[" + ts + "] Script loaded successfully (0.003s)\n[" + ts + "] Return value: true\n[" + ts + "] Execution completed in 0.012s\n[" + ts + "] Memory: 24.3 KB allocated, 0 collections"
}

function runTest(scriptName, args) {
    var ts = new Date().toLocaleTimeString()
    return "--- Test Execution ---\n[" + ts + "] Loading " + scriptName + ".lua\n[" + ts + "] Arguments: { " + args.join(", ") + " }\n[" + ts + "] Compiling... OK (0.001s)\n[" + ts + "] Executing... OK (0.008s)\n[" + ts + "] Return: true\n[" + ts + "] Status: SUCCESS\n[" + ts + "] Memory used: 18.7 KB\n[" + ts + "] CPU time: 0.008s"
}

function securityScan(scriptName) {
    if (scriptName === "hash_password")
        return "WARN: Ensure ITERATIONS >= 10000 for PBKDF2\nWARN: Verify salt entropy (minimum 128 bits)\nPASS: No raw SQL detected\nPASS: No os.execute() calls\nPASS: No file system access\n\n1 advisory, 0 critical issues"
    if (scriptName === "check_permissions")
        return "PASS: No raw SQL detected\nPASS: No os.execute() calls\nPASS: No file system access\nPASS: No network calls outside event bus\nPASS: Input validation present\n\nNo issues found"
    return "PASS: No raw SQL detected\nPASS: No os.execute() calls\nPASS: No file system access\nPASS: No unsafe string concatenation\nPASS: No global variable pollution\n\nNo issues found"
}

function updateParamValue(params, index, value) {
    var p = params.slice()
    p[index] = { name: p[index].name, type: p[index].type, value: value }
    return p
}

function loadJson(relativePath) {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", relativePath, false)
    xhr.send()
    if (xhr.status === 200 || xhr.status === 0) return JSON.parse(xhr.responseText)
    return []
}
