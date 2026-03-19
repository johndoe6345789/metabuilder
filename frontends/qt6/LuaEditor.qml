import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder"

Rectangle {
    id: luaEditorRoot
    color: "transparent"

    property int selectedScriptIndex: 0
    property string testOutput: ""
    property string securityScanResult: ""

    property var scripts: [
        {
            name: "validate_email",
            description: "Validates email format using pattern matching",
            returnType: "boolean",
            params: [{ name: "email", type: "string" }],
            code:
"-- validate_email.lua\n-- Validates an email address against RFC 5322 simplified pattern\n\nlocal function validate_email(email)\n    if type(email) ~= \"string\" then\n        return false, \"Input must be a string\"\n    end\n\n    if #email == 0 or #email > 254 then\n        return false, \"Email length out of range\"\n    end\n\n    local pattern = \"^[%w%.%%%+%-]+@[%w%.%-]+%.%a%a+$\"\n    if not email:match(pattern) then\n        return false, \"Invalid email format\"\n    end\n\n    local local_part, domain = email:match(\"^(.+)@(.+)$\")\n    if #local_part > 64 then\n        return false, \"Local part exceeds 64 characters\"\n    end\n\n    -- Check for consecutive dots\n    if email:find(\"..\") then\n        return false, \"Consecutive dots not allowed\"\n    end\n\n    return true, \"Valid email\"\nend\n\nreturn validate_email"
        },
        {
            name: "hash_password",
            description: "Hashes a password with salt using SHA-512 via built-in crypto",
            returnType: "string",
            params: [{ name: "password", type: "string" }, { name: "salt", type: "string" }],
            code:
"-- hash_password.lua\n-- Secure password hashing with salt and iteration\n\nlocal crypto = require(\"metabuilder.crypto\")\n\nlocal ITERATIONS = 10000\nlocal HASH_LENGTH = 64\n\nlocal function hash_password(password, salt)\n    if type(password) ~= \"string\" or #password < 8 then\n        error(\"Password must be at least 8 characters\")\n    end\n\n    if type(salt) ~= \"string\" or #salt < 16 then\n        error(\"Salt must be at least 16 characters\")\n    end\n\n    local derived = crypto.pbkdf2({\n        password = password,\n        salt = salt,\n        iterations = ITERATIONS,\n        hash = \"sha512\",\n        length = HASH_LENGTH\n    })\n\n    return string.format(\n        \"$pbkdf2-sha512$i=%d$%s$%s\",\n        ITERATIONS,\n        crypto.base64_encode(salt),\n        crypto.base64_encode(derived)\n    )\nend\n\nreturn hash_password"
        },
        {
            name: "format_date",
            description: "Formats a UNIX timestamp into human-readable date strings",
            returnType: "string",
            params: [{ name: "timestamp", type: "number" }, { name: "format", type: "string" }],
            code:
"-- format_date.lua\n-- Flexible date formatting from UNIX timestamps\n\nlocal FORMATS = {\n    iso8601  = \"!%Y-%m-%dT%H:%M:%SZ\",\n    short    = \"%Y-%m-%d\",\n    long     = \"%B %d, %Y %H:%M\",\n    relative = nil,\n    rfc2822  = \"!%a, %d %b %Y %H:%M:%S GMT\"\n}\n\nlocal function relative_time(timestamp)\n    local diff = os.time() - timestamp\n    if diff < 60 then return \"just now\" end\n    if diff < 3600 then return math.floor(diff / 60) .. \" minutes ago\" end\n    if diff < 86400 then return math.floor(diff / 3600) .. \" hours ago\" end\n    if diff < 2592000 then return math.floor(diff / 86400) .. \" days ago\" end\n    return math.floor(diff / 2592000) .. \" months ago\"\nend\n\nlocal function format_date(timestamp, format)\n    timestamp = tonumber(timestamp)\n    if not timestamp then\n        error(\"Invalid timestamp\")\n    end\n\n    format = format or \"iso8601\"\n\n    if format == \"relative\" then\n        return relative_time(timestamp)\n    end\n\n    local fmt = FORMATS[format]\n    if not fmt then\n        error(\"Unknown format: \" .. format)\n    end\n\n    return os.date(fmt, timestamp)\nend\n\nreturn format_date"
        },
        {
            name: "send_notification",
            description: "Sends a notification through the event bus to subscribed channels",
            returnType: "table",
            params: [{ name: "user_id", type: "string" }, { name: "message", type: "string" }, { name: "channel", type: "string" }],
            code:
"-- send_notification.lua\n-- Dispatches notifications through the MetaBuilder event bus\n\nlocal eventbus = require(\"metabuilder.eventbus\")\nlocal json = require(\"metabuilder.json\")\n\nlocal CHANNELS = {\n    email = { priority = 1, retry = 3 },\n    push  = { priority = 2, retry = 1 },\n    sms   = { priority = 3, retry = 2 },\n    slack = { priority = 2, retry = 2 },\n    webhook = { priority = 4, retry = 5 }\n}\n\nlocal function send_notification(user_id, message, channel)\n    if not user_id or #user_id == 0 then\n        return { success = false, error = \"user_id is required\" }\n    end\n\n    if not message or #message == 0 then\n        return { success = false, error = \"message is required\" }\n    end\n\n    channel = channel or \"push\"\n    local ch_config = CHANNELS[channel]\n    if not ch_config then\n        return { success = false, error = \"Unknown channel: \" .. channel }\n    end\n\n    local payload = {\n        type = \"notification\",\n        user_id = user_id,\n        message = message,\n        channel = channel,\n        priority = ch_config.priority,\n        timestamp = os.time(),\n        retry_count = ch_config.retry\n    }\n\n    local ok, err = eventbus.publish(\"notifications\", json.encode(payload))\n    if not ok then\n        return { success = false, error = err }\n    end\n\n    return { success = true, id = payload.timestamp, channel = channel }\nend\n\nreturn send_notification"
        },
        {
            name: "check_permissions",
            description: "Checks user permissions against ACL rules from JSON config",
            returnType: "boolean",
            params: [{ name: "user_id", type: "string" }, { name: "resource", type: "string" }, { name: "action", type: "string" }],
            code:
"-- check_permissions.lua\n-- ACL permission checker against JSON-defined rules\n\nlocal dbal = require(\"metabuilder.dbal\")\nlocal json = require(\"metabuilder.json\")\n\nlocal ACTIONS = { \"read\", \"write\", \"delete\", \"admin\" }\nlocal ACTION_HIERARCHY = { read = 1, write = 2, delete = 3, admin = 4 }\n\nlocal function check_permissions(user_id, resource, action)\n    if not user_id or not resource or not action then\n        return false, \"All parameters are required\"\n    end\n\n    if not ACTION_HIERARCHY[action] then\n        return false, \"Invalid action: \" .. tostring(action)\n    end\n\n    local user = dbal.get(\"core\", \"users\", user_id)\n    if not user then\n        return false, \"User not found\"\n    end\n\n    if user.role == \"god\" then\n        return true, \"God role: unrestricted\"\n    end\n\n    local acl = dbal.get(\"core\", \"acl_rules\", resource)\n    if not acl then\n        return false, \"No ACL rules for resource\"\n    end\n\n    local allowed = acl.roles[user.role]\n    if not allowed then\n        return false, \"Role not permitted\"\n    end\n\n    local required_level = ACTION_HIERARCHY[action]\n    local granted_level = ACTION_HIERARCHY[allowed.max_action] or 0\n\n    return granted_level >= required_level,\n           granted_level >= required_level and \"Permitted\" or \"Insufficient privileges\"\nend\n\nreturn check_permissions"
        },
        {
            name: "generate_slug",
            description: "Generates URL-safe slugs from arbitrary text with transliteration",
            returnType: "string",
            params: [{ name: "text", type: "string" }, { name: "max_length", type: "number" }],
            code:
"-- generate_slug.lua\n-- URL-safe slug generation with Unicode transliteration\n\nlocal TRANSLITERATE = {\n    [\"a\"] = \"a\", [\"o\"] = \"o\", [\"u\"] = \"u\",\n    [\"A\"] = \"A\", [\"O\"] = \"O\", [\"U\"] = \"U\",\n    [\"n\"] = \"n\", [\"c\"] = \"c\", [\"e\"] = \"e\",\n    [\"ss\"] = \"ss\"\n}\n\nlocal function generate_slug(text, max_length)\n    if type(text) ~= \"string\" or #text == 0 then\n        error(\"Input text is required\")\n    end\n\n    max_length = max_length or 80\n    local slug = text\n    slug = slug:lower()\n    for from, to in pairs(TRANSLITERATE) do\n        slug = slug:gsub(from, to)\n    end\n    slug = slug:gsub(\"[^%w%-]\", \"-\")\n    slug = slug:gsub(\"%-+\", \"-\")\n    slug = slug:gsub(\"^%-+\", \"\"):gsub(\"%-+$\", \"\")\n    if #slug > max_length then\n        slug = slug:sub(1, max_length)\n        local last_hyphen = slug:find(\"%-[^%-]*$\")\n        if last_hyphen and last_hyphen > max_length * 0.5 then\n            slug = slug:sub(1, last_hyphen - 1)\n        end\n    end\n    return slug\nend\n\nreturn generate_slug"
        }
    ]

    property var snippets: [
        { name: "iterate_table", label: "Iterate Table", code: "-- Iterate over a table\nfor key, value in pairs(my_table) do\n    print(string.format(\"%s = %s\", tostring(key), tostring(value)))\nend" },
        { name: "string_manipulation", label: "String Manipulation", code: "-- String manipulation helpers\nlocal str = \"Hello, MetaBuilder!\"\nlocal upper = str:upper()\nlocal sub = str:sub(1, 5)\nlocal replaced = str:gsub(\"MetaBuilder\", \"World\")\nlocal formatted = string.format(\"Result: %s (len=%d)\", replaced, #replaced)" },
        { name: "kv_operations", label: "KV Store Operations", code: "-- Key-value store operations\nlocal kv = require(\"metabuilder.kv\")\n\nkv.set(\"session:\" .. user_id, json.encode(session_data), { ttl = 3600 })\nlocal cached = kv.get(\"session:\" .. user_id)\nif cached then\n    local session = json.decode(cached)\nend\nkv.delete(\"session:\" .. user_id)" },
        { name: "http_request", label: "HTTP Request", code: "-- HTTP request via built-in client\nlocal http = require(\"metabuilder.http\")\n\nlocal response = http.request({\n    method = \"POST\",\n    url = \"https://api.example.com/webhook\",\n    headers = {\n        [\"Content-Type\"] = \"application/json\",\n        [\"Authorization\"] = \"Bearer \" .. token\n    },\n    body = json.encode({ event = \"user.created\", data = payload }),\n    timeout = 5000\n})\n\nif response.status == 200 then\n    local result = json.decode(response.body)\nend" }
    ]

    property var exampleCodes: [
        { label: "Select example...", code: "" },
        { label: "DBAL Entity Query", code: "-- Query entities from DBAL\nlocal dbal = require(\"metabuilder.dbal\")\n\nlocal users = dbal.query(\"core\", \"users\", {\n    where = { role = \"admin\", active = true },\n    order_by = \"created_at DESC\",\n    limit = 50\n})\n\nfor _, user in ipairs(users) do\n    print(string.format(\"[%s] %s (%s)\", user.id, user.name, user.role))\nend" },
        { label: "Workflow Trigger", code: "-- Trigger a workflow from Lua\nlocal workflow = require(\"metabuilder.workflow\")\n\nlocal result = workflow.trigger(\"on_user_created\", {\n    tenant_id = ctx.tenant_id,\n    user_id = new_user.id,\n    email = new_user.email,\n    source = \"lua_script\"\n})\n\nif result.success then\n    log.info(\"Workflow dispatched: \" .. result.execution_id)\nelse\n    log.error(\"Workflow failed: \" .. result.error)\nend" },
        { label: "JSON Schema Validation", code: "-- Validate data against a JSON schema\nlocal schema = require(\"metabuilder.schema\")\n\nlocal user_schema = schema.load(\"entities/user\")\n\nlocal data = {\n    name = \"demo_user\",\n    email = \"demo@example.com\",\n    role = \"user\"\n}\n\nlocal valid, errors = schema.validate(data, user_schema)\nif not valid then\n    for _, err in ipairs(errors) do\n        log.warn(\"Validation error: \" .. err.path .. \" - \" .. err.message)\n    end\nend" }
    ]

    property int selectedExampleIndex: 0

    // Editable code state
    property string currentCode: scripts[selectedScriptIndex].code
    property string currentName: scripts[selectedScriptIndex].name
    property string currentDescription: scripts[selectedScriptIndex].description
    property string currentReturnType: scripts[selectedScriptIndex].returnType
    property var currentParams: {
        var result = [];
        var p = scripts[selectedScriptIndex].params;
        for (var i = 0; i < p.length; i++) { result.push({ name: p[i].name, type: p[i].type, value: "" }); }
        return result;
    }

    onSelectedScriptIndexChanged: {
        var s = scripts[selectedScriptIndex];
        currentCode = s.code; currentName = s.name; currentDescription = s.description; currentReturnType = s.returnType;
        var result = [];
        for (var i = 0; i < s.params.length; i++) { result.push({ name: s.params[i].name, type: s.params[i].type, value: "" }); }
        currentParams = result; testOutput = ""; securityScanResult = ""; selectedExampleIndex = 0;
    }

    RowLayout {
        anchors.fill: parent
        spacing: 0

        // LEFT SIDEBAR
        LuaScriptSidebar {
            scripts: luaEditorRoot.scripts
            snippets: luaEditorRoot.snippets
            selectedScriptIndex: luaEditorRoot.selectedScriptIndex
            onScriptSelected: function(index) { luaEditorRoot.selectedScriptIndex = index }
            onSnippetInserted: function(code) { currentCode = currentCode + "\n\n" + code }
        }

        // CENTER: Editor area + bottom panels
        ColumnLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0

            // TOP BAR
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 52
                color: Theme.paper
                border.color: Theme.border
                border.width: 1

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 16; anchors.rightMargin: 16
                    spacing: 12

                    CText { variant: "h4"; text: currentName + ".lua" }
                    CBadge { text: currentReturnType }
                    Item { Layout.fillWidth: true }

                    CSelect {
                        Layout.preferredWidth: 200
                        model: { var labels = []; for (var i = 0; i < exampleCodes.length; i++) { labels.push(exampleCodes[i].label); } return labels; }
                        currentIndex: selectedExampleIndex
                        onCurrentIndexChanged: { selectedExampleIndex = currentIndex; if (currentIndex > 0) { currentCode = exampleCodes[currentIndex].code; } }
                    }

                    CButton {
                        text: "New Script"; variant: "ghost"
                        onClicked: { currentCode = "-- new_script.lua\n-- Enter your Lua code here\n\nlocal function main()\n    -- TODO: implement\n    return nil\nend\n\nreturn main"; currentName = "new_script"; currentDescription = "New untitled script"; currentReturnType = "nil"; currentParams = []; testOutput = ""; securityScanResult = ""; }
                    }
                    CButton {
                        text: "Run"; variant: "primary"
                        onClicked: { var ts = new Date().toLocaleTimeString(); testOutput = "[" + ts + "] Executing " + currentName + ".lua...\n[" + ts + "] Script loaded successfully (0.003s)\n[" + ts + "] Return value: true\n[" + ts + "] Execution completed in 0.012s\n[" + ts + "] Memory: 24.3 KB allocated, 0 collections"; }
                    }
                    CButton {
                        text: "Security Scan"; variant: "danger"
                        onClicked: {
                            if (currentName === "hash_password") { securityScanResult = "WARN: Ensure ITERATIONS >= 10000 for PBKDF2\nWARN: Verify salt entropy (minimum 128 bits)\nPASS: No raw SQL detected\nPASS: No os.execute() calls\nPASS: No file system access\n\n1 advisory, 0 critical issues"; }
                            else if (currentName === "check_permissions") { securityScanResult = "PASS: No raw SQL detected\nPASS: No os.execute() calls\nPASS: No file system access\nPASS: No network calls outside event bus\nPASS: Input validation present\n\nNo issues found"; }
                            else { securityScanResult = "PASS: No raw SQL detected\nPASS: No os.execute() calls\nPASS: No file system access\nPASS: No unsafe string concatenation\nPASS: No global variable pollution\n\nNo issues found"; }
                        }
                    }
                }
            }

            // MAIN CONTENT: Editor + Right panel
            RowLayout {
                Layout.fillWidth: true
                Layout.fillHeight: true
                spacing: 0

                LuaCodeEditor {
                    code: currentCode
                    scriptName: currentName
                    onCodeChanged: currentCode = code
                }

                LuaPropertiesPanel {
                    scriptName: currentName
                    scriptDescription: currentDescription
                    returnType: currentReturnType
                    params: currentParams
                    currentCode: luaEditorRoot.currentCode
                    onNameChanged: function(name) { currentName = name }
                    onDescriptionChanged: function(desc) { currentDescription = desc }
                    onReturnTypeChanged: function(rt) { currentReturnType = rt }
                    onParamAdded: { var p = currentParams.slice(); p.push({ name: "param" + (p.length + 1), type: "string", value: "" }); currentParams = p; }
                }
            }

            // BOTTOM: Test panel
            LuaOutputPanel {
                params: currentParams
                testOutput: luaEditorRoot.testOutput
                securityScanResult: luaEditorRoot.securityScanResult
                scriptName: currentName
                onExecuteTest: function(args) {
                    var ts = new Date().toLocaleTimeString();
                    luaEditorRoot.testOutput = "--- Test Execution ---\n[" + ts + "] Loading " + currentName + ".lua\n[" + ts + "] Arguments: { " + args.join(", ") + " }\n[" + ts + "] Compiling... OK (0.001s)\n[" + ts + "] Executing... OK (0.008s)\n[" + ts + "] Return: true\n[" + ts + "] Status: SUCCESS\n[" + ts + "] Memory used: 18.7 KB\n[" + ts + "] CPU time: 0.008s";
                }
                onClearOutput: { luaEditorRoot.testOutput = ""; luaEditorRoot.securityScanResult = ""; }
                onParamValueChanged: function(index, value) {
                    var p = currentParams.slice();
                    p[index] = { name: p[index].name, type: p[index].type, value: value };
                    currentParams = p;
                }
            }
        }
    }
}
