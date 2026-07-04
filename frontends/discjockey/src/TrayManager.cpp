#include "TrayManager.hpp"
#include <QMenu>
#include <QAction>
#include <QPixmap>
#include <QPainter>
#include <QFont>
#include <QTimer>
#include <QApplication>
#ifdef Q_OS_LINUX
#  include <QDBusInterface>
#  include <QProcess>
#endif

static QIcon makeTrayIcon() {
    QPixmap pm(32, 32);
    pm.fill(Qt::transparent);
    QPainter p(&pm);
    p.setRenderHint(QPainter::Antialiasing);

    for (int x = 0; x < 32; x++) {
        float t = float(x) / 31.f;
        p.setPen(QColor(int(124*(1-t)+14*t),
                        int(58 *(1-t)+165*t),
                        int(237*(1-t)+233*t)));
        p.drawLine(x, 0, x, 31);
    }

    QPixmap mask(32, 32);
    mask.fill(Qt::transparent);
    QPainter mp(&mask);
    mp.setRenderHint(QPainter::Antialiasing);
    mp.setBrush(Qt::white); mp.setPen(Qt::NoPen);
    mp.drawRoundedRect(0, 0, 32, 32, 7, 7);
    mp.end();

    p.setCompositionMode(QPainter::CompositionMode_DestinationIn);
    p.drawPixmap(0, 0, mask);
    p.setCompositionMode(QPainter::CompositionMode_SourceOver);

    QFont f; f.setBold(true); f.setPixelSize(14);
    p.setFont(f); p.setPen(Qt::white);
    p.drawText(QRect(0,0,32,32), Qt::AlignCenter, "DJ");
    p.end();
    return QIcon(pm);
}

TrayManager::TrayManager(QObject *parent) : QObject(parent) {
    tray_ = new QSystemTrayIcon(makeTrayIcon(), this);
    tray_->setToolTip("DiscJockey");

    auto *menu    = new QMenu();
    auto *restore = menu->addAction("Open DiscJockey");
    menu->addSeparator();
    auto *quit    = menu->addAction("Quit");

    connect(restore, &QAction::triggered,
            this, &TrayManager::restoreRequested);
    connect(quit, &QAction::triggered,
            qApp, &QApplication::quit);
    connect(tray_, &QSystemTrayIcon::activated,
            this, [this](QSystemTrayIcon::ActivationReason r) {
        if (r == QSystemTrayIcon::Trigger)
            emit restoreRequested();
    });

    tray_->setContextMenu(menu);
    tray_->show();

    QTimer::singleShot(800, this, &TrayManager::probeTray);
}

void TrayManager::probeTray() {
#ifdef Q_OS_LINUX
    // Check 1 — SNI: is a host actually registered on the watcher?
    // NB: the property is IsStatusNotifierHostRegistered (a bool).
    // The older RegisteredStatusNotifierHosts list is NOT implemented by
    // XFCE's watcher, so querying it always fails — that was the bug.
    {
        QDBusInterface w("org.kde.StatusNotifierWatcher",
                         "/StatusNotifierWatcher",
                         "org.kde.StatusNotifierWatcher",
                         QDBusConnection::sessionBus());
        if (w.isValid()) {
            QVariant reg = w.property("IsStatusNotifierHostRegistered");
            if (reg.isValid() && reg.toBool()) {
                trayWorking_ = true;
                emit trayWorkingChanged();
                return;
            }
        }
    }

    // Check 2 — XEmbed fallback: _NET_SYSTEM_TRAY_S0 owned on the root?
    {
        QProcess xprop;
        xprop.start("xprop", {"-root", "_NET_SYSTEM_TRAY_S0"});
        if (xprop.waitForFinished(500)) {
            QByteArray out = xprop.readAllStandardOutput();
            if (out.contains("# ") || out.contains("0x")) {
                trayWorking_ = true;
                emit trayWorkingChanged();
                return;
            }
        }
    }

    trayWorking_ = false;
#else
    trayWorking_ = QSystemTrayIcon::isSystemTrayAvailable();
#endif
    emit trayWorkingChanged();
}
