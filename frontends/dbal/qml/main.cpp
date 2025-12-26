#include <QCoreApplication>
#include <QGuiApplication>
#include <QObject>
#include <QStringLiteral>
#include <QQmlApplicationEngine>
#include <QUrl>

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

    engine.load(url);
    return app.exec();
}
