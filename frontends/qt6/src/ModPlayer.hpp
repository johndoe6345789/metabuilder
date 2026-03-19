#pragma once

#include <QDebug>
#include <QFile>
#include <QObject>
#include <QString>

// ModPlayer stub - libopenmpt + Qt6 Multimedia not yet configured via Conan.
// Once available, this will use QAudioSink (Qt6) + openmpt::module
// for .mod playback.

class ModPlayer : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool playing READ isPlaying NOTIFY playbackChanged)

public:
    explicit ModPlayer(QObject *parent = nullptr)
        : QObject(parent)
    {
    }

    ~ModPlayer() override {
        stop();
    }

    Q_INVOKABLE bool play(const QString &path) {
        if (!QFile::exists(path)) {
            qWarning() << "ModPlayer: file not found:" << path;
            return false;
        }
        qInfo() << "ModPlayer: would play" << path
                << "(audio backend not yet linked)";
        updatePlaying(true);
        return true;
    }

    Q_INVOKABLE void stop() {
        updatePlaying(false);
    }

    bool isPlaying() const {
        return m_playing;
    }

signals:
    void playbackChanged();

private:
    bool m_playing = false;

    void updatePlaying(bool playing) {
        if (m_playing == playing)
            return;
        m_playing = playing;
        emit playbackChanged();
    }
};
