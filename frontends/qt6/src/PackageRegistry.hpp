#pragma once

#include <QCoreApplication>
#include <QDir>
#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>
#include <QObject>
#include <QSet>
#include <QTextStream>
#include <QVariantMap>

namespace {
inline QString normalizedPath(const QString &path) {
    QDir dir(path);
    return dir.absolutePath();
}

inline QString metadataFileName(const QString &packageId) {
    return packageId + "/metadata.json";
}
} // namespace

class PackageRegistry : public QObject {
    Q_OBJECT
    Q_PROPERTY(
        QStringList packageIds
        READ packageIds
        NOTIFY packagesChanged
    )
    Q_PROPERTY(
        QString loadedPackage
        READ loadedPackage
        NOTIFY packageLoaded
    )
    Q_PROPERTY(
        QVariantMap loadedMetadata
        READ loadedMetadata
        NOTIFY metadataChanged
    )

public:
    explicit PackageRegistry(QObject *parent = nullptr)
        : QObject(parent)
    {
        const auto appDir = QCoreApplication::applicationDirPath();
        m_roots << normalizedPath(appDir + "/packages");
        m_roots << normalizedPath(appDir + "/../packages");
        m_roots << normalizedPath(
            appDir + "/../frontends/qt6/packages"
        );
        m_roots << normalizedPath(
            appDir + "/../../frontends/qt6/packages"
        );
    }

    QStringList packageIds() const {
        QSet<QString> ids;
        for (const auto &root : m_roots) {
            QDir dir(root);
            if (!dir.exists())
                continue;
            const auto entries =
                dir.entryList(QDir::Dirs | QDir::NoDotAndDotDot);
            for (const auto &entry : entries) {
                const auto meta =
                    dir.filePath(metadataFileName(entry));
                if (QFile::exists(meta))
                    ids.insert(entry);
            }
        }
        return ids.values();
    }

    QString loadedPackage() const {
        return m_loadedPackage;
    }

    QVariantMap loadedMetadata() const {
        return m_loadedMetadata;
    }

    Q_INVOKABLE bool loadPackage(const QString &packageId) {
        const auto filePath = findMetadataFile(packageId);
        if (filePath.isEmpty())
            return false;
        QFile file(filePath);
        if (!file.open(QIODevice::ReadOnly))
            return false;
        const auto doc = QJsonDocument::fromJson(file.readAll());
        if (!doc.isObject())
            return false;
        m_loadedPackage = packageId;
        m_loadedMetadata = doc.object().toVariantMap();
        emit packageLoaded();
        emit metadataChanged();
        return true;
    }

    Q_INVOKABLE QVariantMap metadata(const QString &packageId) const {
        const auto filePath = findMetadataFile(packageId);
        if (filePath.isEmpty())
            return {};
        QFile file(filePath);
        if (!file.open(QIODevice::ReadOnly))
            return {};
        const auto doc = QJsonDocument::fromJson(file.readAll());
        if (!doc.isObject())
            return {};
        return doc.object().toVariantMap();
    }

signals:
    void packagesChanged();
    void packageLoaded();
    void metadataChanged();

private:
    QStringList m_roots;
    QString m_loadedPackage;
    QVariantMap m_loadedMetadata;

    QString findMetadataFile(const QString &packageId) const {
        for (const auto &root : m_roots) {
            const auto candidate =
                QDir(root).filePath(metadataFileName(packageId));
            if (QFile::exists(candidate))
                return candidate;
        }
        return {};
    }
};
