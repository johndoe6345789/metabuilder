#pragma once

#include <QObject>
#include <QJsonObject>
#include <QJsonArray>
#include <QString>
#include <QStringList>
#include <QMap>
#include <QVariantList>
#include <QFile>
#include <QJsonDocument>
#include <QDebug>
#include <algorithm>

class NodeRegistry : public QObject
{
    Q_OBJECT
    Q_PROPERTY(
        QVariantList nodeTypes
        READ nodeTypes
        NOTIFY nodeTypesChanged)
    Q_PROPERTY(
        QStringList groups
        READ groups
        NOTIFY nodeTypesChanged)
    Q_PROPERTY(
        int nodeCount
        READ nodeCount
        NOTIFY nodeTypesChanged)
    Q_PROPERTY(
        bool loaded
        READ isLoaded
        NOTIFY loadedChanged)
    Q_PROPERTY(
        QString lastError
        READ lastError
        NOTIFY errorOccurred)

public:
    explicit NodeRegistry(QObject *parent = nullptr)
        : QObject(parent)
    {}

    QVariantList nodeTypes() const
    {
        QVariantList list;
        for (auto it = m_nodeTypes.constBegin();
             it != m_nodeTypes.constEnd(); ++it) {
            list.append(it.value().toVariantMap());
        }
        return list;
    }

    QStringList groups() const { return m_groups; }
    int nodeCount() const { return m_nodeTypes.count(); }
    bool isLoaded() const { return m_loaded; }
    QString lastError() const { return m_lastError; }

public slots:
    void loadRegistry(const QString &path)
    {
        QFile file(path);
        if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
            m_lastError =
                QStringLiteral("Cannot open registry file: ") + path;
            qDebug() << "NodeRegistry:" << m_lastError;
            emit errorOccurred(m_lastError);
            return;
        }

        QJsonParseError parseErr;
        const QJsonDocument doc =
            QJsonDocument::fromJson(file.readAll(), &parseErr);
        file.close();

        if (parseErr.error != QJsonParseError::NoError) {
            m_lastError =
                QStringLiteral("JSON parse error: ")
                + parseErr.errorString();
            qDebug() << "NodeRegistry:" << m_lastError;
            emit errorOccurred(m_lastError);
            return;
        }

        parseRegistry(doc.object());

        m_loaded = true;
        emit loadedChanged();
        emit nodeTypesChanged();
        qDebug() << "NodeRegistry: loaded"
                 << m_nodeTypes.count()
                 << "node types in"
                 << m_groups.count()
                 << "groups from" << path;
    }

    QVariantMap nodeType(const QString &name) const
    {
        if (!m_nodeTypes.contains(name))
            return {};
        return m_nodeTypes.value(name).toVariantMap();
    }

    QVariantList nodesByGroup(const QString &group) const
    {
        QVariantList list;
        for (auto it = m_nodeTypes.constBegin();
             it != m_nodeTypes.constEnd(); ++it) {
            const QString g =
                it.value()
                    .value(QStringLiteral("group"))
                    .toString();
            if (g == group)
                list.append(it.value().toVariantMap());
        }
        return list;
    }

    QVariantList searchNodes(const QString &query) const
    {
        if (query.isEmpty())
            return nodeTypes();

        const QString lower = query.toLower();
        QVariantList list;
        for (auto it = m_nodeTypes.constBegin();
             it != m_nodeTypes.constEnd(); ++it) {
            const QJsonObject &obj = it.value();
            const QString name =
                obj.value(QStringLiteral("name"))
                    .toString().toLower();
            const QString displayName =
                obj.value(QStringLiteral("displayName"))
                    .toString().toLower();
            const QString desc =
                obj.value(QStringLiteral("description"))
                    .toString().toLower();

            if (name.contains(lower)
                    || displayName.contains(lower)
                    || desc.contains(lower))
                list.append(obj.toVariantMap());
        }
        return list;
    }

signals:
    void nodeTypesChanged();
    void loadedChanged();
    void errorOccurred(const QString &error);

private:
    void parseRegistry(const QJsonObject &root)
    {
        m_nodeTypes.clear();
        m_groups.clear();

        const QJsonArray types =
            root.value(QStringLiteral("nodeTypes")).toArray();
        QSet<QString> groupSet;

        for (const QJsonValue &val : types) {
            const QJsonObject obj = val.toObject();
            const QString name =
                obj.value(QStringLiteral("name")).toString();
            if (name.isEmpty())
                continue;

            m_nodeTypes.insert(name, obj);

            const QString group =
                obj.value(QStringLiteral("group")).toString();
            if (!group.isEmpty())
                groupSet.insert(group);
        }

        m_groups = groupSet.values();
        m_groups.sort();
    }

    QMap<QString, QJsonObject> m_nodeTypes;
    QStringList m_groups;
    bool m_loaded = false;
    QString m_lastError;
};
