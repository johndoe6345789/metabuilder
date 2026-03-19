#include "PackageLoader.h"

#include <QDir>
#include <QFile>
#include <QJsonDocument>
#include <QJsonArray>
#include <QDebug>
#include <algorithm>

PackageLoader::PackageLoader(QObject *parent)
    : QObject(parent)
    , m_packagesDir(QDir(QStringLiteral(SRCDIR) + QStringLiteral("/packages")).absolutePath())
    , m_watching(false)
    , m_watcher(nullptr)
{
}

PackageLoader::~PackageLoader()
{
    delete m_watcher;
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

QVariantList PackageLoader::packages() const
{
    QVariantList list;
    for (auto it = m_packages.constBegin(); it != m_packages.constEnd(); ++it) {
        QVariantMap entry = it.value().toVariantMap();
        entry[QStringLiteral("installed")] = m_installed.value(it.key(), false);
        list.append(entry);
    }
    return list;
}

void PackageLoader::setPackagesDir(const QString &dir)
{
    if (m_packagesDir == dir)
        return;
    m_packagesDir = dir;
    emit packagesDirChanged();
}

void PackageLoader::setWatching(bool enabled)
{
    if (m_watching == enabled)
        return;

    m_watching = enabled;

    if (m_watching) {
        if (!m_watcher) {
            m_watcher = new QFileSystemWatcher(this);
            connect(m_watcher, &QFileSystemWatcher::directoryChanged,
                    this, &PackageLoader::onDirectoryChanged);
            connect(m_watcher, &QFileSystemWatcher::fileChanged,
                    this, &PackageLoader::onFileChanged);
        }

        // Watch the root packages directory
        if (QDir(m_packagesDir).exists())
            m_watcher->addPath(m_packagesDir);

        // Watch each package subdirectory and its metadata.json
        QDir root(m_packagesDir);
        const auto entries = root.entryList(QDir::Dirs | QDir::NoDotAndDotDot);
        for (const QString &entry : entries) {
            const QString pkgDir = root.absoluteFilePath(entry);
            m_watcher->addPath(pkgDir);

            const QString metaPath = pkgDir + QStringLiteral("/metadata.json");
            if (QFile::exists(metaPath))
                m_watcher->addPath(metaPath);

            const QString qmlViewPath = pkgDir + QStringLiteral("/PackageView.qml");
            if (QFile::exists(qmlViewPath))
                m_watcher->addPath(qmlViewPath);
        }
    } else {
        delete m_watcher;
        m_watcher = nullptr;
    }

    emit watchingChanged();
}

// ---------------------------------------------------------------------------
// Scanning
// ---------------------------------------------------------------------------

void PackageLoader::scan()
{
    m_packages.clear();

    QDir root(m_packagesDir);
    if (!root.exists()) {
        qWarning() << "PackageLoader::scan – packages directory does not exist:" << m_packagesDir;
        emit packagesChanged();
        return;
    }

    const auto entries = root.entryList(QDir::Dirs | QDir::NoDotAndDotDot);
    for (const QString &entry : entries) {
        loadPackage(root.absoluteFilePath(entry));
    }

    loadInstallState();
    emit packagesChanged();
}

void PackageLoader::loadPackage(const QString &dir)
{
    const QString metaPath = dir + QStringLiteral("/metadata.json");
    QFile file(metaPath);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        // Not every subdirectory is necessarily a package – skip silently
        return;
    }

    QJsonParseError parseErr;
    const QJsonDocument doc = QJsonDocument::fromJson(file.readAll(), &parseErr);
    file.close();

    if (parseErr.error != QJsonParseError::NoError) {
        qWarning() << "PackageLoader: JSON parse error in" << metaPath << parseErr.errorString();
        return;
    }

    const QJsonObject meta = doc.object();
    if (!validateMetadata(meta)) {
        qWarning() << "PackageLoader: invalid metadata in" << metaPath;
        return;
    }

    const QString id = meta.contains(QStringLiteral("id"))
        ? meta.value(QStringLiteral("id")).toString()
        : meta.value(QStringLiteral("packageId")).toString();

    // Inject the absolute directory path so QML can locate assets
    QJsonObject enriched = meta;
    enriched[QStringLiteral("_dir")] = dir;

    m_packages.insert(id, enriched);
}

bool PackageLoader::validateMetadata(const QJsonObject &metadata) const
{
    return (metadata.contains(QStringLiteral("id")) || metadata.contains(QStringLiteral("packageId")))
        && metadata.contains(QStringLiteral("name"))
        && metadata.contains(QStringLiteral("version"));
}

// ---------------------------------------------------------------------------
// Install / uninstall
// ---------------------------------------------------------------------------

void PackageLoader::install(const QString &packageId)
{
    if (!m_packages.contains(packageId)) {
        qWarning() << "PackageLoader::install – unknown package:" << packageId;
        return;
    }
    m_installed[packageId] = true;
    saveInstallState();
    emit packageInstalled(packageId);
    emit packagesChanged();
}

void PackageLoader::uninstall(const QString &packageId)
{
    if (!m_installed.contains(packageId))
        return;
    m_installed.remove(packageId);
    saveInstallState();
    emit packageUninstalled(packageId);
    emit packagesChanged();
}

bool PackageLoader::isInstalled(const QString &packageId) const
{
    return m_installed.value(packageId, false);
}

QVariantMap PackageLoader::getPackage(const QString &packageId) const
{
    if (!m_packages.contains(packageId))
        return {};
    return m_packages.value(packageId).toVariantMap();
}

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

QStringList PackageLoader::resolveDependencies(const QString &packageId) const
{
    QStringList visited;
    return resolveDepChain(packageId, visited);
}

