// Statistics on Python performance (public API).
//
// Define _Ty_INCREF_STAT_INC() and _Ty_DECREF_STAT_INC() used by Ty_INCREF()
// and Ty_DECREF().
//
// See Include/cpython/pystats.h for the full API.

#ifndef Ty_PYSTATS_H
#define Ty_PYSTATS_H
#ifdef __cplusplus
extern "C" {
#endif

#if defined(Ty_STATS) && !defined(Ty_LIMITED_API)
#  define Ty_CPYTHON_PYSTATS_H
#  include "cpython/pystats.h"
#  undef Ty_CPYTHON_PYSTATS_H
#else
#  define _Ty_INCREF_STAT_INC() ((void)0)
#  define _Ty_DECREF_STAT_INC() ((void)0)
#  define _Ty_INCREF_IMMORTAL_STAT_INC() ((void)0)
#  define _Ty_DECREF_IMMORTAL_STAT_INC() ((void)0)
#endif  // !Ty_STATS

#ifdef __cplusplus
}
#endif
#endif   // !Ty_PYSTATS_H
