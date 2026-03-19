// PageRoutesDBAL.js — DBAL logic + default data for PageRoutesManager

function defaultRoutes() {
    return [
        {
            path: "/", title: "Home",
            level: 1, layout: "default",
            enabled: true, permissions: "public"
        },
        {
            path: "/dashboard", title: "Dashboard",
            level: 1, layout: "dashboard",
            enabled: true,
            permissions: "authenticated"
        },
        {
            path: "/admin", title: "Admin Panel",
            level: 3, layout: "sidebar",
            enabled: true,
            permissions: "role:admin"
        },
        {
            path: "/forum", title: "Forum",
            level: 1, layout: "sidebar",
            enabled: true,
            permissions: "authenticated"
        },
        {
            path: "/gallery", title: "Gallery",
            level: 1, layout: "default",
            enabled: true, permissions: "public"
        },
        {
            path: "/profile", title: "Profile",
            level: 1, layout: "sidebar",
            enabled: true,
            permissions: "authenticated"
        },
        {
            path: "/settings", title: "Settings",
            level: 2, layout: "sidebar",
            enabled: true,
            permissions: "authenticated"
        },
        {
            path: "/god-panel", title: "God Panel",
            level: 4, layout: "dashboard",
            enabled: true,
            permissions: "role:god"
        },
        {
            path: "/supergod", title: "Super God",
            level: 5, layout: "blank",
            enabled: false,
            permissions: "role:supergod"
        }
    ]
}

function updateRoute(routes, index, field, value) {
    var updated = routes.slice()
    var route = Object.assign({}, updated[index])
    route[field] = value
    updated[index] = route
    return updated
}

function moveRoute(routes, fromIndex, direction) {
    var toIndex = fromIndex + direction
    if (toIndex < 0 || toIndex >= routes.length)
        return { routes: routes, newIndex: fromIndex }
    var updated = routes.slice()
    var temp = updated[fromIndex]
    updated[fromIndex] = updated[toIndex]
    updated[toIndex] = temp
    return { routes: updated, newIndex: toIndex }
}

function addRouteLocal(routes, path, title, level,
                       layout) {
    var updated = routes.slice()
    updated.push({
        path: path, title: title,
        level: level, layout: layout,
        enabled: true,
        permissions: "authenticated"
    })
    return updated
}

function deleteRouteLocal(routes, index) {
    var updated = routes.slice()
    updated.splice(index, 1)
    return updated
}

function loadRoutes(dbal, callback) {
    dbal.list("ui_page", { take: 100 },
        function(result, error) {
        if (!error && result && result.items
            && result.items.length > 0) {
            var parsed = []
            for (var i = 0;
                 i < result.items.length; i++) {
                var r = result.items[i]
                parsed.push({
                    id: r.id || undefined,
                    path: r.path || r.route || "",
                    title: r.title || r.name || "",
                    level: r.level || 1,
                    layout: r.layout || "default",
                    enabled: r.enabled !== undefined
                        ? r.enabled : true,
                    permissions: r.permissions
                        || "public"
                })
            }
            callback(parsed)
        }
    })
}

function saveRoute(dbal, route, callback) {
    var data = {
        path: route.path,
        title: route.title,
        level: route.level,
        layout: route.layout,
        enabled: route.enabled,
        permissions: route.permissions
    }
    if (route.id)
        dbal.update("ui_page", route.id,
            data, callback)
    else
        dbal.create("ui_page", data, callback)
}

function createRoute(dbal, route, callback) {
    dbal.create("ui_page", route, callback)
}

function removeRoute(dbal, id, callback) {
    dbal.remove("ui_page", id, callback)
}
