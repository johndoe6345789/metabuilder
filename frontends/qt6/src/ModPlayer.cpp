#include "ModPlayer.h"

#include <QAudioFormat>
#include <QAudioOutput>
#include <QDir>
#include <QFile>

#include <libopenmpt/libopenmpt.hpp>

#include <memory>
#include <vector>
#include <cstring>

namespace {
constexpr int SampleRate = 48000;
constexpr int Channels = 2;

class ModPlayerBackend : public QIODevice {
public:
    explicit ModPlayerBackend(QObject *parent = nullptr)
        : QIODevice(parent)
    {
        open(QIODevice::ReadOnly);
    }

    void setModule(openmpt::module *module) {
        m_module = module;
    }

    qint64 readData(char *data, qint64 maxlen) override {
        if (!m_module || maxlen <= 0)
            return 0;

        const int frames = maxlen / (Channels * sizeof(qint16));
        if (frames <= 0)
            return 0;

        if (m_buffer.size() < static_cast<size_t>(frames * Channels))
            m_buffer.resize(frames * Channels);

        int readFrames = m_module->read_interleaved_stereo(SampleRate, frames, m_buffer.data());
        if (readFrames <= 0)
            return 0;

        const qint64 bytes = static_cast<qint64>(readFrames) * Channels * sizeof(qint16);
        std::memcpy(data, m_buffer.data(), bytes);
        return bytes;
    }

    qint64 writeData(const char *, qint64) override {
        return 0;
    }

private:
    openmpt::module *m_module = nullptr;
    std::vector<int16_t> m_buffer;
};
}

ModPlayer::ModPlayer(QObject *parent)
    : QObject(parent)
    , m_backend(std::make_unique<ModPlayerBackend>(this))
{
    QAudioFormat format;
    format.setSampleRate(SampleRate);
    format.setChannelCount(Channels);
    format.setSampleSize(16);
    format.setCodec("audio/pcm");
    format.setByteOrder(QAudioFormat::LittleEndian);
    format.setSampleType(QAudioFormat::SignedInt);

    m_audioOutput = new QAudioOutput(format, this);
}

ModPlayer::~ModPlayer() {
    stop();
    delete m_audioOutput;
}

bool ModPlayer::play(const QString &path) {
    stop();

    QFile file(path);
    if (!file.open(QIODevice::ReadOnly))
        return false;

    const auto data = file.readAll();
    file.close();

    try {
        m_module = std::make_unique<openmpt::module>(reinterpret_cast<const unsigned char *>(data.constData()),
                                                     static_cast<std::size_t>(data.size()));
    } catch (...) {
        return false;
    }

    m_backend->setModule(m_module.get());
    m_audioOutput->start(m_backend.get());
    updatePlaying(true);
    QObject::connect(m_audioOutput, &QAudioOutput::stateChanged, this, [this](QAudio::State state) {
        if (state == QAudio::IdleState || state == QAudio::StoppedState)
            updatePlaying(false);
    });

    return true;
}

void ModPlayer::stop() {
    if (m_audioOutput && (m_audioOutput->state() == QAudio::ActiveState || m_audioOutput->state() == QAudio::IdleState)) {
        m_audioOutput->stop();
    }
    m_module.reset();
    m_backend->setModule(nullptr);
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
