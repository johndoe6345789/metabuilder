#pragma once
#include <QObject>
#include <QVariantList>
#include <QVariantMap>
#include <QStringList>

class Session : public QObject {
    Q_OBJECT
public:
    explicit Session(QObject *parent = nullptr);

    Q_INVOKABLE void save(
        const QVariantList &tabs,
        const QStringList  &files,
        int                 currentTab);
    Q_INVOKABLE QVariantMap load();

private:
    QString dataPath() const;
};
