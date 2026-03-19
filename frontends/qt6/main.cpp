#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QUrl>
#include <QDir>

#include "src/PackageRegistry.h"
#include "src/ModPlayer.h"

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
    registry.loadPackage("frontpage");
    engine.rootContext()->setContextProperty(QStringLiteral("PackageRegistry"), &registry);
    engine.rootContext()->setContextProperty(QStringLiteral("ModPlayer"), &modPlayer);

    const QUrl url(QStringLiteral("qrc:/DBALObservatory/App.qml"));
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
                         if (!obj && objUrl == url)
                             QCoreApplication::exit(-1);
                     }, Qt::QueuedConnection);

    engine.load(url);
    return app.exec();
}
