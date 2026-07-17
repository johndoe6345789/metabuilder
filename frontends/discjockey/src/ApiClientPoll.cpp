#include "ApiClient.hpp"
#include <QNetworkReply>
#include <QJsonDocument>
#include <QJsonObject>

void ApiClient::pollJob(const QString &id) {
    auto *reply = nam_->get(
        makeRequest("/api/jobs/" + id));
    connect(reply, &QNetworkReply::finished,
        this, [this, reply]() {
            reply->deleteLater();
            if (reply->error() !=
                    QNetworkReply::NoError) {
                emit jobError(
                    reply->errorString());
                return;
            }
            auto o = QJsonDocument::fromJson(
                reply->readAll()).object();
            emit jobUpdated(
                o["id"].toString(),
                o["status"].toString(),
                o["progress"].toObject()
                    ["percent"].toInt());
        });
}

void ApiClient::cancelJob(const QString &id) {
    nam_->deleteResource(
        makeRequest("/api/jobs/" + id));
}
