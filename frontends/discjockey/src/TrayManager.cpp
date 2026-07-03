#include "TrayManager.hpp"
#include <QMenu>
#include <QAction>
#include <QIcon>
#include <QApplication>
#include <QTimer>

TrayManager::TrayManager(QObject *parent) : QObject(parent) {
    tray_ = new QSystemTrayIcon(this);
    tray_->setIcon(QIcon(":/tray_icon.png"));
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
    // Defer show until after the event loop starts
    QTimer::singleShot(500, this, [this] { tray_->show(); });
}
