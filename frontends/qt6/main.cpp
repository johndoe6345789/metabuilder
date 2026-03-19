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

    // QML import paths — no symlinks needed
    // qml/qmldir has "module QmlComponents"
    // qml/MetaBuilder/qmldir has "module MetaBuilder"
    //
    // Qt resolves "import X 1.0" by scanning import paths
    // for a qmldir that declares "module X". Adding qml/
    // as an import path lets Qt find the QmlComponents
    // module (qml/qmldir) and MetaBuilder (qml/MetaBuilder/)
    const QString projectRoot = QDir::cleanPath(
        QStringLiteral(SRCDIR) + QStringLiteral("/../.."));
    const QString qmlDir =
        projectRoot + QStringLiteral("/qml");
    if (QDir(qmlDir).exists()) {
        engine.addImportPath(qmlDir);
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
