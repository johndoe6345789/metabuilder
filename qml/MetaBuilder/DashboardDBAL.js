.pragma library

// DBAL health-check helper for the dashboard view.
// Keeps the ping + health fetch logic out of the QML file.

function refreshHealth(dbal, callback) {
    dbal.ping(function(success, error) {
        if (success) {
            dbal.execute("health", {}, function(result, err) {
                if (result) callback(result);
            });
        }
    });
}
