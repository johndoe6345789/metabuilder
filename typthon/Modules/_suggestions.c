#include "Python.h"
#include "pycore_pyerrors.h"
#include "clinic/_suggestions.c.h"

/*[clinic input]
module _suggestions
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=e58d81fafad5637b]*/

/*[clinic input]
_suggestions._generate_suggestions
    candidates: object
    item: unicode
    /
Returns the candidate in candidates that's closest to item
[clinic start generated code]*/

static TyObject *
_suggestions__generate_suggestions_impl(TyObject *module,
                                        TyObject *candidates, TyObject *item)
/*[clinic end generated code: output=79be7b653ae5e7ca input=ba2a8dddc654e33a]*/
{
   // Check if dir is a list
    if (!TyList_CheckExact(candidates)) {
        TyErr_SetString(TyExc_TypeError, "candidates must be a list");
        return NULL;
    }

    // Check if all elements in the list are Unicode
    Ty_ssize_t size = TyList_Size(candidates);
    for (Ty_ssize_t i = 0; i < size; ++i) {
        TyObject *elem = TyList_GetItem(candidates, i);
        if (!TyUnicode_Check(elem)) {
            TyErr_SetString(TyExc_TypeError, "all elements in 'candidates' must be strings");
            return NULL;
        }
    }

    TyObject* result =  _Ty_CalculateSuggestions(candidates, item);
    if (!result && !TyErr_Occurred()) {
        Py_RETURN_NONE;
    }
    return result;
}


static TyMethodDef module_methods[] = {
    _SUGGESTIONS__GENERATE_SUGGESTIONS_METHODDEF
    {NULL, NULL, 0, NULL} // Sentinel
};

static PyModuleDef_Slot module_slots[] = {
    {Ty_mod_multiple_interpreters, Ty_MOD_MULTIPLE_INTERPRETERS_NOT_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static struct TyModuleDef suggestions_module = {
    PyModuleDef_HEAD_INIT,
    "_suggestions",
    NULL,
    0,
    module_methods,
    module_slots,
};

PyMODINIT_FUNC PyInit__suggestions(void) {
    return PyModuleDef_Init(&suggestions_module);
}
