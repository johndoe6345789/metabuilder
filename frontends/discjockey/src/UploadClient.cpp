#include "UploadClient.hpp"
#include <QFile>
#include <QFileInfo>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QMimeDatabase>
#include <QUrl>

UploadClient::UploadClient(QObject *parent)
    : QObject(parent)
    , nam_(new QNetworkAccessManager(this))
{}

void UploadClient::setHost(const QString &v) {
    if (host_ == v) return;
    host_ = v; emit hostChanged();
}
void UploadClient::setPort(int v) {
    if (port_ == v) return;
    port_ = v; emit portChanged();
}
void UploadClient::setBucket(const QString &v) {
    if (bucket_ == v) return;
    bucket_ = v; emit bucketChanged();
}

QString UploadClient::uploadUrl(
    const QString &filename) const
{
    return QStringLiteral("http://%1:%2/%3/%4")
        .arg(host_).arg(port_).arg(bucket_)
        .arg(filename);
}

void UploadClient::upload(const QString &localPath) {
    auto *file = new QFile(localPath, this);
    if (!file->open(QIODevice::ReadOnly)) {
        emit uploadError(localPath,
            file->errorString());
        file->deleteLater();
        return;
    }

    const QString name =
        QFileInfo(localPath).fileName();
    const QUrl url(uploadUrl(name));

    QMimeDatabase db;
    const QString mime =
        db.mimeTypeForFile(localPath).name();

    QNetworkRequest req(url);
    req.setHeader(
        QNetworkRequest::ContentTypeHeader, mime);
    req.setHeader(
        QNetworkRequest::ContentLengthHeader,
        file->size());

    auto *reply = nam_->put(req, file);
    file->setParent(reply);

    connect(reply,
        &QNetworkReply::uploadProgress, this,
        [this, localPath](
            qint64 sent, qint64 total) {
            if (total <= 0) return;
            emit uploadProgress(
                localPath,
                static_cast<int>(sent * 100 / total));
        });

    connect(reply, &QNetworkReply::finished, this,
        [this, reply, localPath, name]() {
            reply->deleteLater();
            if (reply->error() != QNetworkReply::NoError) {
                emit uploadError(
                    localPath, reply->errorString());
                return;
            }
            emit uploadDone(localPath, uploadUrl(name));
        });
}
