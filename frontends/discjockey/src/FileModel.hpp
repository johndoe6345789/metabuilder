#pragma once
#include <QAbstractListModel>
#include <QStringList>
#include <vector>

struct MediaFile {
    QString path;
    QString name;
    QString ext;
    qint64  size = 0;
};

class FileModel : public QAbstractListModel {
    Q_OBJECT

public:
    enum Roles {
        PathRole = Qt::UserRole + 1,
        NameRole,
        ExtRole,
        SizeRole,
        SizeStrRole
    };

    explicit FileModel(QObject *parent = nullptr);

    int rowCount(
        const QModelIndex &parent = {}) const override;
    QVariant data(
        const QModelIndex &index,
        int role = Qt::DisplayRole) const override;
    QHash<int, QByteArray> roleNames() const override;

    Q_INVOKABLE void addFiles(const QStringList &paths);
    Q_INVOKABLE void removeFile(int index);
    Q_INVOKABLE void clear();
    Q_INVOKABLE QStringList allFilePaths() const;

private:
    static bool supported(const QString &ext);
    std::vector<MediaFile> files_;
};
