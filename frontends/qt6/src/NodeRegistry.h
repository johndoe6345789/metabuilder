#ifndef NODEREGISTRY_H
#define NODEREGISTRY_H

#include <QObject>
#include <QJsonObject>
#include <QJsonArray>
#include <QString>
#include <QStringList>
#include <QMap>
#include <QVariantList>

class NodeRegistry : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QVariantList nodeTypes READ nodeTypes NOTIFY nodeTypesChanged)
    Q_PROPERTY(QStringList groups READ groups NOTIFY nodeTypesChanged)
    Q_PROPERTY(int nodeCount READ nodeCount NOTIFY nodeTypesChanged)
    Q_PROPERTY(bool loaded READ isLoaded NOTIFY loadedChanged)
    Q_PROPERTY(QString lastError READ lastError NOTIFY errorOccurred)

public:
    explicit NodeRegistry(QObject *parent = nullptr);

    QVariantList nodeTypes() const;
    QStringList groups() const { return m_groups; }
    int nodeCount() const { return m_nodeTypes.count(); }
    bool isLoaded() const { return m_loaded; }
    QString lastError() const { return m_lastError; }

public slots:
    void loadRegistry(const QString &path);
    QVariantMap nodeType(const QString &name) const;
    QVariantList nodesByGroup(const QString &group) const;
    QVariantList searchNodes(const QString &query) const;

signals:
    void nodeTypesChanged();
    void loadedChanged();
    void errorOccurred(const QString &error);

private:
    void parseRegistry(const QJsonObject &root);

    QMap<QString, QJsonObject> m_nodeTypes;
    QStringList m_groups;
    bool m_loaded = false;
    QString m_lastError;
};

#endif
