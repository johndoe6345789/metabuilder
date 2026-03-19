#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QUrl>
#include <QDir>

#include "src/PackageRegistry.h"
#include "src/ModPlayer.h"
#include "src/DBALClient.h"
#include "src/PackageLoader.h"

int main(int argc, char *argv[]) {
    QGuiApplication app(argc, argv);
    QQmlApplicationEngine engine;

    // Add shared QML component library path
    // Resolves: import QmlComponents 1.0
    const auto appDir = QCoreApplication::applicationDirPath();
    const QStringList qmlPaths = {
        appDir + "/../../qml",
        appDir + "/../../../qml",
        appDir + "/../../../../qml",
        QDir::cleanPath(QStringLiteral(SRCDIR) + "/../../qml")
    };
    for (const auto &path : qmlPaths) {
        if (QDir(path).exists()) {
            engine.addImportPath(QDir(path).absolutePath());
            break;
        }
    }

    PackageRegistry registry;
    ModPlayer modPlayer;
    DBALClient dbalClient;
    PackageLoader packageLoader;
    registry.loadPackage("frontpage");
    packageLoader.setPackagesDir(QDir(QStringLiteral(SRCDIR) + QStringLiteral("/packages")).absolutePath());
    packageLoader.scan();
    packageLoader.setWatching(true);
    engine.rootContext()->setContextProperty(QStringLiteral("PackageRegistry"), &registry);
    engine.rootContext()->setContextProperty(QStringLiteral("ModPlayer"), &modPlayer);
    engine.rootContext()->setContextProperty(QStringLiteral("DBALClient"), &dbalClient);
    engine.rootContext()->setContextProperty(QStringLiteral("PackageLoader"), &packageLoader);

    const QUrl url(QStringLiteral("qrc:/DBALObservatory/App.qml"));
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
                         if (!obj && objUrl == url)
                             QCoreApplication::exit(-1);
                     }, Qt::QueuedConnection);

    engine.load(url);
    return app.exec();
}
