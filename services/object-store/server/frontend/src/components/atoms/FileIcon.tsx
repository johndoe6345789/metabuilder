'use client';

import {
  File, Image, Code, Archive, Description,
} from '@shared/m3';

/** @brief Props for FileIcon atom. */
export interface FileIconProps {
  /** Filename to infer icon from. */
  filename: string;
  /** Test ID for automation. */
  testId?: string;
}

const IMAGE_EXT =
  /\.(png|jpg|jpeg|gif|svg|webp)$/i;
const CODE_EXT =
  /\.(ts|tsx|js|json|cpp|h|py|rs)$/i;
const ARCHIVE_EXT =
  /\.(zip|tar|gz|bz2|7z|rar)$/i;
const DOC_EXT =
  /\.(pdf|doc|docx|txt|md|csv)$/i;

/**
 * @brief Icon matching file extension type.
 * @param props - FileIcon properties.
 */
export default function FileIcon({
  filename,
  testId = 'file-icon',
}: FileIconProps) {
  const style = {
    fontSize: 20,
    color: 'var(--md-sys-color-on-surface)',
  };
  const props = {
    'data-testid': testId,
    'aria-label': `File type for ${filename}`,
    style,
  };

  if (IMAGE_EXT.test(filename))
    return <Image {...props} />;
  if (CODE_EXT.test(filename))
    return <Code {...props} />;
  if (ARCHIVE_EXT.test(filename))
    return <Archive {...props} />;
  if (DOC_EXT.test(filename))
    return <Description {...props} />;
  return <File {...props} />;
}
