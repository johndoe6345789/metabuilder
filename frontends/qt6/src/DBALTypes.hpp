#pragma once

// Forward declarations and type aliases for the Qt6 DBAL layer.
//
// All DBAL public APIs use QJSValue for QML-callable callbacks.
// DBALCallback is the canonical alias used throughout DBALClient
// and DBALRequest to make callback parameters self-documenting.

#include <QJSValue>
#include <QString>
#include <QJsonObject>

/// Alias for a QML-callable callback passed to DBAL operations.
using DBALCallback = QJSValue;

/// Alias for a JSON body payload sent with DBAL requests.
using DBALPayload = QJsonObject;
