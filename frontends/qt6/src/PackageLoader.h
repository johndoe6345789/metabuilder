#ifndef PACKAGELOADER_H
#define PACKAGELOADER_H

#include <QObject>
#include <QJsonObject>
#include <QJsonArray>
#include <QString>
#include <QStringList>
#include <QFileSystemWatcher>
#include <QMap>
#include <QUrl>
#include <QVariantList>

class PackageLoader : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QVariantList packages READ packages NOTIFY packagesChanged)
    Q_PROPERTY(QString packagesDir READ packagesDir WRITE setPackagesDir NOTIFY packagesDirChanged)
    Q_PROPERTY(bool watching READ isWatching WRITE setWatching NOTIFY watchingChanged)
    Q_PROPERTY(int packageCount READ packageCount NOTIFY packagesChanged)

public:
    explicit PackageLoader(QObject *parent = nullptr);
    ~PackageLoader() override;

    QVariantList packages() const;
    QString packagesDir() const { return m_packagesDir; }
    bool isWatching() const { return m_watching; }
    int packageCount() const { return m_packages.count(); }

    void setPackagesDir(const QString &dir);
    void setWatching(bool enabled);

public slots:
    void scan();
    void install(const QString &packageId);
    void uninstall(const QString &packageId);
    bool isInstalled(const QString &packageId) const;
    QVariantMap getPackage(const QString &packageId) const;
    QStringList resolveDependencies(const QString &packageId) const;
    QString qmlPath(const QString &packageId) const;
    QUrl qmlPathUrl(const QString &packageId) const;
    QVariantList navigablePackages() const;

signals:
    void packagesChanged();
    void packagesDirChanged();
    void watchingChanged();
    void packageInstalled(const QString &packageId);
    void packageUninstalled(const QString &packageId);
    void packageUpdated(const QString &packageId);
    void fileChanged(const QString &path);

private slots:
    void onDirectoryChanged(const QString &path);
    void onFileChanged(const QString &path);

private:
    void loadPackage(const QString &dir);
    bool validateMetadata(const QJsonObject &metadata) const;
    QStringList resolveDepChain(const QString &packageId, QStringList &visited) const;
    void loadInstallState();
    void saveInstallState() const;

    QString m_packagesDir;
    bool m_watching;
    QFileSystemWatcher *m_watcher;
    QMap<QString, QJsonObject> m_packages;
    QMap<QString, bool> m_installed;
};

#endif