QStringList PackageLoader::resolveDepChain(const QString &packageId, QStringList &visited) const
{
    if (visited.contains(packageId))
        return {};

    visited.append(packageId);

    if (!m_packages.contains(packageId))
        return {};

    QStringList result;
    const QJsonObject &meta = m_packages.value(packageId);
    const QJsonArray deps = meta.value(QStringLiteral("dependencies")).toArray();
    for (const QJsonValue &dep : deps) {
        const QString depId = dep.toString();
        if (depId.isEmpty())
            continue;
        result.append(resolveDepChain(depId, visited));
        result.append(depId);
    }
    return result;
}

// ---------------------------------------------------------------------------
// QML path helper
// ---------------------------------------------------------------------------

QString PackageLoader::qmlPath(const QString &packageId) const
{
    if (!m_packages.contains(packageId))
        return {};
    const QString dir = m_packages.value(packageId).value(QStringLiteral("_dir")).toString();
    return dir + QStringLiteral("/PackageView.qml");
}

QUrl PackageLoader::qmlPathUrl(const QString &packageId) const
{
    if (!m_packages.contains(packageId))
        return {};

    // Try disk path first (dev mode)
    const QString diskPath = qmlPath(packageId);
    if (QFile::exists(diskPath))
        return QUrl::fromLocalFile(diskPath);

    // Fall back to QRC for bundled builds
    const QString qrcPath = QStringLiteral("qrc:/packages/") + packageId + QStringLiteral("/PackageView.qml");
    return QUrl(qrcPath);
}

QVariantList PackageLoader::navigablePackages() const
{
    QVariantList result;
    for (auto it = m_packages.constBegin(); it != m_packages.constEnd(); ++it) {
        const QJsonObject &meta = it.value();
        if (meta.value(QStringLiteral("showInNav")).toBool(false)) {
            QVariantMap entry = meta.toVariantMap();
            entry[QStringLiteral("installed")] = m_installed.value(it.key(), false);
            result.append(entry);
        }
    }

    // Sort by level (ascending) then by name (alphabetical)
    std::sort(result.begin(), result.end(), [](const QVariant &a, const QVariant &b) {
        const QVariantMap ma = a.toMap();
        const QVariantMap mb = b.toMap();
        const int levelA = ma.value(QStringLiteral("level"), 2).toInt();
        const int levelB = mb.value(QStringLiteral("level"), 2).toInt();
        if (levelA != levelB)
            return levelA < levelB;
        return ma.value(QStringLiteral("name")).toString() < mb.value(QStringLiteral("name")).toString();
    });

    return result;
}

// ---------------------------------------------------------------------------
// Persistent install state
// ---------------------------------------------------------------------------

void PackageLoader::loadInstallState()
{
    const QString path = m_packagesDir + QStringLiteral("/installed.json");
    QFile file(path);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
        return;

    QJsonParseError parseErr;
    const QJsonDocument doc = QJsonDocument::fromJson(file.readAll(), &parseErr);
    file.close();

    if (parseErr.error != QJsonParseError::NoError) {
        qWarning() << "PackageLoader: failed to parse installed.json:" << parseErr.errorString();
        return;
    }

    m_installed.clear();
    const QJsonObject obj = doc.object();
    for (auto it = obj.constBegin(); it != obj.constEnd(); ++it) {
        if (it.value().toBool())
            m_installed[it.key()] = true;
    }
}

void PackageLoader::saveInstallState() const
{
    const QString path = m_packagesDir + QStringLiteral("/installed.json");
    QFile file(path);
    if (!file.open(QIODevice::WriteOnly | QIODevice::Text)) {
        qWarning() << "PackageLoader: failed to write installed.json:" << path;
        return;
    }

    QJsonObject obj;
    for (auto it = m_installed.constBegin(); it != m_installed.constEnd(); ++it) {
        if (it.value())
            obj[it.key()] = true;
    }

    file.write(QJsonDocument(obj).toJson(QJsonDocument::Indented));
    file.close();
}

// ---------------------------------------------------------------------------
// File system watcher slots
// ---------------------------------------------------------------------------

void PackageLoader::onDirectoryChanged(const QString &path)
{
    emit fileChanged(path);

    if (path == m_packagesDir) {
        // A package may have been added or removed – full rescan
        scan();
        return;
    }

    // A specific package directory changed – reload that package
    const QDir changedDir(path);
    const QString metaPath = changedDir.absoluteFilePath(QStringLiteral("metadata.json"));
    if (QFile::exists(metaPath)) {
        loadPackage(path);
        // Determine packageId from the reloaded data
        const QDir d(path);
        for (auto it = m_packages.constBegin(); it != m_packages.constEnd(); ++it) {
            if (it.value().value(QStringLiteral("_dir")).toString() == path) {
                emit packageUpdated(it.key());
                break;
            }
        }
        emit packagesChanged();
    }
}

void PackageLoader::onFileChanged(const QString &path)
{
    emit fileChanged(path);

    QFileInfo fi(path);
    const QString pkgDir = fi.absolutePath();
    const bool isQmlFile = path.endsWith(QStringLiteral(".qml"));

    if (!isQmlFile) {
        // Re-read the metadata.json that was modified
        loadPackage(pkgDir);
    }

    // Emit packageUpdated for both metadata and QML file changes
    for (auto it = m_packages.constBegin(); it != m_packages.constEnd(); ++it) {
        if (it.value().value(QStringLiteral("_dir")).toString() == pkgDir) {
            emit packageUpdated(it.key());
            break;
        }
    }

    if (!isQmlFile)
        emit packagesChanged();

    // QFileSystemWatcher may drop the watch after a file change – re-add
    if (m_watcher && QFile::exists(path) && !m_watcher->files().contains(path))
        m_watcher->addPath(path);
}
