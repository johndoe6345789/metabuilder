#include "DBALClient.h"
#include <QJsonDocument>
#include <QNetworkRequest>
#include <QUrl>
#include <QUrlQuery>

DBALClient::DBALClient(QObject *parent)
    : QObject(parent)
    , m_networkManager(new QNetworkAccessManager(this))
    , m_baseUrl("http://localhost:8080")
    , m_tenantId("default")
    , m_packageId("core")
    , m_connected(false)
{
    connect(m_networkManager, &QNetworkAccessManager::finished,
            this, &DBALClient::handleNetworkReply);
}

DBALClient::~DBALClient()
{
    // Cleanup pending callbacks
    m_pendingCallbacks.clear();
}

void DBALClient::setBaseUrl(const QString &url)
{
    if (m_baseUrl != url) {
        m_baseUrl = url;
        emit baseUrlChanged();
    }
}

void DBALClient::setTenantId(const QString &id)
{
    if (m_tenantId != id) {
        m_tenantId = id;
        emit tenantIdChanged();
    }
}

void DBALClient::setAuthToken(const QString &token)
{
    if (m_authToken != token) {
        m_authToken = token;
        emit authTokenChanged();
    }
}

void DBALClient::setPackageId(const QString &pkg)
{
    if (m_packageId != pkg) {
        m_packageId = pkg;
        emit packageIdChanged();
    }
}

QString DBALClient::entityPath(const QString &entity) const
{
    // REST: /api/v1/{tenant}/{package}/{entity}
    return QString("/api/v1/%1/%2/%3").arg(m_tenantId, m_packageId, entity.toLower());
}

QString DBALClient::entityPath(const QString &entity, const QString &id) const
{
    return entityPath(entity) + "/" + id;
}

void DBALClient::setError(const QString &error)
{
    m_lastError = error;
    emit errorOccurred(error);
}

void DBALClient::sendRequest(const QString &method, const QString &endpoint,
                             const QJsonObject &body, const QJSValue &callback)
{
    QUrl url(m_baseUrl + endpoint);
    QNetworkRequest request(url);
    
    // Set headers
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader("X-Tenant-ID", m_tenantId.toUtf8());
    
    if (!m_authToken.isEmpty()) {
        request.setRawHeader("Authorization", ("Bearer " + m_authToken).toUtf8());
    }
    
    QNetworkReply *reply = nullptr;
    QByteArray jsonData = QJsonDocument(body).toJson(QJsonDocument::Compact);
    
    if (method == "GET") {
        reply = m_networkManager->get(request);
    } else if (method == "POST") {
        reply = m_networkManager->post(request, jsonData);
    } else if (method == "PUT") {
        reply = m_networkManager->put(request, jsonData);
    } else if (method == "DELETE") {
        reply = m_networkManager->deleteResource(request);
    }
    
    if (reply && callback.isCallable()) {
        m_pendingCallbacks[reply] = callback;
    }
}

void DBALClient::handleNetworkReply(QNetworkReply *reply)
{
    reply->deleteLater();
    
    QJSValue callback = m_pendingCallbacks.take(reply);
    
    if (reply->error() != QNetworkReply::NoError) {
        setError(reply->errorString());
        
        if (callback.isCallable()) {
            QJSValueList args;
            args << QJSValue::NullValue;
            args << reply->errorString();
            callback.call(args);
        }
        return;
    }
    
    QByteArray data = reply->readAll();
    QJsonDocument doc = QJsonDocument::fromJson(data);
    
    if (callback.isCallable()) {
        QJSValueList args;
        // In Qt6, QJSValue::engine() is removed. Pass data as JSON string
        // and let QML parse it, or pass QVariant directly.
        if (doc.isObject()) {
            args << QJSValue(QString::fromUtf8(data));
        } else if (doc.isArray()) {
            args << QJSValue(QString::fromUtf8(data));
        } else {
            args << QJSValue::NullValue;
        }
        callback.call(args);
    }
    
    // Update connected status
    if (!m_connected) {
        m_connected = true;
        emit connectedChanged();
    }
}

// CRUD Operations — DBAL REST API: /api/v1/{tenant}/{package}/{entity}[/{id}]

void DBALClient::create(const QString &entity, const QJsonObject &data, const QJSValue &callback)
{
    sendRequest("POST", entityPath(entity), data, callback);
}

void DBALClient::read(const QString &entity, const QString &id, const QJSValue &callback)
{
    sendRequest("GET", entityPath(entity, id), QJsonObject(), callback);
}

void DBALClient::update(const QString &entity, const QString &id,
                        const QJsonObject &data, const QJSValue &callback)
{
    sendRequest("PUT", entityPath(entity, id), data, callback);
}

void DBALClient::remove(const QString &entity, const QString &id, const QJSValue &callback)
{
    sendRequest("DELETE", entityPath(entity, id), QJsonObject(), callback);
}

void DBALClient::list(const QString &entity, const QJsonObject &options, const QJSValue &callback)
{
    // Build query string from options (take, skip, where, orderBy)
    QString path = entityPath(entity);
    QStringList queryParts;
    if (options.contains("take")) queryParts << "take=" + QString::number(options["take"].toInt());
    if (options.contains("skip")) queryParts << "skip=" + QString::number(options["skip"].toInt());
    if (options.contains("orderBy")) queryParts << "orderBy=" + options["orderBy"].toString();
    if (!queryParts.isEmpty()) path += "?" + queryParts.join("&");

    sendRequest("GET", path, QJsonObject(), callback);
}

void DBALClient::findFirst(const QString &entity, const QJsonObject &filter, const QJSValue &callback)
{
    // GET with query params for simple filters
    QString path = entityPath(entity);
    QStringList queryParts;
    queryParts << "take=1";
    for (auto it = filter.begin(); it != filter.end(); ++it) {
        queryParts << QUrl::toPercentEncoding(it.key()) + "=" + QUrl::toPercentEncoding(it.value().toString());
    }
    if (!queryParts.isEmpty()) path += "?" + queryParts.join("&");

    sendRequest("GET", path, QJsonObject(), callback);
}

void DBALClient::execute(const QString &operation, const QJsonObject &params, const QJSValue &callback)
{
    // Execute maps to POST /{tenant}/{package}/{entity}/{action} or system endpoints
    QString path = QString("/api/v1/%1/%2").arg(m_tenantId, operation);
    sendRequest("POST", path, params, callback);
}

void DBALClient::ping()
{
    sendRequest("GET", "/health", QJsonObject(), QJSValue());
}

void DBALClient::health(const QJSValue &callback)
{
    sendRequest("GET", "/health", QJsonObject(), callback);
}

void DBALClient::version(const QJSValue &callback)
{
    sendRequest("GET", "/version", QJsonObject(), callback);
}

void DBALClient::status(const QJSValue &callback)
{
    sendRequest("GET", "/status", QJsonObject(), callback);
}

void DBALClient::listSchemas(const QJSValue &callback)
{
    sendRequest("GET", "/api/v1/" + m_tenantId + "/schema", QJsonObject(), callback);
}

void DBALClient::getSchema(const QString &entity, const QJSValue &callback)
{
    sendRequest("GET", "/api/v1/" + m_tenantId + "/schema/" + entity.toLower(), QJsonObject(), callback);
}
