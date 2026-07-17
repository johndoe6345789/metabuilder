.pragma library

// Lua editor execution and security scan helpers.

function buildParams(scriptParams) {
    var result = []
    for (var i = 0; i < scriptParams.length; i++) {
        result.push({
            name: scriptParams[i].name,
            type: scriptParams[i].type,
            value: ""
        })
    }
    return result
}

function runScript(scriptName) {
    var ts = new Date().toLocaleTimeString()
    return "[" + ts + "] Executing "
        + scriptName + ".lua...\n"
        + "[" + ts + "] Script loaded"
        + " successfully (0.003s)\n"
        + "[" + ts + "] Return value: true\n"
        + "[" + ts + "] Execution completed"
        + " in 0.012s\n"
        + "[" + ts + "] Memory: 24.3 KB"
        + " allocated, 0 collections"
}

function runTest(scriptName, args) {
    var ts = new Date().toLocaleTimeString()
    return "--- Test Execution ---\n"
        + "[" + ts + "] Loading "
        + scriptName + ".lua\n"
        + "[" + ts + "] Arguments: { "
        + args.join(", ") + " }\n"
        + "[" + ts + "] Compiling... OK (0.001s)\n"
        + "[" + ts + "] Executing... OK (0.008s)\n"
        + "[" + ts + "] Return: true\n"
        + "[" + ts + "] Status: SUCCESS\n"
        + "[" + ts + "] Memory used: 18.7 KB\n"
        + "[" + ts + "] CPU time: 0.008s"
}

function securityScan(scriptName) {
    if (scriptName === "hash_password")
        return "WARN: Ensure ITERATIONS >= 10000"
            + " for PBKDF2\n"
            + "WARN: Verify salt entropy"
            + " (minimum 128 bits)\n"
            + "PASS: No raw SQL detected\n"
            + "PASS: No os.execute() calls\n"
            + "PASS: No file system access\n\n"
            + "1 advisory, 0 critical issues"
    if (scriptName === "check_permissions")
        return "PASS: No raw SQL detected\n"
            + "PASS: No os.execute() calls\n"
            + "PASS: No file system access\n"
            + "PASS: No network calls"
            + " outside event bus\n"
            + "PASS: Input validation present"
            + "\n\nNo issues found"
    return "PASS: No raw SQL detected\n"
        + "PASS: No os.execute() calls\n"
        + "PASS: No file system access\n"
        + "PASS: No unsafe string"
        + " concatenation\n"
        + "PASS: No global variable"
        + " pollution\n\nNo issues found"
}

function updateParamValue(params, index, value) {
    var p = params.slice()
    p[index] = {
        name: p[index].name,
        type: p[index].type,
        value: value
    }
    return p
}

function exampleLabels(examples) {
    if (!examples) return [];
    var labels = [];
    for (var i = 0; i < examples.length; i++)
        labels.push(examples[i].label);
    return labels;
}

function newScript(root) {
    root.curCode =
        "-- new_script.lua\n"
        + "-- Enter your Lua code here\n\n"
        + "local function main()\n"
        + "    -- TODO: implement\n"
        + "    return nil\nend\n\n"
        + "return main";
    root.curName = "new_script";
    root.curDesc = "New untitled script";
    root.curRet = "nil";
    root.curParams = [];
    root.testOutput = "";
    root.scanResult = "";
}

function loadJson(relativePath) {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", relativePath, false)
    xhr.send()
    if (xhr.status === 200 || xhr.status === 0) {
        try { return JSON.parse(xhr.responseText) }
        catch(e) { return [] }
    }
    return []
}
