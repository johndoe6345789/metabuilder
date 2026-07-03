#include "TrayManager.hpp"
#include <QMenu>
#include <QAction>
#include <QPixmap>
#include <QPainter>
#include <QFont>
#include <QApplication>

static QIcon makeTrayIcon() {
    QPixmap pm(32, 32);
    pm.fill(Qt::transparent);
    QPainter p(&pm);
    p.setRenderHint(QPainter::Antialiasing);

    // Gradient fill via vertical lines
    for (int x = 0; x < 32; x++) {
        float t = float(x) / 31.f;
        int r = int(124*(1-t) + 14*t);
        int g = int(58 *(1-t) + 165*t);
        int b = int(237*(1-t) + 233*t);
        p.setPen(QColor(r, g, b));
        p.drawLine(x, 0, x, 31);
    }

    // Rounded-rect clip mask
    QPixmap mask(32, 32);
    mask.fill(Qt::transparent);
    QPainter mp(&mask);
    mp.setRenderHint(QPainter::Antialiasing);
    mp.setBrush(Qt::white);
    mp.setPen(Qt::NoPen);
    mp.drawRoundedRect(0, 0, 32, 32, 7, 7);
    mp.end();

    p.setCompositionMode(QPainter::CompositionMode_DestinationIn);
    p.drawPixmap(0, 0, mask);
    p.setCompositionMode(QPainter::CompositionMode_SourceOver);

    QFont f; f.setBold(true); f.setPixelSize(14);
    p.setFont(f);
    p.setPen(Qt::white);
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
}

bool TrayManager::available() const {
    return QSystemTrayIcon::isSystemTrayAvailable();
}
