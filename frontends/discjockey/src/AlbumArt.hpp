#pragma once
#include <QObject>
#include <QImage>
#include <QMutex>
#include <QQuickImageProvider>

class AlbumArtStore {
public:
    static void   set(const QImage &img);
    static QImage get();
private:
    static QImage  s_img;
    static QMutex  s_lock;
};

class AlbumArtProvider : public QQuickImageProvider {
public:
    AlbumArtProvider();
    QImage requestImage(const QString &id, QSize *sz,
                        const QSize &req) override;
};

class AlbumArtHelper : public QObject {
    Q_OBJECT
public:
    explicit AlbumArtHelper(QObject *parent = nullptr);
    Q_INVOKABLE void update(const QVariant &v);
signals:
    void changed();
};
