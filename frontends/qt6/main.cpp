#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QUrl>
#include <QDir>
#include <QFile>
#include <QCoreApplication>

#include "src/PackageRegistry.hpp"
#include "src/ModPlayer.hpp"
#include "src/DBALClient.h"
#include "src/PackageLoader.h"
#include "src/NodeRegistry.hpp"
#include "src/ResourceRoot.hpp"

int main(int argc, char *argv[]) {
    qputenv("QML_XHR_ALLOW_FILE_READ", "1");
    QGuiApplication app(argc, argv);
    app.setOrganizationName("MetaBuilder");
    app.setOrganizationDomain("metabuilder.local");
    app.setApplicationName("MetaBuilder");
    QQmlApplicationEngine engine;

    // QML import path: imports/QmlComponents is a symlink to
    // libraries/qml/ so Qt resolves "import QmlComponents 1.0"
    // by finding imports/QmlComponents/qmldir. Developer builds only -- a
    // released build has every QML file compiled into its resources.
    const QString importsDir = metabuilder::resourcePath(QStringLiteral("imports"));
    if (!importsDir.isEmpty() && QDir(importsDir).exists()) {
        engine.addImportPath(importsDir);
    }

    PackageRegistry registry;
    ModPlayer modPlayer;
    DBALClient dbalClient;
    PackageLoader packageLoader;
    NodeRegistry nodeRegistry;
    registry.loadPackage("frontpage");

    // packages/ ships beside the binary in a released build and lives in the
    // source tree in a developer build; ResourceRoot resolves both.
    const QString packagesDir = metabuilder::resourcePath(QStringLiteral("packages"));
    if (!packagesDir.isEmpty()) {
        packageLoader.setPackagesDir(packagesDir);
        packageLoader.scan();
        packageLoader.setWatching(true);
    } else {
        qWarning("No packages directory found; set METABUILDER_QT6_ROOT to "
                 "the directory containing packages/.");
    }

    // Workflow node type registry. It comes from a sibling repo that is not
    // part of a release build, so its absence is normal and not fatal.
    for (const QString &candidate : {
             metabuilder::resourcePath(
                 QStringLiteral("workflow/plugins/registry/node-registry.json")),
             QDir::cleanPath(
                 QStringLiteral(SRCDIR)
                 + QStringLiteral("/../../workflow/plugins/registry/node-registry.json")),
         }) {
        if (!candidate.isEmpty() && QFile::exists(candidate)) {
            nodeRegistry.loadRegistry(candidate);
            break;
        }
    }

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
