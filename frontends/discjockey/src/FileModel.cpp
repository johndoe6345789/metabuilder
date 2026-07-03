#include "FileModel.hpp"
#include <QFileInfo>
#include <QLocale>
#include <algorithm>

FileModel::FileModel(QObject *parent)
    : QAbstractListModel(parent)
{}

bool FileModel::supported(const QString &ext) {
    static const QStringList exts{
        "mp3", "mp4", "mkv", "flac"};
    return exts.contains(ext.toLower());
}

int FileModel::rowCount(const QModelIndex &) const {
    return static_cast<int>(files_.size());
}

QVariant FileModel::data(
    const QModelIndex &index, int role) const
{
    if (!index.isValid() ||
        index.row() >= (int)files_.size())
        return {};

    const auto &f = files_[index.row()];
    switch (role) {
    case PathRole:    return f.path;
    case NameRole:    return f.name;
    case ExtRole:     return f.ext;
    case SizeRole:    return f.size;
    case SizeStrRole:
        return QLocale().formattedDataSize(f.size);
    default: return {};
    }
}

QHash<int, QByteArray> FileModel::roleNames() const {
    return {
        {PathRole,    "filePath"},
        {NameRole,    "fileName"},
        {ExtRole,     "fileExt"},
        {SizeRole,    "fileSize"},
        {SizeStrRole, "fileSizeStr"},
    };
}

void FileModel::addFiles(const QStringList &paths) {
    for (const auto &p : paths) {
        QFileInfo fi(p);
        const QString ext = fi.suffix().toLower();
        if (!supported(ext)) continue;

        const bool dup = std::any_of(
            files_.begin(), files_.end(),
            [&p](const MediaFile &f) {
                return f.path == p;
            });
        if (dup) continue;

        beginInsertRows(
            {}, (int)files_.size(), (int)files_.size());
        files_.push_back({
            p, fi.fileName(), ext, fi.size()});
        endInsertRows();
    }
}

void FileModel::removeFile(int index) {
    if (index < 0 || index >= (int)files_.size())
        return;
    beginRemoveRows({}, index, index);
    files_.erase(files_.begin() + index);
    endRemoveRows();
}

void FileModel::clear() {
    if (files_.empty()) return;
    beginResetModel();
    files_.clear();
    endResetModel();
}
