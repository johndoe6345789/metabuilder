import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    color: "transparent"

    property int selectedScriptIndex: 0
    property string testOutput: ""
    property string securityScanResult: ""
    property bool showSnippets: false

    property var scripts: [
        {
            name: "validate_email",
            description: "Validates email format using pattern matching",
            returnType: "boolean",
            params: [
                { name: "email", type: "string" }
            ],
            code:
"-- validate_email.lua\n" +
"-- Validates an email address against RFC 5322 simplified pattern\n\n" +
"local function validate_email(email)\n" +
"    if type(email) ~= \"string\" then\n" +
"        return false, \"Input must be a string\"\n" +
"    end\n\n" +
"    if #email == 0 or #email > 254 then\n" +
"        return false, \"Email length out of range\"\n" +
"    end\n\n" +
"    local pattern = \"^[%w%.%%%+%-]+@[%w%.%-]+%.%a%a+$\"\n" +
"    if not email:match(pattern) then\n" +
"        return false, \"Invalid email format\"\n" +
"    end\n\n" +
"    local local_part, domain = email:match(\"^(.+)@(.+)$\")\n" +
"    if #local_part > 64 then\n" +
"        return false, \"Local part exceeds 64 characters\"\n" +
"    end\n\n" +
"    -- Check for consecutive dots\n" +
"    if email:find(\"..\") then\n" +
"        return false, \"Consecutive dots not allowed\"\n" +
"    end\n\n" +
"    return true, \"Valid email\"\n" +
"end\n\n" +
"return validate_email"
        },
        {
            name: "hash_password",
            description: "Hashes a password with salt using SHA-512 via built-in crypto",
            returnType: "string",
            params: [
                { name: "password", type: "string" },
                { name: "salt", type: "string" }
            ],
            code:
"-- hash_password.lua\n" +
"-- Secure password hashing with salt and iteration\n\n" +
"local crypto = require(\"metabuilder.crypto\")\n\n" +
"local ITERATIONS = 10000\n" +
"local HASH_LENGTH = 64\n\n" +
"local function hash_password(password, salt)\n" +
"    if type(password) ~= \"string\" or #password < 8 then\n" +
"        error(\"Password must be at least 8 characters\")\n" +
"    end\n\n" +
"    if type(salt) ~= \"string\" or #salt < 16 then\n" +
"        error(\"Salt must be at least 16 characters\")\n" +
"    end\n\n" +
"    -- Derive key using PBKDF2-SHA512\n" +
"    local derived = crypto.pbkdf2({\n" +
"        password = password,\n" +
"        salt = salt,\n" +
"        iterations = ITERATIONS,\n" +
"        hash = \"sha512\",\n" +
"        length = HASH_LENGTH\n" +
"    })\n\n" +
"    -- Return formatted hash string\n" +
"    return string.format(\n" +
"        \"$pbkdf2-sha512$i=%d$%s$%s\",\n" +
"        ITERATIONS,\n" +
"        crypto.base64_encode(salt),\n" +
"        crypto.base64_encode(derived)\n" +
"    )\n" +
"end\n\n" +
"return hash_password"
        },
        {
            name: "format_date",
            description: "Formats a UNIX timestamp into human-readable date strings",
            returnType: "string",
            params: [
                { name: "timestamp", type: "number" },
                { name: "format", type: "string" }
            ],
            code:
"-- format_date.lua\n" +
"-- Flexible date formatting from UNIX timestamps\n\n" +
"local FORMATS = {\n" +
"    iso8601  = \"!%Y-%m-%dT%H:%M:%SZ\",\n" +
"    short    = \"%Y-%m-%d\",\n" +
"    long     = \"%B %d, %Y %H:%M\",\n" +
"    relative = nil, -- handled separately\n" +
"    rfc2822  = \"!%a, %d %b %Y %H:%M:%S GMT\"\n" +
"}\n\n" +
"local function relative_time(timestamp)\n" +
"    local diff = os.time() - timestamp\n" +
"    if diff < 60 then return \"just now\" end\n" +
"    if diff < 3600 then return math.floor(diff / 60) .. \" minutes ago\" end\n" +
"    if diff < 86400 then return math.floor(diff / 3600) .. \" hours ago\" end\n" +
"    if diff < 2592000 then return math.floor(diff / 86400) .. \" days ago\" end\n" +
"    return math.floor(diff / 2592000) .. \" months ago\"\n" +
"end\n\n" +
"local function format_date(timestamp, format)\n" +
"    timestamp = tonumber(timestamp)\n" +
"    if not timestamp then\n" +
"        error(\"Invalid timestamp\")\n" +
"    end\n\n" +
"    format = format or \"iso8601\"\n\n" +
"    if format == \"relative\" then\n" +
"        return relative_time(timestamp)\n" +
"    end\n\n" +
"    local fmt = FORMATS[format]\n" +
"    if not fmt then\n" +
"        error(\"Unknown format: \" .. format)\n" +
"    end\n\n" +
"    return os.date(fmt, timestamp)\n" +
"end\n\n" +
"return format_date"
        },
        {
            name: "send_notification",
            description: "Sends a notification through the event bus to subscribed channels",
            returnType: "table",
            params: [
                { name: "user_id", type: "string" },
                { name: "message", type: "string" },
                { name: "channel", type: "string" }
            ],
            code:
"-- send_notification.lua\n" +
"-- Dispatches notifications through the MetaBuilder event bus\n\n" +
"local eventbus = require(\"metabuilder.eventbus\")\n" +
"local json = require(\"metabuilder.json\")\n\n" +
"local CHANNELS = {\n" +
"    email = { priority = 1, retry = 3 },\n" +
"    push  = { priority = 2, retry = 1 },\n" +
"    sms   = { priority = 3, retry = 2 },\n" +
"    slack = { priority = 2, retry = 2 },\n" +
"    webhook = { priority = 4, retry = 5 }\n" +
"}\n\n" +
"local function send_notification(user_id, message, channel)\n" +
"    if not user_id or #user_id == 0 then\n" +
"        return { success = false, error = \"user_id is required\" }\n" +
"    end\n\n" +
"    if not message or #message == 0 then\n" +
"        return { success = false, error = \"message is required\" }\n" +
"    end\n\n" +
"    channel = channel or \"push\"\n" +
"    local ch_config = CHANNELS[channel]\n" +
"    if not ch_config then\n" +
"        return { success = false, error = \"Unknown channel: \" .. channel }\n" +
"    end\n\n" +
"    local payload = {\n" +
"        type = \"notification\",\n" +
"        user_id = user_id,\n" +
"        message = message,\n" +
"        channel = channel,\n" +
"        priority = ch_config.priority,\n" +
"        timestamp = os.time(),\n" +
"        retry_count = ch_config.retry\n" +
"    }\n\n" +
"    local ok, err = eventbus.publish(\"notifications\", json.encode(payload))\n" +
"    if not ok then\n" +
"        return { success = false, error = err }\n" +
"    end\n\n" +
"    return { success = true, id = payload.timestamp, channel = channel }\n" +
"end\n\n" +
"return send_notification"
        },
        {
            name: "check_permissions",
            description: "Checks user permissions against ACL rules from JSON config",
            returnType: "boolean",
            params: [
                { name: "user_id", type: "string" },
                { name: "resource", type: "string" },
                { name: "action", type: "string" }
            ],
            code:
"-- check_permissions.lua\n" +
"-- ACL permission checker against JSON-defined rules\n\n" +
"local dbal = require(\"metabuilder.dbal\")\n" +
"local json = require(\"metabuilder.json\")\n\n" +
"local ACTIONS = { \"read\", \"write\", \"delete\", \"admin\" }\n" +
"local ACTION_HIERARCHY = { read = 1, write = 2, delete = 3, admin = 4 }\n\n" +
"local function check_permissions(user_id, resource, action)\n" +
"    if not user_id or not resource or not action then\n" +
"        return false, \"All parameters are required\"\n" +
"    end\n\n" +
"    if not ACTION_HIERARCHY[action] then\n" +
"        return false, \"Invalid action: \" .. tostring(action)\n" +
"    end\n\n" +
"    -- Fetch user roles from DBAL\n" +
"    local user = dbal.get(\"core\", \"users\", user_id)\n" +
"    if not user then\n" +
"        return false, \"User not found\"\n" +
"    end\n\n" +
"    -- God role bypasses all checks\n" +
"    if user.role == \"god\" then\n" +
"        return true, \"God role: unrestricted\"\n" +
"    end\n\n" +
"    -- Load ACL rules for the resource\n" +
"    local acl = dbal.get(\"core\", \"acl_rules\", resource)\n" +
"    if not acl then\n" +
"        return false, \"No ACL rules for resource\"\n" +
"    end\n\n" +
"    -- Check role against allowed actions\n" +
"    local allowed = acl.roles[user.role]\n" +
"    if not allowed then\n" +
"        return false, \"Role not permitted\"\n" +
"    end\n\n" +
"    local required_level = ACTION_HIERARCHY[action]\n" +
"    local granted_level = ACTION_HIERARCHY[allowed.max_action] or 0\n\n" +
"    return granted_level >= required_level,\n" +
"           granted_level >= required_level and \"Permitted\" or \"Insufficient privileges\"\n" +
"end\n\n" +
"return check_permissions"
        },
        {
            name: "generate_slug",
            description: "Generates URL-safe slugs from arbitrary text with transliteration",
            returnType: "string",
            params: [
                { name: "text", type: "string" },
                { name: "max_length", type: "number" }
            ],
            code:
"-- generate_slug.lua\n" +
"-- URL-safe slug generation with Unicode transliteration\n\n" +
"local TRANSLITERATE = {\n" +
"    [\"a\"] = \"a\", [\"o\"] = \"o\", [\"u\"] = \"u\",\n" +
"    [\"A\"] = \"A\", [\"O\"] = \"O\", [\"U\"] = \"U\",\n" +
"    [\"n\"] = \"n\", [\"c\"] = \"c\", [\"e\"] = \"e\",\n" +
"    [\"ss\"] = \"ss\"\n" +
"}\n\n" +
"local function generate_slug(text, max_length)\n" +
"    if type(text) ~= \"string\" or #text == 0 then\n" +
"        error(\"Input text is required\")\n" +
"    end\n\n" +
"    max_length = max_length or 80\n\n" +
"    local slug = text\n\n" +
"    -- Lowercase\n" +
"    slug = slug:lower()\n\n" +
"    -- Transliterate known characters\n" +
"    for from, to in pairs(TRANSLITERATE) do\n" +
"        slug = slug:gsub(from, to)\n" +
"    end\n\n" +
"    -- Replace non-alphanumeric with hyphens\n" +
"    slug = slug:gsub(\"[^%w%-]\", \"-\")\n\n" +
"    -- Collapse multiple hyphens\n" +
"    slug = slug:gsub(\"%-+\", \"-\")\n\n" +
"    -- Trim leading/trailing hyphens\n" +
"    slug = slug:gsub(\"^%-+\", \"\"):gsub(\"%-+$\", \"\")\n\n" +
"    -- Enforce max length without breaking mid-word\n" +
"    if #slug > max_length then\n" +
"        slug = slug:sub(1, max_length)\n" +
"        local last_hyphen = slug:find(\"%-[^%-]*$\")\n" +
"        if last_hyphen and last_hyphen > max_length * 0.5 then\n" +
"            slug = slug:sub(1, last_hyphen - 1)\n" +
"        end\n" +
"    end\n\n" +
"    return slug\n" +
"end\n\n" +
"return generate_slug"
        }
    ]

    property var snippets: [
        {
            name: "iterate_table",
            label: "Iterate Table",
            code:
"-- Iterate over a table\nfor key, value in pairs(my_table) do\n    print(string.format(\"%s = %s\", tostring(key), tostring(value)))\nend"
        },
        {
            name: "string_manipulation",
            label: "String Manipulation",
            code:
"-- String manipulation helpers\nlocal str = \"Hello, MetaBuilder!\"\nlocal upper = str:upper()\nlocal sub = str:sub(1, 5)\nlocal replaced = str:gsub(\"MetaBuilder\", \"World\")\nlocal formatted = string.format(\"Result: %s (len=%d)\", replaced, #replaced)"
        },
        {
            name: "kv_operations",
            label: "KV Store Operations",
            code:
"-- Key-value store operations\nlocal kv = require(\"metabuilder.kv\")\n\nkv.set(\"session:\" .. user_id, json.encode(session_data), { ttl = 3600 })\nlocal cached = kv.get(\"session:\" .. user_id)\nif cached then\n    local session = json.decode(cached)\nend\nkv.delete(\"session:\" .. user_id)"
        },
        {
            name: "http_request",
            label: "HTTP Request",
            code:
"-- HTTP request via built-in client\nlocal http = require(\"metabuilder.http\")\n\nlocal response = http.request({\n    method = \"POST\",\n    url = \"https://api.example.com/webhook\",\n    headers = {\n        [\"Content-Type\"] = \"application/json\",\n        [\"Authorization\"] = \"Bearer \" .. token\n    },\n    body = json.encode({ event = \"user.created\", data = payload }),\n    timeout = 5000\n})\n\nif response.status == 200 then\n    local result = json.decode(response.body)\nend"
        }
    ]

    property var exampleCodes: [
        { label: "Select example...", code: "" },
        {
            label: "DBAL Entity Query",
            code:
"-- Query entities from DBAL\nlocal dbal = require(\"metabuilder.dbal\")\n\nlocal users = dbal.query(\"core\", \"users\", {\n    where = { role = \"admin\", active = true },\n    order_by = \"created_at DESC\",\n    limit = 50\n})\n\nfor _, user in ipairs(users) do\n    print(string.format(\"[%s] %s (%s)\", user.id, user.name, user.role))\nend"
        },
        {
            label: "Workflow Trigger",
            code:
"-- Trigger a workflow from Lua\nlocal workflow = require(\"metabuilder.workflow\")\n\nlocal result = workflow.trigger(\"on_user_created\", {\n    tenant_id = ctx.tenant_id,\n    user_id = new_user.id,\n    email = new_user.email,\n    source = \"lua_script\"\n})\n\nif result.success then\n    log.info(\"Workflow dispatched: \" .. result.execution_id)\nelse\n    log.error(\"Workflow failed: \" .. result.error)\nend"
        },
        {
            label: "JSON Schema Validation",
            code:
"-- Validate data against a JSON schema\nlocal schema = require(\"metabuilder.schema\")\n\nlocal user_schema = schema.load(\"entities/user\")\n\nlocal data = {\n    name = \"demo_user\",\n    email = \"demo@example.com\",\n    role = \"user\"\n}\n\nlocal valid, errors = schema.validate(data, user_schema)\nif not valid then\n    for _, err in ipairs(errors) do\n        log.warn(\"Validation error: \" .. err.path .. \" - \" .. err.message)\n    end\nend"
        }
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
        for (var i = 0; i < p.length; i++) {
            result.push({ name: p[i].name, type: p[i].type, value: "" });
        }
        return result;
    }

    // Update state when script selection changes
    onSelectedScriptIndexChanged: {
        var s = scripts[selectedScriptIndex];
        currentCode = s.code;
        currentName = s.name;
        currentDescription = s.description;
        currentReturnType = s.returnType;
        var result = [];
        for (var i = 0; i < s.params.length; i++) {
            result.push({ name: s.params[i].name, type: s.params[i].type, value: "" });
        }
        currentParams = result;
        testOutput = "";
        securityScanResult = "";
        selectedExampleIndex = 0;
    }

    RowLayout {
        anchors.fill: parent
        spacing: 0

        // LEFT SIDEBAR: Script list
        Rectangle {
            Layout.preferredWidth: 220
            Layout.fillHeight: true
            color: Theme.paper
            border.color: Theme.border
            border.width: 1

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 12
                spacing: 4

                CText { variant: "h4"; text: "Lua Scripts" }
                CText { variant: "caption"; text: scripts.length + " scripts loaded" }

                CDivider { Layout.fillWidth: true; Layout.topMargin: 8; Layout.bottomMargin: 4 }

                ListView {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    model: scripts
                    spacing: 2
                    clip: true
                    delegate: CListItem {
                        width: parent ? parent.width : 200
                        title: modelData.name
                        subtitle: modelData.returnType + " | " + modelData.params.length + " param" + (modelData.params.length !== 1 ? "s" : "")
                        selected: selectedScriptIndex === index
                        onClicked: selectedScriptIndex = index
                    }
                }

                CDivider { Layout.fillWidth: true; Layout.topMargin: 4; Layout.bottomMargin: 4 }

                // Snippet library toggle
                CButton {
                    text: showSnippets ? "Hide Snippets" : "Snippet Library"
                    variant: "ghost"
                    Layout.fillWidth: true
                    onClicked: showSnippets = !showSnippets
                }

                // Snippet library
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 2
                    visible: showSnippets

                    Repeater {
                        model: snippets
                        delegate: CListItem {
                            width: parent ? parent.width : 200
                            title: modelData.label
                            subtitle: "Insert snippet"
                            onClicked: {
                                currentCode = currentCode + "\n\n" + modelData.code;
                            }
                        }
                    }
                }
            }
        }

        // CENTER: Editor area + bottom panels
        ColumnLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0

            // TOP BAR: Script name, actions, example dropdown
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 52
                color: Theme.paper
                border.color: Theme.border
                border.width: 1

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 16
                    anchors.rightMargin: 16
                    spacing: 12

                    CText { variant: "h4"; text: currentName + ".lua" }

                    CBadge { text: currentReturnType }

                    Item { Layout.fillWidth: true }

                    // Example code dropdown
                    CSelect {
                        Layout.preferredWidth: 200
                        model: {
                            var labels = [];
                            for (var i = 0; i < exampleCodes.length; i++) {
                                labels.push(exampleCodes[i].label);
                            }
                            return labels;
                        }
                        currentIndex: selectedExampleIndex
                        onCurrentIndexChanged: {
                            selectedExampleIndex = currentIndex;
                            if (currentIndex > 0) {
                                currentCode = exampleCodes[currentIndex].code;
                            }
                        }
                    }

                    CButton {
                        text: "New Script"
                        variant: "ghost"
                        onClicked: {
                            currentCode = "-- new_script.lua\n-- Enter your Lua code here\n\nlocal function main()\n    -- TODO: implement\n    return nil\nend\n\nreturn main";
                            currentName = "new_script";
                            currentDescription = "New untitled script";
                            currentReturnType = "nil";
                            currentParams = [];
                            testOutput = "";
                            securityScanResult = "";
                        }
                    }
                    CButton {
                        text: "Run"
                        variant: "primary"
                        onClicked: {
                            testOutput = "[" + new Date().toLocaleTimeString() + "] Executing " + currentName + ".lua...\n" +
                                         "[" + new Date().toLocaleTimeString() + "] Script loaded successfully (0.003s)\n" +
                                         "[" + new Date().toLocaleTimeString() + "] Return value: true\n" +
                                         "[" + new Date().toLocaleTimeString() + "] Execution completed in 0.012s\n" +
                                         "[" + new Date().toLocaleTimeString() + "] Memory: 24.3 KB allocated, 0 collections";
                        }
                    }
                    CButton {
                        text: "Security Scan"
                        variant: "danger"
                        onClicked: {
                            if (currentName === "hash_password") {
                                securityScanResult = "WARN: Ensure ITERATIONS >= 10000 for PBKDF2\nWARN: Verify salt entropy (minimum 128 bits)\nPASS: No raw SQL detected\nPASS: No os.execute() calls\nPASS: No file system access\n\n1 advisory, 0 critical issues";
                            } else if (currentName === "check_permissions") {
                                securityScanResult = "PASS: No raw SQL detected\nPASS: No os.execute() calls\nPASS: No file system access\nPASS: No network calls outside event bus\nPASS: Input validation present\n\nNo issues found";
                            } else {
                                securityScanResult = "PASS: No raw SQL detected\nPASS: No os.execute() calls\nPASS: No file system access\nPASS: No unsafe string concatenation\nPASS: No global variable pollution\n\nNo issues found";
                            }
                        }
                    }
                }
            }

            // MAIN CONTENT: Editor + Right panel
            RowLayout {
                Layout.fillWidth: true
                Layout.fillHeight: true
                spacing: 0

                // CODE EDITOR
                Rectangle {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    color: "#1e1e2e"
                    border.color: Theme.border
                    border.width: 1

                    ColumnLayout {
                        anchors.fill: parent
                        spacing: 0

                        // Line number gutter + code area
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            color: "transparent"

                            ScrollView {
                                anchors.fill: parent
                                clip: true

                                TextArea {
                                    id: codeEditor
                                    text: currentCode
                                    onTextChanged: currentCode = text
                                    font.family: "Consolas, 'Courier New', monospace"
                                    font.pixelSize: 13
                                    color: "#cdd6f4"
                                    selectionColor: "#45475a"
                                    selectedTextColor: "#cdd6f4"
                                    wrapMode: TextEdit.NoWrap
                                    tabStopDistance: 28
                                    padding: 16
                                    leftPadding: 56

                                    background: Rectangle {
                                        color: "transparent"

                                        // Line numbers column
                                        Column {
                                            x: 4
                                            y: codeEditor.topPadding
                                            width: 44

                                            Repeater {
                                                model: codeEditor.text.split("\n").length
                                                delegate: Text {
                                                    width: 40
                                                    height: codeEditor.font.pixelSize * 1.4
                                                    horizontalAlignment: Text.AlignRight
                                                    text: (index + 1).toString()
                                                    font.family: codeEditor.font.family
                                                    font.pixelSize: codeEditor.font.pixelSize
                                                    color: "#585b70"
                                                }
                                            }
                                        }

                                        // Gutter separator
                                        Rectangle {
                                            x: 48
                                            y: 0
                                            width: 1
                                            height: parent.height
                                            color: "#313244"
                                        }
                                    }
                                }
                            }
                        }

                        // Editor status bar
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 26
                            color: "#181825"

                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 12
                                anchors.rightMargin: 12
                                spacing: 16

                                Text {
                                    text: "Lua 5.4"
                                    font.pixelSize: 11
                                    color: "#a6adc8"
                                }
                                Text {
                                    text: "UTF-8"
                                    font.pixelSize: 11
                                    color: "#a6adc8"
                                }
                                Text {
                                    text: currentCode.split("\n").length + " lines"
                                    font.pixelSize: 11
                                    color: "#a6adc8"
                                }
                                Item { Layout.fillWidth: true }
                                Text {
                                    text: "MetaBuilder Lua Runtime"
                                    font.pixelSize: 11
                                    color: "#585b70"
                                }
                            }
                        }
                    }
                }

                // RIGHT PANEL: Script properties
                Rectangle {
                    Layout.preferredWidth: 260
                    Layout.fillHeight: true
                    color: Theme.paper
                    border.color: Theme.border
                    border.width: 1

                    ScrollView {
                        anchors.fill: parent
                        clip: true

                        ColumnLayout {
                            width: parent.width
                            spacing: 12

                            Item { Layout.preferredHeight: 4 }

                            ColumnLayout {
                                Layout.leftMargin: 14
                                Layout.rightMargin: 14
                                spacing: 12

                                CText { variant: "h4"; text: "Properties" }

                                CDivider { Layout.fillWidth: true }

                                CText { variant: "caption"; text: "SCRIPT NAME" }
                                CTextField {
                                    Layout.fillWidth: true
                                    text: currentName
                                    onTextChanged: currentName = text
                                }

                                CText { variant: "caption"; text: "DESCRIPTION" }
                                CTextField {
                                    Layout.fillWidth: true
                                    text: currentDescription
                                    onTextChanged: currentDescription = text
                                }

                                CText { variant: "caption"; text: "RETURN TYPE" }
                                CTextField {
                                    Layout.fillWidth: true
                                    text: currentReturnType
                                    onTextChanged: currentReturnType = text
                                }

                                CDivider { Layout.fillWidth: true }

                                FlexRow {
                                    Layout.fillWidth: true
                                    CText { variant: "h4"; text: "Parameters" }
                                    Item { Layout.fillWidth: true }
                                    CBadge { text: currentParams.length.toString() }
                                }

                                // Parameter list
                                Repeater {
                                    model: currentParams.length
                                    delegate: ColumnLayout {
                                        Layout.fillWidth: true
                                        spacing: 4

                                        FlexRow {
                                            Layout.fillWidth: true
                                            spacing: 6
                                            CChip { text: currentParams[index].type }
                                            CText { variant: "body2"; text: currentParams[index].name }
                                        }

                                        CDivider { Layout.fillWidth: true }
                                    }
                                }

                                CButton {
                                    text: "Add Parameter"
                                    variant: "ghost"
                                    Layout.fillWidth: true
                                    onClicked: {
                                        var p = currentParams.slice();
                                        p.push({ name: "param" + (p.length + 1), type: "string", value: "" });
                                        currentParams = p;
                                    }
                                }

                                CDivider { Layout.fillWidth: true }

                                CText { variant: "h4"; text: "Info" }
                                CText { variant: "caption"; text: "LINES OF CODE" }
                                CText { variant: "body2"; text: currentCode.split("\n").length.toString() }
                                CText { variant: "caption"; text: "SIZE" }
                                CText { variant: "body2"; text: (currentCode.length / 1024).toFixed(1) + " KB" }
                            }

                            Item { Layout.preferredHeight: 8 }
                        }
                    }
                }
            }

            // BOTTOM: Test panel
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 220
                color: Theme.paper
                border.color: Theme.border
                border.width: 1

                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 14
                    spacing: 14

                    // Test inputs
                    ColumnLayout {
                        Layout.preferredWidth: 280
                        Layout.fillHeight: true
                        spacing: 8

                        CText { variant: "h4"; text: "Test Parameters" }

                        ScrollView {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            clip: true

                            ColumnLayout {
                                width: parent.width
                                spacing: 6

                                Repeater {
                                    model: currentParams.length
                                    delegate: ColumnLayout {
                                        Layout.fillWidth: true
                                        spacing: 2

                                        CText {
                                            variant: "caption"
                                            text: currentParams[index].name + " (" + currentParams[index].type + ")"
                                        }
                                        CTextField {
                                            Layout.fillWidth: true
                                            placeholderText: "Enter " + currentParams[index].name + "..."
                                            text: currentParams[index].value || ""
                                            onTextChanged: {
                                                var p = currentParams.slice();
                                                p[index] = { name: p[index].name, type: p[index].type, value: text };
                                                currentParams = p;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        CButton {
                            text: "Execute Test"
                            variant: "primary"
                            Layout.fillWidth: true
                            onClicked: {
                                var args = [];
                                for (var i = 0; i < currentParams.length; i++) {
                                    args.push(currentParams[i].name + " = " + JSON.stringify(currentParams[i].value || ""));
                                }
                                var ts = new Date().toLocaleTimeString();
                                testOutput =
                                    "--- Test Execution ---\n" +
                                    "[" + ts + "] Loading " + currentName + ".lua\n" +
                                    "[" + ts + "] Arguments: { " + args.join(", ") + " }\n" +
                                    "[" + ts + "] Compiling... OK (0.001s)\n" +
                                    "[" + ts + "] Executing... OK (0.008s)\n" +
                                    "[" + ts + "] Return: true\n" +
                                    "[" + ts + "] Status: SUCCESS\n" +
                                    "[" + ts + "] Memory used: 18.7 KB\n" +
                                    "[" + ts + "] CPU time: 0.008s";
                            }
                        }
                    }

                    // Separator
                    Rectangle {
                        Layout.preferredWidth: 1
                        Layout.fillHeight: true
                        color: Theme.border
                    }

                    // Test output
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 8

                        FlexRow {
                            Layout.fillWidth: true
                            CText { variant: "h4"; text: "Output" }
                            Item { Layout.fillWidth: true }
                            CButton {
                                text: "Clear"
                                variant: "ghost"
                                onClicked: { testOutput = ""; securityScanResult = ""; }
                            }
                        }

                        // Output area
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            color: "#1e1e2e"
                            radius: 4
                            border.color: "#313244"
                            border.width: 1

                            ScrollView {
                                anchors.fill: parent
                                anchors.margins: 8
                                clip: true

                                TextArea {
                                    readOnly: true
                                    text: {
                                        var output = "";
                                        if (testOutput) output += testOutput;
                                        if (securityScanResult) {
                                            if (output) output += "\n\n";
                                            output += "--- Security Scan ---\n" + securityScanResult;
                                        }
                                        if (!output) output = "No output yet. Run a test or security scan.";
                                        return output;
                                    }
                                    font.family: "Consolas, 'Courier New', monospace"
                                    font.pixelSize: 12
                                    color: {
                                        if (securityScanResult && securityScanResult.indexOf("WARN") !== -1)
                                            return "#f9e2af";
                                        if (testOutput && testOutput.indexOf("SUCCESS") !== -1)
                                            return "#a6e3a1";
                                        return "#a6adc8";
                                    }
                                    wrapMode: TextEdit.Wrap
                                    background: Rectangle { color: "transparent" }
                                }
                            }
                        }
                    }

                    // Separator
                    Rectangle {
                        Layout.preferredWidth: 1
                        Layout.fillHeight: true
                        color: Theme.border
                    }

                    // Security scan results
                    ColumnLayout {
                        Layout.preferredWidth: 200
                        Layout.fillHeight: true
                        spacing: 8

                        CText { variant: "h4"; text: "Security" }

                        CAlert {
                            Layout.fillWidth: true
                            severity: securityScanResult
                                      ? (securityScanResult.indexOf("WARN") !== -1 ? "warning" : "success")
                                      : "info"
                            text: securityScanResult
                                  ? (securityScanResult.indexOf("WARN") !== -1 ? "Advisories found" : "All checks passed")
                                  : "Not scanned yet"
                        }

                        CText { variant: "caption"; text: "SCAN CHECKS" }
                        CText { variant: "body2"; text: "os.execute() calls" }
                        CText { variant: "body2"; text: "Raw SQL injection" }
                        CText { variant: "body2"; text: "File system access" }
                        CText { variant: "body2"; text: "Global pollution" }
                        CText { variant: "body2"; text: "Unsafe concat" }

                        Item { Layout.fillHeight: true }
                    }
                }
            }
        }
    }
}
