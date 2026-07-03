#include "AlbumArt.hpp"
#include <QMutexLocker>

QImage AlbumArtStore::s_img;
QMutex AlbumArtStore::s_lock;

void AlbumArtStore::set(const QImage &img) {
    QMutexLocker lk(&s_lock);
    s_img = img;
}

QImage AlbumArtStore::get() {
    QMutexLocker lk(&s_lock);
    return s_img;
}

AlbumArtProvider::AlbumArtProvider()
    : QQuickImageProvider(QQuickImageProvider::Image) {}

QImage AlbumArtProvider::requestImage(const QString &,
    QSize *sz, const QSize &req)
{
    auto img = AlbumArtStore::get();
    if (sz) *sz = img.size();
    if (!req.isEmpty() && !img.isNull())
        return img.scaled(req, Qt::KeepAspectRatio,
                          Qt::SmoothTransformation);
    return img;
}

AlbumArtHelper::AlbumArtHelper(QObject *parent) : QObject(parent) {}

void AlbumArtHelper::update(const QVariant &v) {
    AlbumArtStore::set(v.value<QImage>());
    emit changed();
}
