#pragma once

#include <QObject>

class QAudioOutput;

namespace openmpt { class module; }

class ModPlayer : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool playing READ isPlaying NOTIFY playbackChanged)

public:
    explicit ModPlayer(QObject *parent = nullptr);
    ~ModPlayer() override;

    Q_INVOKABLE bool play(const QString &path);
    Q_INVOKABLE void stop();

    bool isPlaying() const;

signals:
    void playbackChanged();

private:
    class Backend;
    std::unique_ptr<Backend> m_backend;
    QAudioOutput *m_audioOutput = nullptr;
    std::unique_ptr<openmpt::module> m_module;
    bool m_playing = false;
    void updatePlaying(bool playing);
};
