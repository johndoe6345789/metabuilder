
/* Module object interface */

#ifndef Ty_MODULEOBJECT_H
#define Ty_MODULEOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_DATA(TyTypeObject) TyModule_Type;

#define TyModule_Check(op) PyObject_TypeCheck((op), &TyModule_Type)
#define TyModule_CheckExact(op) Ty_IS_TYPE((op), &TyModule_Type)

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(TyObject *) TyModule_NewObject(
    TyObject *name
    );
#endif
PyAPI_FUNC(TyObject *) TyModule_New(
    const char *name            /* UTF-8 encoded string */
    );
PyAPI_FUNC(TyObject *) TyModule_GetDict(TyObject *);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(TyObject *) TyModule_GetNameObject(TyObject *);
#endif
PyAPI_FUNC(const char *) TyModule_GetName(TyObject *);
Ty_DEPRECATED(3.2) PyAPI_FUNC(const char *) TyModule_GetFilename(TyObject *);
PyAPI_FUNC(TyObject *) TyModule_GetFilenameObject(TyObject *);
PyAPI_FUNC(TyModuleDef*) TyModule_GetDef(TyObject*);
PyAPI_FUNC(void*) TyModule_GetState(TyObject*);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03050000
/* New in 3.5 */
PyAPI_FUNC(TyObject *) PyModuleDef_Init(TyModuleDef*);
PyAPI_DATA(TyTypeObject) PyModuleDef_Type;
#endif

typedef struct PyModuleDef_Base {
  PyObject_HEAD
  /* The function used to re-initialize the module.
     This is only set for legacy (single-phase init) extension modules
     and only used for those that support multiple initializations
     (m_size >= 0).
     It is set by _TyImport_LoadDynamicModuleWithSpec()
     and _imp.create_builtin(). */
  TyObject* (*m_init)(void);
  /* The module's index into its interpreter's modules_by_index cache.
     This is set for all extension modules but only used for legacy ones.
     (See TyInterpreterState.modules_by_index for more info.)
     It is set by PyModuleDef_Init(). */
  Ty_ssize_t m_index;
  /* A copy of the module's __dict__ after the first time it was loaded.
     This is only set/used for legacy modules that do not support
     multiple initializations.
     It is set by fix_up_extension() in import.c. */
  TyObject* m_copy;
} PyModuleDef_Base;

#define PyModuleDef_HEAD_INIT {  \
    PyObject_HEAD_INIT(_Py_NULL) \
    _Py_NULL, /* m_init */       \
    0,        /* m_index */      \
    _Py_NULL, /* m_copy */       \
  }

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03050000
/* New in 3.5 */
struct PyModuleDef_Slot {
    int slot;
    void *value;
};

#define Ty_mod_create 1
#define Ty_mod_exec 2
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030c0000
#  define Ty_mod_multiple_interpreters 3
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
#  define Ty_mod_gil 4
#endif


#ifndef Ty_LIMITED_API
#define _Ty_mod_LAST_SLOT 4
#endif

#endif /* New in 3.5 */

/* for Ty_mod_multiple_interpreters: */
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030c0000
#  define Ty_MOD_MULTIPLE_INTERPRETERS_NOT_SUPPORTED ((void *)0)
#  define Ty_MOD_MULTIPLE_INTERPRETERS_SUPPORTED ((void *)1)
#  define Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED ((void *)2)
#endif

/* for Ty_mod_gil: */
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
#  define Ty_MOD_GIL_USED ((void *)0)
#  define Ty_MOD_GIL_NOT_USED ((void *)1)
#endif

#if !defined(Ty_LIMITED_API) && defined(Ty_GIL_DISABLED)
PyAPI_FUNC(int) PyUnstable_Module_SetGIL(TyObject *module, void *gil);
#endif

struct TyModuleDef {
  PyModuleDef_Base m_base;
  const char* m_name;
  const char* m_doc;
  Ty_ssize_t m_size;
  TyMethodDef *m_methods;
  PyModuleDef_Slot *m_slots;
  traverseproc m_traverse;
  inquiry m_clear;
  freefunc m_free;
};

#ifdef __cplusplus
}
#endif
#endif /* !Ty_MODULEOBJECT_H */
