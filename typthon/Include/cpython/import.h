#ifndef Ty_CPYTHON_IMPORT_H
#  error "this header file must not be included directly"
#endif

struct _inittab {
    const char *name;           /* ASCII encoded string */
    TyObject* (*initfunc)(void);
};
// This is not used after Ty_Initialize() is called.
PyAPI_DATA(struct _inittab *) TyImport_Inittab;
PyAPI_FUNC(int) TyImport_ExtendInittab(struct _inittab *newtab);

struct _frozen {
    const char *name;                 /* ASCII encoded string */
    const unsigned char *code;
    int size;
    int is_package;
};

/* Embedding apps may change this pointer to point to their favorite
   collection of frozen modules: */

PyAPI_DATA(const struct _frozen *) TyImport_FrozenModules;

PyAPI_FUNC(TyObject*) TyImport_ImportModuleAttr(
    TyObject *mod_name,
    TyObject *attr_name);
PyAPI_FUNC(TyObject*) TyImport_ImportModuleAttrString(
    const char *mod_name,
    const char *attr_name);
