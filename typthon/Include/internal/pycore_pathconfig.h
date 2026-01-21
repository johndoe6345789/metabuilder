#ifndef Ty_INTERNAL_PATHCONFIG_H
#define Ty_INTERNAL_PATHCONFIG_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

// Export for '_testinternalcapi' shared extension
PyAPI_FUNC(void) _TyPathConfig_ClearGlobal(void);

extern TyStatus _TyPathConfig_ReadGlobal(TyConfig *config);
extern TyStatus _TyPathConfig_UpdateGlobal(const TyConfig *config);
extern const wchar_t * _TyPathConfig_GetGlobalModuleSearchPath(void);

extern int _TyPathConfig_ComputeSysPath0(
    const TyWideStringList *argv,
    TyObject **path0);


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_PATHCONFIG_H */
