#include "Session.hpp"
#include <QFile>
#include <QDir>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QStandardPaths>

Session::Session(QObject *parent) : QObject(parent) {}

QString Session::dataPath() const {
    const QString dir = QStandardPaths::writableLocation(
        QStandardPaths::AppLocalDataLocation);
    QDir().mkpath(dir);
    return dir + "/session.json";
}

void Session::save(
    const QVariantList &tabs,
    const QStringList  &files,
    int                 currentTab)
{
    QJsonArray ta;
    for (const auto &v : tabs) {
        const auto m = v.toMap();
        QJsonObject o;
        o["filePath"] = m.value("filePath").toString();
        o["fileName"] = m.value("fileName").toString();
        o["fileExt"]  = m.value("fileExt").toString();
        o["tabType"]  = m.value("tabType").toString();
        o["pinned"]   = m.value("pinned", false).toBool();
        ta.append(o);
    }
    QJsonArray fa;
    for (const auto &f : files) fa.append(f);

    QJsonObject root;
    root["tabs"]       = ta;
    root["files"]      = fa;
    root["currentTab"] = currentTab;

    QFile f(dataPath());
    if (f.open(QIODevice::WriteOnly | QIODevice::Truncate))
        f.write(QJsonDocument(root).toJson());
}

QVariantMap Session::load() {
    QFile f(dataPath());
    if (!f.open(QIODevice::ReadOnly)) return {};
    QJsonParseError err;
    auto doc = QJsonDocument::fromJson(f.readAll(), &err);
    if (err.error != QJsonParseError::NoError || !doc.isObject())
        return {};

    const auto root = doc.object();
    QVariantList tabs;
    for (const auto &v : root["tabs"].toArray()) {
        const auto o = v.toObject();
        QVariantMap m;
        m["filePath"] = o["filePath"].toString();
        m["fileName"] = o["fileName"].toString();
        m["fileExt"]  = o["fileExt"].toString();
        m["tabType"]  = o["tabType"].toString();
        m["pinned"]   = o["pinned"].toBool();
        tabs.append(m);
    }
    QStringList files;
    for (const auto &v : root["files"].toArray())
        files << v.toString();

    QVariantMap out;
    out["tabs"]       = tabs;
    out["files"]      = files;
    out["currentTab"] = root["currentTab"].toInt(-1);
    return out;
}
