#pragma once

// Qt6 DBAL Client Bridge
//
// Provides database access for QML components through the DBAL
// daemon. Communicates via HTTP to the C++ DBAL backend.
//
// Usage in QML:
//   DBALClient {
//       id: dbal
//       baseUrl: "http://localhost:3001/api/dbal"
//       tenantId: "default"
//       Component.onCompleted: {
//           dbal.list("User", { take: 10 }, function(users) {
//               console.log("Users:", JSON.stringify(users))
//           })
//       }
//   }

#include "DBALTypes.hpp"
#include "DBALRequest.hpp"

#include <QObject>
#include <QJsonArray>
#include <QVariantMap>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QMap>

class DBALClient : public QObject
{
    Q_OBJECT

    Q_PROPERTY(
        QString baseUrl
        READ baseUrl
        WRITE setBaseUrl
        NOTIFY baseUrlChanged)

    Q_PROPERTY(
        QString tenantId
        READ tenantId
        WRITE setTenantId
        NOTIFY tenantIdChanged)

    Q_PROPERTY(
        QString packageId
        READ packageId
        WRITE setPackageId
        NOTIFY packageIdChanged)

    Q_PROPERTY(
        QString authToken
        READ authToken
        WRITE setAuthToken
        NOTIFY authTokenChanged)

    Q_PROPERTY(
        bool connected
        READ isConnected
        NOTIFY connectedChanged)

    Q_PROPERTY(
        QString lastError
        READ lastError
        NOTIFY errorOccurred)

public:
    explicit DBALClient(QObject *parent = nullptr);
    ~DBALClient() override;

    // Property getters
    QString baseUrl()    const { return m_baseUrl; }
    QString tenantId()   const { return m_tenantId; }
    QString packageId()  const { return m_packageId; }
    QString authToken()  const { return m_authToken; }
    bool    isConnected() const { return m_connected; }
    QString lastError()  const { return m_lastError; }

    // Property setters
    void setBaseUrl(const QString &url);
    void setTenantId(const QString &id);
    void setPackageId(const QString &pkg);
    void setAuthToken(const QString &token);

public slots:
    /// Create a new record. callback: function(result)
    void create(
        const QString     &entity,
        const DBALPayload &data,
        const DBALCallback &callback);

    /// Read a single record by ID. callback: function(result)
    void read(
        const QString     &entity,
        const QString     &id,
        const DBALCallback &callback);

    /// Update an existing record. callback: function(result)
    void update(
        const QString     &entity,
        const QString     &id,
        const DBALPayload &data,
        const DBALCallback &callback);

    /// Delete a record. callback: function(success)
    void remove(
        const QString     &entity,
        const QString     &id,
        const DBALCallback &callback);

    /// List records with pagination/filtering.
    /// options: { take, skip, where, orderBy }
    /// callback: function({ items, total })
    void list(
        const QString     &entity,
        const DBALPayload &options,
        const DBALCallback &callback);

    /// Find first record matching filter. callback: function(result)
    void findFirst(
        const QString     &entity,
        const DBALPayload &filter,
        const DBALCallback &callback);

    /// Execute a named operation. callback: function(result)
    void execute(
        const QString     &operation,
        const DBALPayload &params,
        const DBALCallback &callback);

    /// Check connection to DBAL backend (fire-and-forget).
    void ping();

    /// Get DBAL health info. callback: function(result)
    void health(const DBALCallback &callback);

    /// Get DBAL version info. callback: function(result)
    void version(const DBALCallback &callback);

    /// Get DBAL status/metrics. callback: function(result)
    void status(const DBALCallback &callback);

    /// List entity schemas. callback: function(schemas)
    void listSchemas(const DBALCallback &callback);

    /// Get a specific entity schema. callback: function(schema)
    void getSchema(
        const QString     &entity,
        const DBALCallback &callback);

signals:
    void baseUrlChanged();
    void tenantIdChanged();
    void packageIdChanged();
    void authTokenChanged();
    void connectedChanged();
    void errorOccurred(const QString &error);
    void operationCompleted(
        const QString     &operation,
        const DBALPayload &result);

private slots:
    void handleNetworkReply(QNetworkReply *reply);

private:
    void sendRequest(
        const QString     &method,
        const QString     &endpoint,
        const DBALPayload &body,
        const DBALCallback &callback);

    void setError(const QString &error);

    QString entityPath(const QString &entity) const;
    QString entityPath(
        const QString &entity,
        const QString &id) const;

    QNetworkAccessManager          *m_networkManager;
    QString                         m_baseUrl;
    QString                         m_tenantId;
    QString                         m_packageId;
    QString                         m_authToken;
    bool                            m_connected;
    QString                         m_lastError;
    QMap<QNetworkReply*, DBALCallback> m_pendingCallbacks;
};
