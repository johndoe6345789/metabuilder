/* Declarations shared between the different POSIX-related modules */

#ifndef Ty_POSIXMODULE_H
#define Ty_POSIXMODULE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifdef HAVE_SYS_TYPES_H
#  include <sys/types.h>          // uid_t
#endif

#ifndef MS_WINDOWS
extern TyObject* _TyLong_FromUid(uid_t);

// Export for 'grp' shared extension
PyAPI_FUNC(TyObject*) _TyLong_FromGid(gid_t);

// Export for '_posixsubprocess' shared extension
PyAPI_FUNC(int) _Ty_Uid_Converter(TyObject *, uid_t *);

// Export for 'grp' shared extension
PyAPI_FUNC(int) _Ty_Gid_Converter(TyObject *, gid_t *);
#endif   // !MS_WINDOWS

#if (defined(PYPTHREAD_SIGMASK) || defined(HAVE_SIGWAIT) \
     || defined(HAVE_SIGWAITINFO) || defined(HAVE_SIGTIMEDWAIT))
#  define HAVE_SIGSET_T
#endif

extern int _Ty_Sigset_Converter(TyObject *, void *);

#ifdef __cplusplus
}
#endif
#endif   // !Ty_POSIXMODULE_H
