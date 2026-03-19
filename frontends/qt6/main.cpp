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

    // Add shared QML component library path
    // Resolves: import QmlComponents 1.0
    const auto appDir = QCoreApplication::applicationDirPath();
    // Qt6 resolves "import QmlComponents" by looking for a QmlComponents/ dir
    // inside each import path. We symlink or reference the parent of qml/.
    const QStringList qmlParentPaths = {
        appDir + "/../../",
        appDir + "/../../../",
        appDir + "/../../../../",
        QDir::cleanPath(QStringLiteral(SRCDIR) + "/../..")
    };
    for (const auto &path : qmlParentPaths) {
        const QString candidate = QDir(path).absolutePath();
        // Check if QmlComponents symlink or qml/ dir with qmldir exists
        if (QDir(candidate + "/QmlComponents").exists()
            || QDir(candidate + "/qml").exists()) {
            engine.addImportPath(candidate);
            break;
        }
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
