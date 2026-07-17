#include "JobModel.hpp"
#include <algorithm>

JobModel::JobModel(QObject *parent)
    : QAbstractListModel(parent)
{}

int JobModel::rowCount(const QModelIndex &) const {
    return static_cast<int>(jobs_.size());
}

QVariant JobModel::data(
    const QModelIndex &index, int role) const
{
    if (!index.isValid() ||
        index.row() >= (int)jobs_.size())
        return {};

    const auto &j = jobs_[index.row()];
    switch (role) {
    case IdRole:       return j.id;
    case FileRole:     return j.file;
    case TypeRole:     return j.type;
    case StatusRole:   return j.status;
    case ProgressRole: return j.progress;
    default:           return {};
    }
}

QHash<int, QByteArray> JobModel::roleNames() const {
    return {
        {IdRole,       "jobId"},
        {FileRole,     "jobFile"},
        {TypeRole,     "jobType"},
        {StatusRole,   "jobStatus"},
        {ProgressRole, "jobProgress"},
    };
}

void JobModel::addJob(
    const QString &id,
    const QString &file,
    const QString &type)
{
    beginInsertRows(
        {}, (int)jobs_.size(), (int)jobs_.size());
    jobs_.push_back({id, file, type, "pending", 0.0});
    endInsertRows();
}

void JobModel::updateJob(
    const QString &id,
    const QString &status,
    double progress)
{
    auto it = std::find_if(
        jobs_.begin(), jobs_.end(),
        [&id](const JobEntry &j) {
            return j.id == id;
        });
    if (it == jobs_.end()) return;

    it->status   = status;
    it->progress = progress;
    const int row =
        static_cast<int>(it - jobs_.begin());
    const QModelIndex idx = index(row);
    emit dataChanged(idx, idx,
        {StatusRole, ProgressRole});
}

void JobModel::removeJob(const QString &id) {
    auto it = std::find_if(
        jobs_.begin(), jobs_.end(),
        [&id](const JobEntry &j) {
            return j.id == id;
        });
    if (it == jobs_.end()) return;
    const int row =
        static_cast<int>(it - jobs_.begin());
    beginRemoveRows({}, row, row);
    jobs_.erase(it);
    endRemoveRows();
}
