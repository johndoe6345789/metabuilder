#include <QApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QIcon>
#include <QDir>
#include <QUrl>
#include <qqml.h>

#include "ApiClient.hpp"
#include "UploadClient.hpp"
#include "FileModel.hpp"
#include "JobModel.hpp"
#include "Session.hpp"
#include "TrayManager.hpp"
#include "AlbumArt.hpp"

static constexpr const char *DJ_VERSION = "0.3.6";

int main(int argc, char *argv[])
{
    if (qEnvironmentVariable("QT_QPA_PLATFORM").isEmpty() &&
        qEnvironmentVariable("WAYLAND_DISPLAY").isEmpty())
        qputenv("QT_QPA_PLATFORM", "xcb");

    // Linux tray icons go through StatusNotifierItem (SNI) on modern
    // desktops (XFCE systray, KDE, ayatana/GNOME).  Qt6 only ships its
    // SNI backend (QDBusTrayIcon) via the GTK3 platform theme, so force
    // it on unless the user already configured a theme.  Verified: with
    // gtk3 the item registers on org.kde.StatusNotifierWatcher and the
    // XFCE systray plugin renders it.
#ifdef Q_OS_LINUX
    if (qgetenv("QT_QPA_PLATFORMTHEME").isEmpty())
        qputenv("QT_QPA_PLATFORMTHEME", "gtk3");
#endif


    QApplication app(argc, argv);
    app.setOrganizationName("MetaBuilder");
    app.setApplicationName("DiscJockey");
    app.setApplicationVersion(DJ_VERSION);
    app.setWindowIcon(QIcon(":/icon.png"));
    app.setQuitOnLastWindowClosed(false);

    qmlRegisterType<ApiClient>   ("DiscJockey",1,0,"ApiClient");
    qmlRegisterType<UploadClient>("DiscJockey",1,0,"UploadClient");
    qmlRegisterType<FileModel>   ("DiscJockey",1,0,"FileModel");
    qmlRegisterType<JobModel>    ("DiscJockey",1,0,"JobModel");
    qmlRegisterType<Session>     ("DiscJockey",1,0,"Session");

    TrayManager  tray;
    AlbumArtHelper artHelper;

    QQmlApplicationEngine engine;
    engine.addImageProvider("albumart", new AlbumArtProvider);
    engine.rootContext()->setContextProperty("trayManager",  &tray);
    engine.rootContext()->setContextProperty("artHelper",    &artHelper);
    engine.rootContext()->setContextProperty("djVersion",
                                            QString(DJ_VERSION));
    engine.addImportPath(
        QDir::cleanPath(QStringLiteral(SRCDIR) + "/qml"));

    const QUrl url = QUrl::fromLocalFile(
        QDir::cleanPath(
            QStringLiteral(SRCDIR) + "/qml/Main.qml"));

    QObject::connect(
        &engine,
        &QQmlApplicationEngine::objectCreationFailed,
        &app,
        []() { QCoreApplication::exit(-1); },
        Qt::QueuedConnection);

    engine.load(url);
    return app.exec();
}
