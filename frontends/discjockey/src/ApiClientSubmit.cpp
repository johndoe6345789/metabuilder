#include "ApiClient.hpp"
#include <QNetworkReply>
#include <QJsonDocument>
#include <QJsonObject>

void ApiClient::post(
    const QString &path,
    const QByteArray &body)
{
    auto *reply = nam_->post(
        makeRequest(path), body);
    connect(reply, &QNetworkReply::finished,
        this, [this, reply]() {
            reply->deleteLater();
            if (reply->error() !=
                    QNetworkReply::NoError) {
                emit jobError(
                    reply->errorString());
                return;
            }
            auto doc = QJsonDocument::fromJson(
                reply->readAll());
            emit jobSubmitted(
                doc.object()["id"].toString());
        });
}

void ApiClient::submitJob(
    const QString &type,
    const QString &inputUrl,
    const QString &outputUrl,
    const QString &codec)
{
    QJsonObject o;
    o["type"]        = type;
    o["input_path"]  = inputUrl;
    o["output_path"] = outputUrl;
    o["codec"]       = codec;
    post("/api/jobs",
        QJsonDocument(o).toJson());
}

void ApiClient::submitAudioJob(
    const QString &inputUrl,
    const QString &outputUrl,
    const QString &codec)
{
    submitJob(
        "audio_transcode",
        inputUrl, outputUrl, codec);
}

void ApiClient::submitVideoJob(
    const QString &inputUrl,
    const QString &outputUrl,
    const QString &codec)
{
    submitJob(
        "video_transcode",
        inputUrl, outputUrl, codec);
}
