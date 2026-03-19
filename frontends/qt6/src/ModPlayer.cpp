#include "ModPlayer.h"

#include <QDebug>
#include <QFile>

// ModPlayer stub - libopenmpt + Qt6 Multimedia not yet configured via Conan.
// Once available, this will use QAudioSink (Qt6) + openmpt::module for .mod playback.

ModPlayer::ModPlayer(QObject *parent)
    : QObject(parent)
{
}

ModPlayer::~ModPlayer() {
    stop();
}

bool ModPlayer::play(const QString &path) {
    if (!QFile::exists(path)) {
        qWarning() << "ModPlayer: file not found:" << path;
        return false;
    }

    qInfo() << "ModPlayer: would play" << path << "(audio backend not yet linked)";
    updatePlaying(true);
    return true;
}

void ModPlayer::stop() {
    updatePlaying(false);
}

bool ModPlayer::isPlaying() const {
    return m_playing;
}

void ModPlayer::updatePlaying(bool playing) {
    if (m_playing == playing)
        return;
    m_playing = playing;
    emit playbackChanged();
}
