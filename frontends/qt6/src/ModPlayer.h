#pragma once

#include <QObject>
#include <QString>

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
    bool m_playing = false;
    void updatePlaying(bool playing);
};
