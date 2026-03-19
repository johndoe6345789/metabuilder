.pragma library

function loadJson(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE &&
            (xhr.status === 200 || xhr.status === 0))
            callback(JSON.parse(xhr.responseText));
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function replaceAt(arr, index, item) {
    var copy = arr.slice();
    copy[index] = item;
    return copy;
}

function updateField(dropdowns, index, field, value) {
    if (index < 0) return dropdowns;
    var dd = deepCopy(dropdowns[index]);
    dd[field] = value;
    return replaceAt(dropdowns, index, dd);
}

function addOption(dropdowns, index) {
    if (index < 0) return dropdowns;
    var dd = deepCopy(dropdowns[index]);
    dd.options.push({ label: "New Option",
        value: "new_option_" + dd.options.length });
    return replaceAt(dropdowns, index, dd);
}

function removeOption(dropdowns, index, optIndex) {
    if (index < 0) return dropdowns;
    var dd = deepCopy(dropdowns[index]);
    dd.options.splice(optIndex, 1);
    return replaceAt(dropdowns, index, dd);
}

function moveOption(dropdowns, index, optIndex, direction) {
    if (index < 0) return dropdowns;
    var dd = deepCopy(dropdowns[index]);
    var t = optIndex + direction;
    if (t < 0 || t >= dd.options.length) return dropdowns;
    var tmp = dd.options[optIndex];
    dd.options[optIndex] = dd.options[t];
    dd.options[t] = tmp;
    return replaceAt(dropdowns, index, dd);
}

function updateOptionField(dropdowns, index, optIndex, field, value) {
    if (index < 0) return dropdowns;
    var dd = deepCopy(dropdowns[index]);
    dd.options[optIndex][field] = value;
    return replaceAt(dropdowns, index, dd);
}

function createDropdown(name, description) {
    return {
        name: name.trim().toLowerCase().replace(/ /g, "_"),
        description: description.trim() || "No description",
        allowCustom: false,
        required: false,
        options: [{ label: "Option 1", value: "option_1" }]
    };
}

function addDropdown(dropdowns, newDd) {
    var copy = dropdowns.slice();
    copy.push(newDd);
    return copy;
}

function removeDropdown(dropdowns, index) {
    var copy = dropdowns.slice();
    copy.splice(index, 1);
    return copy;
}

function parseDbalItems(items) {
    var parsed = [];
    for (var i = 0; i < items.length; i++) {
        var d = items[i];
        parsed.push({
            id: d.id, name: d.name || "", description: d.description || "",
            allowCustom: d.allowCustom || false, required: d.required || false,
            options: d.options || []
        });
    }
    return parsed;
}

function toSaveData(dd) {
    return { name: dd.name, description: dd.description, allowCustom:
        dd.allowCustom, required: dd.required, options: dd.options };
}
