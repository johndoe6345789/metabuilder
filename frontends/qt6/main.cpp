#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QUrl>
#include <QDir>

#include "src/PackageRegistry.h"
#include "src/ModPlayer.h"
#include "src/DBALClient.h"
#include "src/PackageLoader.h"
#include "src/NodeRegistry.h"

int main(int argc, char *argv[]) {
    QGuiApplication app(argc, argv);
    QQmlApplicationEngine engine;

    // Add shared QML component library import paths
    // No symlinks — directly reference the qml/ directory tree
    const QString projectRoot = QDir::cleanPath(QStringLiteral(SRCDIR) + QStringLiteral("/../.."));
    const QString qmlDir = projectRoot + QStringLiteral("/qml");

    // Add qml/ parent so Qt finds "import QmlComponents 1.0" at qml/components/
    // and "import MetaBuilder 1.0" at qml/MetaBuilder/
    if (QDir(qmlDir).exists()) {
        engine.addImportPath(qmlDir);
        engine.addImportPath(projectRoot);
    }

    PackageRegistry registry;
    ModPlayer modPlayer;
    DBALClient dbalClient;
    PackageLoader packageLoader;
    NodeRegistry nodeRegistry;
    registry.loadPackage("frontpage");
    packageLoader.setPackagesDir(QDir(QStringLiteral(SRCDIR) + QStringLiteral("/packages")).absolutePath());
    packageLoader.scan();
    packageLoader.setWatching(true);

    // Load workflow node type registry
    const QString registryPath = QDir::cleanPath(
        QStringLiteral(SRCDIR) + QStringLiteral("/../../workflow/plugins/registry/node-registry.json"));
    nodeRegistry.loadRegistry(registryPath);

    engine.rootContext()->setContextProperty(QStringLiteral("PackageRegistry"), &registry);
    engine.rootContext()->setContextProperty(QStringLiteral("ModPlayer"), &modPlayer);
    engine.rootContext()->setContextProperty(QStringLiteral("DBALClient"), &dbalClient);
    engine.rootContext()->setContextProperty(QStringLiteral("PackageLoader"), &packageLoader);
    engine.rootContext()->setContextProperty(QStringLiteral("NodeRegistry"), &nodeRegistry);

    const QUrl url(QStringLiteral("qrc:/qt/qml/DBALObservatory/App.qml"));
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
                         if (!obj && objUrl == url)
                             QCoreApplication::exit(-1);
                     }, Qt::QueuedConnection);

    engine.load(url);
    return app.exec();
}
