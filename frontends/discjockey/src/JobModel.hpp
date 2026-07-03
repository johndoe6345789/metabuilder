#pragma once
#include <QAbstractListModel>
#include <QString>
#include <vector>

struct JobEntry {
    QString id;
    QString file;
    QString type;
    QString status   = "pending";
    double  progress = 0.0;
};

class JobModel : public QAbstractListModel {
    Q_OBJECT

public:
    enum Roles {
        IdRole = Qt::UserRole + 1,
        FileRole,
        TypeRole,
        StatusRole,
        ProgressRole
    };

    explicit JobModel(QObject *parent = nullptr);

    int rowCount(
        const QModelIndex &parent = {}) const override;
    QVariant data(
        const QModelIndex &index,
        int role = Qt::DisplayRole) const override;
    QHash<int, QByteArray> roleNames() const override;

    Q_INVOKABLE void addJob(
        const QString &id,
        const QString &file,
        const QString &type);
    Q_INVOKABLE void updateJob(
        const QString &id,
        const QString &status,
        double progress);
    Q_INVOKABLE void removeJob(const QString &id);

private:
    std::vector<JobEntry> jobs_;
};
