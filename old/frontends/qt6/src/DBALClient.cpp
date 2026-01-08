#include "DBALClient.h"
#include <QJsonDocument>
#include <QNetworkRequest>
#include <QUrl>
#include <QUrlQuery>

DBALClient::DBALClient(QObject *parent)
    : QObject(parent)
    , m_networkManager(new QNetworkAccessManager(this))
    , m_baseUrl("http://localhost:3001/api/dbal")
    , m_tenantId("default")
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
        // Convert QJsonObject to QJSValue through QVariant
        if (doc.isObject()) {
            args << callback.engine()->toScriptValue(doc.object().toVariantMap());
        } else if (doc.isArray()) {
            args << callback.engine()->toScriptValue(doc.array().toVariantList());
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

// CRUD Operations

void DBALClient::create(const QString &entity, const QJsonObject &data, const QJSValue &callback)
{
    QJsonObject body;
    body["entity"] = entity;
    body["data"] = data;
    body["tenantId"] = m_tenantId;
    
    sendRequest("POST", "/create", body, callback);
}

void DBALClient::read(const QString &entity, const QString &id, const QJSValue &callback)
{
    QString endpoint = QString("/read/%1/%2").arg(entity, id);
    sendRequest("GET", endpoint, QJsonObject(), callback);
}

void DBALClient::update(const QString &entity, const QString &id, 
                        const QJsonObject &data, const QJSValue &callback)
{
    QJsonObject body;
    body["entity"] = entity;
    body["id"] = id;
    body["data"] = data;
    
    sendRequest("PUT", "/update", body, callback);
}

void DBALClient::remove(const QString &entity, const QString &id, const QJSValue &callback)
{
    QString endpoint = QString("/delete/%1/%2").arg(entity, id);
    sendRequest("DELETE", endpoint, QJsonObject(), callback);
}

void DBALClient::list(const QString &entity, const QJsonObject &options, const QJSValue &callback)
{
    QJsonObject body;
    body["entity"] = entity;
    body["tenantId"] = m_tenantId;
    
    if (options.contains("take")) body["take"] = options["take"];
    if (options.contains("skip")) body["skip"] = options["skip"];
    if (options.contains("where")) body["where"] = options["where"];
    if (options.contains("orderBy")) body["orderBy"] = options["orderBy"];
    
    sendRequest("POST", "/list", body, callback);
}

void DBALClient::findFirst(const QString &entity, const QJsonObject &filter, const QJSValue &callback)
{
    QJsonObject body;
    body["entity"] = entity;
    body["tenantId"] = m_tenantId;
    body["filter"] = filter;
    
    sendRequest("POST", "/findFirst", body, callback);
}

void DBALClient::execute(const QString &operation, const QJsonObject &params, const QJSValue &callback)
{
    QJsonObject body;
    body["operation"] = operation;
    body["params"] = params;
    body["tenantId"] = m_tenantId;
    
    sendRequest("POST", "/execute", body, callback);
}

void DBALClient::ping()
{
    sendRequest("GET", "/ping", QJsonObject(), QJSValue());
}
