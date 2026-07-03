#pragma once
#include <QObject>
#include <QString>
#include <QNetworkAccessManager>
#include <QNetworkRequest>

class ApiClient : public QObject {
    Q_OBJECT

    Q_PROPERTY(QString host READ host WRITE setHost
        NOTIFY hostChanged)
    Q_PROPERTY(int port READ port WRITE setPort
        NOTIFY portChanged)
    Q_PROPERTY(QString apiKey READ apiKey WRITE setApiKey
        NOTIFY apiKeyChanged)

public:
    explicit ApiClient(QObject *parent = nullptr);

    QString host() const { return host_; }
    void setHost(const QString &v);

    int port() const { return port_; }
    void setPort(int v);

    QString apiKey() const { return apiKey_; }
    void setApiKey(const QString &v);

    Q_INVOKABLE void submitAudioJob(
        const QString &inputUrl,
        const QString &outputUrl,
        const QString &codec = "mp3");

    Q_INVOKABLE void submitVideoJob(
        const QString &inputUrl,
        const QString &outputUrl,
        const QString &codec = "h264");

    Q_INVOKABLE void pollJob(const QString &id);
    Q_INVOKABLE void cancelJob(const QString &id);

signals:
    void jobSubmitted(const QString &id);
    void jobUpdated(
        const QString &id,
        const QString &status,
        int progress);
    void jobError(const QString &msg);
    void hostChanged();
    void portChanged();
    void apiKeyChanged();

private:
    QString baseUrl() const;
    QNetworkRequest makeRequest(
        const QString &path) const;
    void post(
        const QString &path,
        const QByteArray &body);
    void submitJob(
        const QString &type,
        const QString &inputUrl,
        const QString &outputUrl,
        const QString &codec);

    QString host_ = "localhost";
    int port_ = 8090;
    QString apiKey_;
    QNetworkAccessManager *nam_;
};
