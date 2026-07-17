#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QUrl>
#include <QDir>
#include <QCoreApplication>

#include "src/PackageRegistry.hpp"
#include "src/ModPlayer.hpp"
#include "src/DBALClient.h"
#include "src/PackageLoader.h"
#include "src/NodeRegistry.hpp"

int main(int argc, char *argv[]) {
    qputenv("QML_XHR_ALLOW_FILE_READ", "1");
    QGuiApplication app(argc, argv);
    app.setOrganizationName("MetaBuilder");
    app.setOrganizationDomain("metabuilder.local");
    app.setApplicationName("MetaBuilder");
    QQmlApplicationEngine engine;

    // QML import path: imports/QmlComponents is a symlink to
    // libraries/qml/ so Qt resolves "import QmlComponents 1.0"
    // by finding imports/QmlComponents/qmldir.
    const QString importsDir =
        QDir::cleanPath(QStringLiteral(SRCDIR)
                        + QStringLiteral("/imports"));
    if (QDir(importsDir).exists()) {
        engine.addImportPath(importsDir);
    }

    PackageRegistry registry;
    ModPlayer modPlayer;
    DBALClient dbalClient;
    PackageLoader packageLoader;
    NodeRegistry nodeRegistry;
    registry.loadPackage("frontpage");
    packageLoader.setPackagesDir(
        QDir(QStringLiteral(SRCDIR) + QStringLiteral("/packages"))
            .absolutePath());
    packageLoader.scan();
    packageLoader.setWatching(true);

    // Load workflow node type registry
    const QString registryPath = QDir::cleanPath(
        QStringLiteral(SRCDIR)
        + QStringLiteral(
            "/../../workflow/plugins/registry/node-registry.json"));
    nodeRegistry.loadRegistry(registryPath);

    auto *ctx = engine.rootContext();
    ctx->setContextProperty(QStringLiteral("PackageRegistry"), &registry);
    ctx->setContextProperty(QStringLiteral("ModPlayer"),       &modPlayer);
    ctx->setContextProperty(QStringLiteral("DBALClient"),      &dbalClient);
    ctx->setContextProperty(QStringLiteral("PackageLoader"),   &packageLoader);
    ctx->setContextProperty(QStringLiteral("NodeRegistry"),    &nodeRegistry);

    const QUrl url(QStringLiteral("qrc:/qt/qml/DBALObservatory/App.qml"));
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
                         if (!obj && objUrl == url)
                             QCoreApplication::exit(-1);
                     }, Qt::QueuedConnection);

    engine.load(url);
    return app.exec();
}
