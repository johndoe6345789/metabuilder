#include "Python.h"
#include "pycore_dict.h"              // _TyDict_DelItemIf()
#include "pycore_object.h"            // _TyObject_GET_WEAKREFS_LISTPTR()
#include "pycore_weakref.h"           // _TyWeakref_IS_DEAD()

#define GET_WEAKREFS_LISTPTR(o) \
        ((PyWeakReference **) _TyObject_GET_WEAKREFS_LISTPTR(o))

/*[clinic input]
module _weakref
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=ffec73b85846596d]*/

#include "clinic/_weakref.c.h"

/*[clinic input]
_weakref.getweakrefcount -> Ty_ssize_t

  object: object
  /

Return the number of weak references to 'object'.
[clinic start generated code]*/

static Ty_ssize_t
_weakref_getweakrefcount_impl(TyObject *module, TyObject *object)
/*[clinic end generated code: output=301806d59558ff3e input=7d4d04fcaccf64d5]*/
{
    return _TyWeakref_GetWeakrefCount(object);
}


static int
is_dead_weakref(TyObject *value, void *unused)
{
    if (!PyWeakref_Check(value)) {
        TyErr_SetString(TyExc_TypeError, "not a weakref");
        return -1;
    }
    return _TyWeakref_IS_DEAD(value);
}

/*[clinic input]

_weakref._remove_dead_weakref -> object

  dct: object(subclass_of='&TyDict_Type')
  key: object
  /

Atomically remove key from dict if it points to a dead weakref.
[clinic start generated code]*/

static TyObject *
_weakref__remove_dead_weakref_impl(TyObject *module, TyObject *dct,
                                   TyObject *key)
/*[clinic end generated code: output=d9ff53061fcb875c input=19fc91f257f96a1d]*/
{
    if (_TyDict_DelItemIf(dct, key, is_dead_weakref, NULL) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


/*[clinic input]
_weakref.getweakrefs
    object: object
    /

Return a list of all weak reference objects pointing to 'object'.
[clinic start generated code]*/

static TyObject *
_weakref_getweakrefs(TyObject *module, TyObject *object)
/*[clinic end generated code: output=25c7731d8e011824 input=00c6d0e5d3206693]*/
{
    if (!_TyType_SUPPORTS_WEAKREFS(Ty_TYPE(object))) {
        return TyList_New(0);
    }

    TyObject *result = TyList_New(0);
    if (result == NULL) {
        return NULL;
    }

    LOCK_WEAKREFS(object);
    PyWeakReference *current = *GET_WEAKREFS_LISTPTR(object);
    while (current != NULL) {
        TyObject *curobj = (TyObject *) current;
        if (_Ty_TryIncref(curobj)) {
            if (TyList_Append(result, curobj)) {
                UNLOCK_WEAKREFS(object);
                Ty_DECREF(curobj);
                Ty_DECREF(result);
                return NULL;
            }
            else {
                // Undo our _Ty_TryIncref. This is safe to do with the lock
                // held in free-threaded builds; the list holds a reference to
                // curobj so we're guaranteed not to invoke the destructor.
                Ty_DECREF(curobj);
            }
        }
        current = current->wr_next;
    }
    UNLOCK_WEAKREFS(object);
    return result;
}


/*[clinic input]

_weakref.proxy
    object: object
    callback: object(c_default="NULL") = None
    /

Create a proxy object that weakly references 'object'.

'callback', if given, is called with a reference to the
proxy when 'object' is about to be finalized.
[clinic start generated code]*/

static TyObject *
_weakref_proxy_impl(TyObject *module, TyObject *object, TyObject *callback)
/*[clinic end generated code: output=d68fa4ad9ea40519 input=4808adf22fd137e7]*/
{
    return PyWeakref_NewProxy(object, callback);
}


static TyMethodDef
weakref_functions[] =  {
    _WEAKREF_GETWEAKREFCOUNT_METHODDEF
    _WEAKREF__REMOVE_DEAD_WEAKREF_METHODDEF
    _WEAKREF_GETWEAKREFS_METHODDEF
    _WEAKREF_PROXY_METHODDEF
    {NULL, NULL, 0, NULL}
};

static int
weakref_exec(TyObject *module)
{
    if (TyModule_AddObjectRef(module, "ref", (TyObject *) &_TyWeakref_RefType) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(module, "ReferenceType",
                           (TyObject *) &_TyWeakref_RefType) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(module, "ProxyType",
                           (TyObject *) &_TyWeakref_ProxyType) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(module, "CallableProxyType",
                           (TyObject *) &_TyWeakref_CallableProxyType) < 0) {
        return -1;
    }

    return 0;
}

static struct PyModuleDef_Slot weakref_slots[] = {
    {Ty_mod_exec, weakref_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef weakrefmodule = {
    PyModuleDef_HEAD_INIT,
    "_weakref",
    "Weak-reference support module.",
    0,
    weakref_functions,
    weakref_slots,
    NULL,
    NULL,
    NULL
};

PyMODINIT_FUNC
PyInit__weakref(void)
{
    return PyModuleDef_Init(&weakrefmodule);
}
