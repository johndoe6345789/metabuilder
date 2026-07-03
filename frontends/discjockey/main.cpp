#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QDir>
#include <QUrl>
#include <qqml.h>

#include "ApiClient.hpp"
#include "UploadClient.hpp"
#include "FileModel.hpp"
#include "JobModel.hpp"

int main(int argc, char *argv[])
{
    // Fall back to xcb (X11) when no Wayland display is available
    if (qEnvironmentVariable("QT_QPA_PLATFORM").isEmpty() &&
        qEnvironmentVariable("WAYLAND_DISPLAY").isEmpty()) {
        qputenv("QT_QPA_PLATFORM", "xcb");
    }

    QGuiApplication app(argc, argv);
    app.setOrganizationName("MetaBuilder");
    app.setApplicationName("DiscJockey");

    qmlRegisterType<ApiClient>("DiscJockey", 1, 0, "ApiClient");
    qmlRegisterType<UploadClient>("DiscJockey", 1, 0, "UploadClient");
    qmlRegisterType<FileModel>("DiscJockey", 1, 0, "FileModel");
    qmlRegisterType<JobModel>("DiscJockey", 1, 0, "JobModel");

    QQmlApplicationEngine engine;
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
