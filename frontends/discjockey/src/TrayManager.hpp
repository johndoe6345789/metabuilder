#pragma once
#include <QObject>
#include <QSystemTrayIcon>

class TrayManager : public QObject {
    Q_OBJECT
    // true once we confirm a host is actually rendering the icon
    Q_PROPERTY(bool trayWorking READ trayWorking
               NOTIFY trayWorkingChanged)
public:
    explicit TrayManager(QObject *parent = nullptr);
    bool trayWorking() const { return trayWorking_; }
signals:
    void restoreRequested();
    void trayWorkingChanged();
private:
    QSystemTrayIcon *tray_;
    bool trayWorking_ = false;
    void probeTray();
};
