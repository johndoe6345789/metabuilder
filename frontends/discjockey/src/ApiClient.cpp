#include "ApiClient.hpp"
#include <QNetworkRequest>
#include <QUrl>

ApiClient::ApiClient(QObject *parent)
    : QObject(parent)
    , nam_(new QNetworkAccessManager(this))
{}

void ApiClient::setHost(const QString &v) {
    if (host_ == v) return;
    host_ = v; emit hostChanged();
}
void ApiClient::setPort(int v) {
    if (port_ == v) return;
    port_ = v; emit portChanged();
}
void ApiClient::setApiKey(const QString &v) {
    if (apiKey_ == v) return;
    apiKey_ = v; emit apiKeyChanged();
}

QString ApiClient::baseUrl() const {
    return QStringLiteral("http://%1:%2")
        .arg(host_).arg(port_);
}

QNetworkRequest ApiClient::makeRequest(
    const QString &path) const
{
    QNetworkRequest req(
        QUrl(baseUrl() + path));
    req.setHeader(
        QNetworkRequest::ContentTypeHeader,
        "application/json");
    if (!apiKey_.isEmpty())
        req.setRawHeader(
            "X-API-Key", apiKey_.toUtf8());
    return req;
}
