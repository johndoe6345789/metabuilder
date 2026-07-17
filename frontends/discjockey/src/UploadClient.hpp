#pragma once
#include <QObject>
#include <QString>
#include <QNetworkAccessManager>

class UploadClient : public QObject {
    Q_OBJECT

    Q_PROPERTY(QString host READ host WRITE setHost
        NOTIFY hostChanged)
    Q_PROPERTY(int port READ port WRITE setPort
        NOTIFY portChanged)
    Q_PROPERTY(QString bucket READ bucket WRITE setBucket
        NOTIFY bucketChanged)

public:
    explicit UploadClient(QObject *parent = nullptr);

    QString host() const { return host_; }
    void setHost(const QString &v);

    int port() const { return port_; }
    void setPort(int v);

    QString bucket() const { return bucket_; }
    void setBucket(const QString &v);

    Q_INVOKABLE void upload(const QString &localPath);
    Q_INVOKABLE QString uploadUrl(
        const QString &filename) const;

signals:
    void uploadProgress(
        const QString &localPath, int percent);
    void uploadDone(
        const QString &localPath, const QString &url);
    void uploadError(
        const QString &localPath, const QString &msg);
    void hostChanged();
    void portChanged();
    void bucketChanged();

private:
    QString host_ = "localhost";
    int port_ = 9000;
    QString bucket_ = "media-uploads";
    QNetworkAccessManager *nam_;
};
