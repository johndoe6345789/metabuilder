#include "PackageRegistry.h"

#include <QCoreApplication>
#include <QDir>
#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>
#include <QSet>
#include <QTextStream>

namespace {
QString normalizedPath(const QString &path) {
    QDir dir(path);
    return dir.absolutePath();
}

QString metadataFileName(const QString &packageId) {
    return packageId + "/metadata.json";
}
}

PackageRegistry::PackageRegistry(QObject *parent)
    : QObject(parent)
{
    const auto appDir = QCoreApplication::applicationDirPath();
    m_roots << normalizedPath(appDir + "/packages");
    m_roots << normalizedPath(appDir + "/../packages");
    m_roots << normalizedPath(appDir + "/../frontends/qt6/packages");
    m_roots << normalizedPath(appDir + "/../../frontends/qt6/packages");
}

QStringList PackageRegistry::packageIds() const
{
    QSet<QString> ids;
    for (const auto &root : m_roots) {
        QDir dir(root);
        if (!dir.exists())
            continue;

        const auto entries = dir.entryList(QDir::Dirs | QDir::NoDotAndDotDot);
        for (const auto &entry : entries) {
            const auto meta = dir.filePath(metadataFileName(entry));
            if (QFile::exists(meta))
                ids.insert(entry);
        }
    }
    return ids.values();
}

QString PackageRegistry::loadedPackage() const
{
    return m_loadedPackage;
}

QVariantMap PackageRegistry::loadedMetadata() const
{
    return m_loadedMetadata;
}

QVariantMap PackageRegistry::metadata(const QString &packageId) const
{
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

bool PackageRegistry::loadPackage(const QString &packageId)
{
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

QString PackageRegistry::findMetadataFile(const QString &packageId) const
{
    for (const auto &root : m_roots) {
        const auto candidate = QDir(root).filePath(metadataFileName(packageId));
        if (QFile::exists(candidate))
            return candidate;
    }
    return {};
}
