// CssClassLogic.js — DBAL + mutation logic for CssClassManager

function selectedClass(root) {
    if (root.selectedClassIndex >= 0
        && root.selectedClassIndex
            < root.cssClasses.length)
        return root.cssClasses[root.selectedClassIndex]
    return null
}

function updateClasses(root, dbal, arr) {
    root.cssClasses = arr
    if (root.useLiveData)
        saveCssClass(root, dbal, root.selectedClassIndex)
}

function cloneEntry(root) {
    var cls = root.cssClasses.slice()
    var entry = Object.assign(
        {}, cls[root.selectedClassIndex])
    entry.properties = entry.properties.slice()
    return { cls: cls, entry: entry }
}

function commitEntry(root, dbal, bundle) {
    bundle.cls[root.selectedClassIndex] = bundle.entry
    updateClasses(root, dbal, bundle.cls)
}

function addPropertyToSelected(root, dbal) {
    var b = cloneEntry(root)
    b.entry.properties.push(
        { prop: "property", value: "value" })
    commitEntry(root, dbal, b)
}

function removePropertyFromSelected(root, dbal,
                                    propIndex) {
    var b = cloneEntry(root)
    b.entry.properties.splice(propIndex, 1)
    commitEntry(root, dbal, b)
}

function setPropertyName(root, dbal, propIndex,
                         name) {
    var b = cloneEntry(root)
    b.entry.properties[propIndex] = {
        prop: name,
        value: b.entry.properties[propIndex].value
    }
    commitEntry(root, dbal, b)
}

function setPropertyValue(root, dbal, propIndex,
                          val) {
    var b = cloneEntry(root)
    b.entry.properties[propIndex] = {
        prop: b.entry.properties[propIndex].prop,
        value: val
    }
    commitEntry(root, dbal, b)
}

function setClassName(root, dbal, name) {
    var b = cloneEntry(root)
    b.entry.name = name
    commitEntry(root, dbal, b)
}

function addClass(root, dbal, name) {
    var newClass = {
        name: name, usageCount: 0,
        properties: [{ prop: "color",
                       value: "#ffffff" }]
    }
    if (root.useLiveData)
        dbal.execute("core/css-classes/create",
            { data: newClass },
            function(r, e) {
                if (!e) loadCssClasses(root, dbal)
            })
    var cls = root.cssClasses.slice()
    cls.push(newClass)
    root.cssClasses = cls
    root.selectedClassIndex = cls.length - 1
}

function deleteSelectedClass(root, dbal) {
    if (root.cssClasses.length <= 1) return
    var sel = root.cssClasses[root.selectedClassIndex]
    if (root.useLiveData && sel.id)
        dbal.execute("core/css-classes/delete",
            { id: sel.id },
            function(r, e) {
                if (!e) loadCssClasses(root, dbal)
            })
    var cls = root.cssClasses.slice()
    cls.splice(root.selectedClassIndex, 1)
    root.cssClasses = cls
    if (root.selectedClassIndex >= cls.length)
        root.selectedClassIndex = cls.length - 1
}

function loadCssClasses(root, dbal) {
    dbal.execute("core/css-classes", {},
        function(result, error) {
        if (!error && result && result.items
            && result.items.length > 0) {
            var parsed = []
            for (var i = 0;
                 i < result.items.length; i++) {
                var c = result.items[i]
                parsed.push({
                    id: c.id,
                    name: c.name || "",
                    usageCount: c.usageCount || 0,
                    properties: c.properties || []
                })
            }
            root.cssClasses = parsed
            if (root.selectedClassIndex
                >= root.cssClasses.length)
                root.selectedClassIndex =
                    root.cssClasses.length - 1
        }
    })
}

function saveCssClass(root, dbal, index) {
    if (!root.useLiveData || index < 0
        || index >= root.cssClasses.length)
        return
    var cls = root.cssClasses[index]
    var data = {
        name: cls.name,
        usageCount: cls.usageCount,
        properties: cls.properties
    }
    if (cls.id)
        dbal.execute("core/css-classes/update",
            { id: cls.id, data: data },
            function(r, e) {})
    else
        dbal.execute("core/css-classes/create",
            { data: data },
            function(r, e) {
                if (!e) loadCssClasses(root, dbal)
            })
}
