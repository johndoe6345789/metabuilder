#ifndef Ty_WINREPARSE_H
#define Ty_WINREPARSE_H

#ifdef MS_WINDOWS
#include <windows.h>

#ifdef __cplusplus
extern "C" {
#endif

/* The following structure was copied from
   http://msdn.microsoft.com/en-us/library/ff552012.aspx as the required
   include km\ntifs.h isn't present in the Windows SDK (at least as included
   with Visual Studio Express). Use unique names to avoid conflicting with
   the structure as defined by Min GW. */
typedef struct {
    ULONG ReparseTag;
    USHORT ReparseDataLength;
    USHORT Reserved;
    union {
        struct {
            USHORT SubstituteNameOffset;
            USHORT SubstituteNameLength;
            USHORT PrintNameOffset;
            USHORT PrintNameLength;
            ULONG Flags;
            WCHAR PathBuffer[1];
        } SymbolicLinkReparseBuffer;

        struct {
            USHORT SubstituteNameOffset;
            USHORT  SubstituteNameLength;
            USHORT  PrintNameOffset;
            USHORT  PrintNameLength;
            WCHAR  PathBuffer[1];
        } MountPointReparseBuffer;

        struct {
            UCHAR  DataBuffer[1];
        } GenericReparseBuffer;
    };
} _Ty_REPARSE_DATA_BUFFER, *_Ty_PREPARSE_DATA_BUFFER;

#define _Ty_REPARSE_DATA_BUFFER_HEADER_SIZE \
    FIELD_OFFSET(_Ty_REPARSE_DATA_BUFFER, GenericReparseBuffer)
#define _Ty_MAXIMUM_REPARSE_DATA_BUFFER_SIZE  ( 16 * 1024 )

// Defined in WinBase.h in 'recent' versions of Windows 10 SDK
#ifndef SYMBOLIC_LINK_FLAG_ALLOW_UNPRIVILEGED_CREATE
#define SYMBOLIC_LINK_FLAG_ALLOW_UNPRIVILEGED_CREATE 0x2
#endif

#ifdef __cplusplus
}
#endif

#endif /* MS_WINDOWS */

#endif /* !Ty_WINREPARSE_H */
