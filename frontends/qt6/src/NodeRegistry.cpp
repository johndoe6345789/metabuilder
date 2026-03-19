#include "NodeRegistry.h"

#include <QFile>
#include <QJsonDocument>
#include <QDebug>
#include <algorithm>

NodeRegistry::NodeRegistry(QObject *parent)
    : QObject(parent)
{
}

QVariantList NodeRegistry::nodeTypes() const
{
    QVariantList list;
    for (auto it = m_nodeTypes.constBegin(); it != m_nodeTypes.constEnd(); ++it) {
        list.append(it.value().toVariantMap());
    }
    return list;
}

void NodeRegistry::loadRegistry(const QString &path)
{
    QFile file(path);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        m_lastError = QStringLiteral("Cannot open registry file: ") + path;
        qWarning() << "NodeRegistry:" << m_lastError;
        emit errorOccurred(m_lastError);
        return;
    }

    QJsonParseError parseErr;
    const QJsonDocument doc = QJsonDocument::fromJson(file.readAll(), &parseErr);
    file.close();

    if (parseErr.error != QJsonParseError::NoError) {
        m_lastError = QStringLiteral("JSON parse error: ") + parseErr.errorString();
        qWarning() << "NodeRegistry:" << m_lastError;
        emit errorOccurred(m_lastError);
        return;
    }

    parseRegistry(doc.object());

    m_loaded = true;
    emit loadedChanged();
    emit nodeTypesChanged();
    qDebug() << "NodeRegistry: loaded" << m_nodeTypes.count() << "node types in"
             << m_groups.count() << "groups from" << path;
}

void NodeRegistry::parseRegistry(const QJsonObject &root)
{
    m_nodeTypes.clear();
    m_groups.clear();

    const QJsonArray types = root.value(QStringLiteral("nodeTypes")).toArray();
    QSet<QString> groupSet;

    for (const QJsonValue &val : types) {
        const QJsonObject obj = val.toObject();
        const QString name = obj.value(QStringLiteral("name")).toString();
        if (name.isEmpty())
            continue;

        m_nodeTypes.insert(name, obj);

        const QString group = obj.value(QStringLiteral("group")).toString();
        if (!group.isEmpty())
            groupSet.insert(group);
    }

    m_groups = groupSet.values();
    m_groups.sort();
}

QVariantMap NodeRegistry::nodeType(const QString &name) const
{
    if (!m_nodeTypes.contains(name))
        return {};
    return m_nodeTypes.value(name).toVariantMap();
}

QVariantList NodeRegistry::nodesByGroup(const QString &group) const
{
    QVariantList list;
    for (auto it = m_nodeTypes.constBegin(); it != m_nodeTypes.constEnd(); ++it) {
        if (it.value().value(QStringLiteral("group")).toString() == group)
            list.append(it.value().toVariantMap());
    }
    return list;
}

QVariantList NodeRegistry::searchNodes(const QString &query) const
{
    if (query.isEmpty())
        return nodeTypes();

    const QString lower = query.toLower();
    QVariantList list;
    for (auto it = m_nodeTypes.constBegin(); it != m_nodeTypes.constEnd(); ++it) {
        const QJsonObject &obj = it.value();
        const QString name = obj.value(QStringLiteral("name")).toString().toLower();
        const QString displayName = obj.value(QStringLiteral("displayName")).toString().toLower();
        const QString desc = obj.value(QStringLiteral("description")).toString().toLower();

        if (name.contains(lower) || displayName.contains(lower) || desc.contains(lower))
            list.append(obj.toVariantMap());
    }
    return list;
}
