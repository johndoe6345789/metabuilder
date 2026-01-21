#ifndef Ty_INTERNAL_PYSTATS_H
#define Ty_INTERNAL_PYSTATS_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#ifdef Ty_STATS
extern void _Ty_StatsOn(void);
extern void _Ty_StatsOff(void);
extern void _Ty_StatsClear(void);
extern int _Ty_PrintSpecializationStats(int to_file);
#endif

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_PYSTATS_H
