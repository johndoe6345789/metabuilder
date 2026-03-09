#pragma once

#include <QObject>
#include <QVariantMap>

class PackageRegistry : public QObject {
    Q_OBJECT
    Q_PROPERTY(QStringList packageIds READ packageIds NOTIFY packagesChanged)
    Q_PROPERTY(QString loadedPackage READ loadedPackage NOTIFY packageLoaded)
    Q_PROPERTY(QVariantMap loadedMetadata READ loadedMetadata NOTIFY metadataChanged)

public:
    explicit PackageRegistry(QObject *parent = nullptr);

    QStringList packageIds() const;
    QString loadedPackage() const;
    QVariantMap loadedMetadata() const;

    Q_INVOKABLE bool loadPackage(const QString &packageId);
    Q_INVOKABLE QVariantMap metadata(const QString &packageId) const;

signals:
    void packagesChanged();
    void packageLoaded();
    void metadataChanged();

private:
    QString findMetadataFile(const QString &packageId) const;
    QStringList m_roots;
    QString m_loadedPackage;
    QVariantMap m_loadedMetadata;
};
