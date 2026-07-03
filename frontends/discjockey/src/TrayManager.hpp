#pragma once
#include <QObject>
#include <QSystemTrayIcon>

class TrayManager : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool available READ available CONSTANT)
public:
    explicit TrayManager(QObject *parent = nullptr);
    bool available() const;
signals:
    void restoreRequested();
private:
    QSystemTrayIcon *tray_;
};
