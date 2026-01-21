/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(mappingproxy_new__doc__,
"mappingproxy(mapping)\n"
"--\n"
"\n"
"Read-only proxy of a mapping.");

static TyObject *
mappingproxy_new_impl(TyTypeObject *type, TyObject *mapping);

static TyObject *
mappingproxy_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(mapping), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"mapping", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "mappingproxy",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *mapping;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    mapping = fastargs[0];
    return_value = mappingproxy_new_impl(type, mapping);

exit:
    return return_value;
}

TyDoc_STRVAR(property_init__doc__,
"property(fget=None, fset=None, fdel=None, doc=None)\n"
"--\n"
"\n"
"Property attribute.\n"
"\n"
"  fget\n"
"    function to be used for getting an attribute value\n"
"  fset\n"
"    function to be used for setting an attribute value\n"
"  fdel\n"
"    function to be used for del\'ing an attribute\n"
"  doc\n"
"    docstring\n"
"\n"
"Typical use is to define a managed attribute x:\n"
"\n"
"class C(object):\n"
"    def getx(self): return self._x\n"
"    def setx(self, value): self._x = value\n"
"    def delx(self): del self._x\n"
"    x = property(getx, setx, delx, \"I\'m the \'x\' property.\")\n"
"\n"
"Decorators make defining new properties or modifying existing ones easy:\n"
"\n"
"class C(object):\n"
"    @property\n"
"    def x(self):\n"
"        \"I am the \'x\' property.\"\n"
"        return self._x\n"
"    @x.setter\n"
"    def x(self, value):\n"
"        self._x = value\n"
"    @x.deleter\n"
"    def x(self):\n"
"        del self._x");

static int
property_init_impl(propertyobject *self, TyObject *fget, TyObject *fset,
                   TyObject *fdel, TyObject *doc);

static int
property_init(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fget), &_Ty_ID(fset), &_Ty_ID(fdel), &_Ty_ID(doc), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fget", "fset", "fdel", "doc", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "property",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *fget = NULL;
    TyObject *fset = NULL;
    TyObject *fdel = NULL;
    TyObject *doc = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        fget = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[1]) {
        fset = fastargs[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[2]) {
        fdel = fastargs[2];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    doc = fastargs[3];
skip_optional_pos:
    return_value = property_init_impl((propertyobject *)self, fget, fset, fdel, doc);

exit:
    return return_value;
}
/*[clinic end generated code: output=2e8df497abc4f915 input=a9049054013a1b77]*/
