#ifndef DBALCLIENT_H
#define DBALCLIENT_H

#include <QObject>
#include <QJsonObject>
#include <QJsonArray>
#include <QString>
#include <QVariantMap>
#include <QNetworkAccessManager>
#include <QNetworkReply>

/**
 * @brief Qt6 DBAL Client Bridge
 * 
 * Provides database access for QML components through the DBAL daemon.
 * Communicates via HTTP/WebSocket to the TypeScript or C++ DBAL backend.
 * 
 * Usage in QML:
 * @code
 * DBALClient {
 *     id: dbal
 *     baseUrl: "http://localhost:3001/api/dbal"
 *     tenantId: "default"
 *     
 *     Component.onCompleted: {
 *         dbal.list("User", { take: 10 }, function(users) {
 *             console.log("Users:", JSON.stringify(users))
 *         })
 *     }
 * }
 * @endcode
 */
class DBALClient : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString baseUrl READ baseUrl WRITE setBaseUrl NOTIFY baseUrlChanged)
    Q_PROPERTY(QString tenantId READ tenantId WRITE setTenantId NOTIFY tenantIdChanged)
    Q_PROPERTY(QString authToken READ authToken WRITE setAuthToken NOTIFY authTokenChanged)
    Q_PROPERTY(bool connected READ isConnected NOTIFY connectedChanged)
    Q_PROPERTY(QString lastError READ lastError NOTIFY errorOccurred)

public:
    explicit DBALClient(QObject *parent = nullptr);
    ~DBALClient() override;

    // Property getters
    QString baseUrl() const { return m_baseUrl; }
    QString tenantId() const { return m_tenantId; }
    QString authToken() const { return m_authToken; }
    bool isConnected() const { return m_connected; }
    QString lastError() const { return m_lastError; }

    // Property setters
    void setBaseUrl(const QString &url);
    void setTenantId(const QString &id);
    void setAuthToken(const QString &token);

public slots:
    /**
     * @brief Create a new record
     * @param entity Entity name (e.g., "User", "AuditLog")
     * @param data Record data as JSON object
     * @param callback QML callback function(result)
     */
    void create(const QString &entity, const QJsonObject &data, const QJSValue &callback);

    /**
     * @brief Read a single record by ID
     * @param entity Entity name
     * @param id Record ID
     * @param callback QML callback function(result)
     */
    void read(const QString &entity, const QString &id, const QJSValue &callback);

    /**
     * @brief Update an existing record
     * @param entity Entity name
     * @param id Record ID
     * @param data Updated fields
     * @param callback QML callback function(result)
     */
    void update(const QString &entity, const QString &id, const QJsonObject &data, const QJSValue &callback);

    /**
     * @brief Delete a record
     * @param entity Entity name
     * @param id Record ID
     * @param callback QML callback function(success)
     */
    void remove(const QString &entity, const QString &id, const QJSValue &callback);

    /**
     * @brief List records with pagination and filtering
     * @param entity Entity name
     * @param options { take, skip, where, orderBy }
     * @param callback QML callback function({ items, total })
     */
    void list(const QString &entity, const QJsonObject &options, const QJSValue &callback);

    /**
     * @brief Find first record matching filter
     * @param entity Entity name
     * @param filter Filter criteria
     * @param callback QML callback function(result)
     */
    void findFirst(const QString &entity, const QJsonObject &filter, const QJSValue &callback);

    /**
     * @brief Execute a named query/operation
     * @param operation Operation name
     * @param params Operation parameters
     * @param callback QML callback function(result)
     */
    void execute(const QString &operation, const QJsonObject &params, const QJSValue &callback);

    /**
     * @brief Check connection to DBAL backend
     */
    void ping();

signals:
    void baseUrlChanged();
    void tenantIdChanged();
    void authTokenChanged();
    void connectedChanged();
    void errorOccurred(const QString &error);
    void operationCompleted(const QString &operation, const QJsonObject &result);

private slots:
    void handleNetworkReply(QNetworkReply *reply);

private:
    void sendRequest(const QString &method, const QString &endpoint, 
                     const QJsonObject &body, const QJSValue &callback);
    void setError(const QString &error);

    QNetworkAccessManager *m_networkManager;
    QString m_baseUrl;
    QString m_tenantId;
    QString m_authToken;
    bool m_connected;
    QString m_lastError;
    QMap<QNetworkReply*, QJSValue> m_pendingCallbacks;
};

#endif // DBALCLIENT_H
