#pragma once

// DBALRequest encapsulates a single in-flight DBAL HTTP request.
//
// DBALClient stores one DBALRequest per QNetworkReply* in its
// pending-request map.  Using a named struct instead of a bare
// QJSValue map makes the bookkeeping self-documenting and easy
// to extend (e.g. adding timeout tracking or retry counts).

#include "DBALTypes.hpp"
#include <QNetworkReply>
#include <QString>

/// Tracks the state of a single pending DBAL network request.
struct DBALRequest
{
    /// The entity name the request targets (e.g. "User").
    QString entity;

    /// The HTTP verb used for this request ("GET", "POST", …).
    QString method;

    /// QML callback to invoke when the reply arrives.
    DBALCallback callback;

    /// The live network reply (used as the map key in DBALClient).
    QNetworkReply *reply = nullptr;
};
