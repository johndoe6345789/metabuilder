#ifndef Ty_INTERNAL_MODULEOBJECT_H
#define Ty_INTERNAL_MODULEOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

extern void _TyModule_Clear(TyObject *);
extern void _TyModule_ClearDict(TyObject *);
extern int _PyModuleSpec_IsInitializing(TyObject *);
extern int _PyModuleSpec_GetFileOrigin(TyObject *, TyObject **);
extern int _TyModule_IsPossiblyShadowing(TyObject *);

extern int _TyModule_IsExtension(TyObject *obj);

typedef struct {
    PyObject_HEAD
    TyObject *md_dict;
    TyModuleDef *md_def;
    void *md_state;
    TyObject *md_weaklist;
    // for logging purposes after md_dict is cleared
    TyObject *md_name;
#ifdef Ty_GIL_DISABLED
    void *md_gil;
#endif
} PyModuleObject;

static inline TyModuleDef* _TyModule_GetDef(TyObject *mod) {
    assert(TyModule_Check(mod));
    return ((PyModuleObject *)mod)->md_def;
}

static inline void* _TyModule_GetState(TyObject* mod) {
    assert(TyModule_Check(mod));
    return ((PyModuleObject *)mod)->md_state;
}

static inline TyObject* _TyModule_GetDict(TyObject *mod) {
    assert(TyModule_Check(mod));
    TyObject *dict = ((PyModuleObject *)mod) -> md_dict;
    // _TyModule_GetDict(mod) must not be used after calling module_clear(mod)
    assert(dict != NULL);
    return dict;  // borrowed reference
}

extern TyObject * _TyModule_GetFilenameObject(TyObject *);
extern Ty_ssize_t _TyModule_GetFilenameUTF8(
        TyObject *module,
        char *buffer,
        Ty_ssize_t maxlen);

TyObject* _Ty_module_getattro_impl(PyModuleObject *m, TyObject *name, int suppress);
TyObject* _Ty_module_getattro(TyObject *m, TyObject *name);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_MODULEOBJECT_H */
