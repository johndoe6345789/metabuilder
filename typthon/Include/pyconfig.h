/* pyconfig.h for Typthon CMake build
 * Generated for Unix-like systems (Linux, macOS)
 */

#ifndef Ty_PYCONFIG_H
#define Ty_PYCONFIG_H

/* Platform detection */
#if defined(_WIN32) || defined(_WIN64)
    #define MS_WINDOWS
    #define MS_WIN32
#elif defined(__linux__)
    #define __linux__ 1
#elif defined(__APPLE__)
    #define __APPLE__ 1
#endif

/* Version info */
#define VERSION "3.14"
#define ABIFLAGS ""
#define SOABI "cpython-314"

/* Build-time configuration */
#define Ty_BUILD_CORE 1
#define Ty_BUILD_CORE_BUILTIN 1

/* Basic type sizes */
#define SIZEOF_INT 4
#define SIZEOF_LONG 8
#define SIZEOF_VOID_P 8
#define SIZEOF_SIZE_T 8
#define SIZEOF_TIME_T 8
#define SIZEOF_WCHAR_T 4
#define SIZEOF_SHORT 2
#define SIZEOF_FLOAT 4
#define SIZEOF_DOUBLE 8
#define SIZEOF_FPOS_T 16
#define SIZEOF_LONG_LONG 8
#define SIZEOF_LONG_DOUBLE 16
#define SIZEOF_PID_T 4
#define SIZEOF_UINTPTR_T 8
#define SIZEOF_PTHREAD_T 8
#define SIZEOF_OFF_T 8

/* Alignments */
#define ALIGNOF_SIZE_T 8
#define ALIGNOF_LONG 8
#define ALIGNOF_DOUBLE 8

/* Thread support */
#ifndef MS_WINDOWS
    #define WITH_THREAD 1
    #define HAVE_PTHREAD_H 1
#endif

/* Standard headers */
#define HAVE_STDINT_H 1
#define HAVE_STDLIB_H 1
#define HAVE_STRING_H 1
#define HAVE_ERRNO_H 1
#define HAVE_STDIO_H 1
#define HAVE_LIMITS_H 1
#define HAVE_LOCALE_H 1
#define HAVE_SIGNAL_H 1
#define HAVE_STDDEF_H 1
#define HAVE_STDARG_H 1
#define HAVE_STRINGS_H 1
#define HAVE_WCHAR_H 1

/* POSIX headers */
#ifndef MS_WINDOWS
    #define HAVE_UNISTD_H 1
    #define HAVE_FCNTL_H 1
    #define HAVE_GRP_H 1
    #define HAVE_PWD_H 1
    #define HAVE_SYS_TYPES_H 1
    #define HAVE_SYS_STAT_H 1
    #define HAVE_SYS_TIME_H 1
    #define HAVE_SYS_TIMES_H 1
    #define HAVE_SYS_WAIT_H 1
    #define HAVE_SYS_RESOURCE_H 1
    #define HAVE_SYS_SELECT_H 1
    #define HAVE_SYS_SOCKET_H 1
    #define HAVE_NETINET_IN_H 1
    #define HAVE_ARPA_INET_H 1
    #define HAVE_DIRENT_H 1
    #define HAVE_DLFCN_H 1
    #define HAVE_TERMIOS_H 1
    #define HAVE_SYS_IOCTL_H 1
    #define HAVE_SYS_PARAM_H 1
    #define HAVE_SYS_FILE_H 1
    #define HAVE_LANGINFO_H 1
    #define HAVE_SYS_UTSNAME_H 1
#endif

/* Functions */
#define HAVE_ALARM 1
#define HAVE_CHOWN 1
#define HAVE_CLOCK 1
#define HAVE_CLOCK_GETTIME 1
#define HAVE_CONFSTR 1
#define HAVE_FORK 1
#define HAVE_FSEEK64 1
#define HAVE_FSEEKO 1
#define HAVE_FSTATVFS 1
#define HAVE_FSYNC 1
#define HAVE_FTELL64 1
#define HAVE_FTELLO 1
#define HAVE_FTRUNCATE 1
#define HAVE_GAI_STRERROR 1
#define HAVE_GETGROUPS 1
#define HAVE_GETHOSTBYNAME 1
#define HAVE_GETLOGIN 1
#define HAVE_GETPEERNAME 1
#define HAVE_GETPGID 1
#define HAVE_GETPID 1
#define HAVE_GETPRIORITY 1
#define HAVE_GETPWENT 1
#define HAVE_GETTIMEOFDAY 1
#define HAVE_GETWD 1
#define HAVE_HYPOT 1
#define HAVE_KILL 1
#define HAVE_LINK 1
#define HAVE_LSTAT 1
#define HAVE_MKTIME 1
#define HAVE_NICE 1
#define HAVE_NL_LANGINFO 1
#define HAVE_PAUSE 1
/* plock is not available on modern Linux systems */
/* #define HAVE_PLOCK 1 */
#define HAVE_POLL 1
#define HAVE_PTHREAD_KILL 1
#define HAVE_PUTENV 1
#define HAVE_READLINK 1
#define HAVE_REALPATH 1
#define HAVE_SELECT 1
#define HAVE_SETGID 1
#define HAVE_SETLOCALE 1
#define HAVE_SETPGID 1
#define HAVE_SETPGRP 1
#define HAVE_SETSID 1
#define HAVE_SETUID 1
#define HAVE_SETVBUF 1
#define HAVE_SIGACTION 1
#define HAVE_SIGINTERRUPT 1
#define HAVE_SIGRELSE 1
#define HAVE_SNPRINTF 1
#define HAVE_STATVFS 1
#define HAVE_STRDUP 1
#define HAVE_STRERROR 1
#define HAVE_STRFTIME 1
#define HAVE_SYMLINK 1
#define HAVE_SYSCONF 1
#define HAVE_TCGETPGRP 1
#define HAVE_TCSETPGRP 1
#define HAVE_TIMEGM 1
#define HAVE_TIMES 1
#define HAVE_UNAME 1
#define HAVE_UNSETENV 1
#define HAVE_UTIMES 1
#define HAVE_WAITPID 1
#define HAVE_WORKING_TZSET 1

/* Dynamic loading */
#ifndef MS_WINDOWS
    #define HAVE_DYNAMIC_LOADING 1
    #define WITH_DYLD 1
#endif

/* Other features */
#define HAVE_LIBDL 1
#define HAVE_LIBM 1
#define HAVE_LIBPTHREAD 1
#define HAVE_LIBUTIL 1

/* Enable large file support */
#define _LARGEFILE_SOURCE 1
#define _FILE_OFFSET_BITS 64

/* Compiler features */
#define HAVE_GCC_ASM_FOR_X87 1
#define HAVE_GCC_ASM_FOR_X64 1
#define HAVE_GCC_UINT128_T 1

/* Python-specific */
#define PLATLIBDIR "lib"
#define PYTHONPATH ":"
#define PREFIX "/usr/local"
#define EXEC_PREFIX "/usr/local"
#define VPATH ""
#define _PYTHONFRAMEWORK ""

/* Platform */
#ifdef __linux__
    #define PLATFORM "linux"
#elif defined(__APPLE__)
    #define PLATFORM "darwin"
#else
    #define PLATFORM "posix"
#endif

/* Miscellaneous */
#define HAVE_COMPUTED_GOTOS 1
#define USE_COMPUTED_GOTOS 1

#endif /* Ty_PYCONFIG_H */
