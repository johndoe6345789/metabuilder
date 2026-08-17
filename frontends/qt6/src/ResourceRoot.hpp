#pragma once

#include <QCoreApplication>
#include <QDir>
#include <QFileInfo>
#include <QString>
#include <QStringList>
#include <QtGlobal>
#include <utility>
/**
 * @file ResourceRoot.hpp
 * @brief Locate the directory holding the app's on-disk runtime data.
 *
 * Most of the Qt6 frontend is compiled into the binary as Qt resources, but a
 * few things are still read from the filesystem at runtime -- notably
 * packages/, which PackageLoader scans and watches for changes.
 *
 * Those used to be addressed through SRCDIR, the source directory baked in at
 * compile time. That works for a developer running the binary out of its build
 * tree and is meaningless anywhere else: in a released build SRCDIR names a
 * path on the CI runner that does not exist on the user's machine, so the app
 * starts with no packages and no obvious explanation. Release layouts are
 * resolved first, and SRCDIR is kept as the last resort so developer builds
 * keep working exactly as before.
 */
namespace metabuilder {

/** Subdirectory that must be present for a candidate to count as the root. */
inline constexpr auto kResourceMarker = "packages";

/**
 * @brief Directory containing packages/ and other on-disk runtime data.
 *
 * Candidates are tried in order and the first one that actually contains the
 * marker directory wins:
 *
 *  1. `$METABUILDER_QT6_ROOT` -- explicit override, for unusual installs.
 *  2. `<exe>/../Resources` -- inside a macOS .app bundle.
 *  3. `<exe>/../share/metabuilder-qt6` -- release install layout on Linux/Windows.
 *  4. `<exe>` -- fallback for installs where data sits beside the binary.
 *  5. `SRCDIR` -- the source tree, for builds run from the build directory.
 *
 * @return An absolute path, or an empty string when nothing was found (in
 *         which case callers should carry on without that data rather than
 *         fail: a missing package directory is not fatal).
 */
inline QString resourceRoot()
{
    QStringList candidates;

    const QByteArray rootOverride = qgetenv("METABUILDER_QT6_ROOT");
    if (!rootOverride.isEmpty())
        candidates << QString::fromLocal8Bit(rootOverride);

    const QString exeDir = QCoreApplication::applicationDirPath();
    if (!exeDir.isEmpty()) {
        candidates << QDir::cleanPath(exeDir + QStringLiteral("/../Resources"))
                   << QDir::cleanPath(exeDir + QStringLiteral("/../share/metabuilder-qt6"))
                   << exeDir;
    }

#ifdef SRCDIR
    candidates << QStringLiteral(SRCDIR);
#endif

    for (const QString &candidate : std::as_const(candidates)) {
        if (candidate.isEmpty())
            continue;
        const QDir dir(candidate);
        if (dir.exists(QLatin1String(kResourceMarker)))
            return dir.absolutePath();
    }

    return QString();
}

/**
 * @brief Resolve a path below resourceRoot().
 * @param relative Path relative to the resource root, e.g. "packages".
 * @return Absolute path, or an empty string when no resource root was found.
 */
inline QString resourcePath(const QString &relative)
{
    const QString root = resourceRoot();
    if (root.isEmpty())
        return QString();
    return QDir::cleanPath(root + QLatin1Char('/') + relative);
}

} // namespace metabuilder
