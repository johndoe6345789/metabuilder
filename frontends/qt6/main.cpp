#include <QCoreApplication>
#include <QGuiApplication>
#include <QObject>
#include <QStringLiteral>
#include <QQmlApplicationEngine>
#include <QUrl>
#include <QQmlContext>

#include "src/PackageRegistry.h"

int main(int argc, char *argv[]) {
    QGuiApplication app(argc, argv);
    QQmlApplicationEngine engine;
    const QUrl url(QStringLiteral("qrc:/FrontPage.qml"));

    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
                         if (!obj && objUrl == url) {
                             QCoreApplication::exit(-1);
                         }
                     });
    PackageRegistry registry;
    registry.loadPackage("frontpage");
    engine.rootContext()->setContextProperty(QStringLiteral("PackageRegistry"), &registry);

    engine.load(url);
    return app.exec();
}
