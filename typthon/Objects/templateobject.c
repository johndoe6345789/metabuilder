/* t-string Template object implementation */

#include "Python.h"
#include "pycore_interpolation.h" // _PyInterpolation_CheckExact()
#include "pycore_runtime.h"       // _Ty_STR()
#include "pycore_template.h"

typedef struct {
    PyObject_HEAD
    TyObject *stringsiter;
    TyObject *interpolationsiter;
    int from_strings;
} templateiterobject;

#define templateiterobject_CAST(op) \
    (assert(_PyTemplateIter_CheckExact(op)), _Py_CAST(templateiterobject*, (op)))

static TyObject *
templateiter_next(TyObject *op)
{
    templateiterobject *self = templateiterobject_CAST(op);
    TyObject *item;
    if (self->from_strings) {
        item = TyIter_Next(self->stringsiter);
        self->from_strings = 0;
        if (item == NULL) {
            return NULL;
        }
        if (TyUnicode_GET_LENGTH(item) == 0) {
            Ty_SETREF(item, TyIter_Next(self->interpolationsiter));
            self->from_strings = 1;
        }
    }
    else {
        item = TyIter_Next(self->interpolationsiter);
        self->from_strings = 1;
    }
    return item;
}

static void
templateiter_dealloc(TyObject *op)
{
    PyObject_GC_UnTrack(op);
    Ty_TYPE(op)->tp_clear(op);
    Ty_TYPE(op)->tp_free(op);
}

static int
templateiter_clear(TyObject *op)
{
    templateiterobject *self = templateiterobject_CAST(op);
    Ty_CLEAR(self->stringsiter);
    Ty_CLEAR(self->interpolationsiter);
    return 0;
}

static int
templateiter_traverse(TyObject *op, visitproc visit, void *arg)
{
    templateiterobject *self = templateiterobject_CAST(op);
    Ty_VISIT(self->stringsiter);
    Ty_VISIT(self->interpolationsiter);
    return 0;
}

TyTypeObject _PyTemplateIter_Type = {
    TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "string.templatelib.TemplateIter",
    .tp_doc = TyDoc_STR("Template iterator object"),
    .tp_basicsize = sizeof(templateiterobject),
    .tp_itemsize = 0,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_alloc = TyType_GenericAlloc,
    .tp_dealloc = templateiter_dealloc,
    .tp_clear = templateiter_clear,
    .tp_free = PyObject_GC_Del,
    .tp_traverse = templateiter_traverse,
    .tp_iter = PyObject_SelfIter,
    .tp_iternext = templateiter_next,
};

typedef struct {
    PyObject_HEAD
    TyObject *strings;
    TyObject *interpolations;
} templateobject;

#define templateobject_CAST(op) \
    (assert(_PyTemplate_CheckExact(op)), _Py_CAST(templateobject*, (op)))

static TyObject *
template_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    if (kwds != NULL) {
        TyErr_SetString(TyExc_TypeError, "Template.__new__ only accepts *args arguments");
        return NULL;
    }

    Ty_ssize_t argslen = TyTuple_GET_SIZE(args);
    Ty_ssize_t stringslen = 0;
    Ty_ssize_t interpolationslen = 0;
    int last_was_str = 0;

    for (Ty_ssize_t i = 0; i < argslen; i++) {
        TyObject *item = TyTuple_GET_ITEM(args, i);
        if (TyUnicode_Check(item)) {
            if (!last_was_str) {
                stringslen++;
            }
            last_was_str = 1;
        }
        else if (_PyInterpolation_CheckExact(item)) {
            if (!last_was_str) {
                stringslen++;
            }
            interpolationslen++;
            last_was_str = 0;
        }
        else {
            TyErr_Format(
                TyExc_TypeError,
                "Template.__new__ *args need to be of type 'str' or 'Interpolation', got %T",
                item);
            return NULL;
        }
    }
    if (!last_was_str) {
        stringslen++;
    }

    TyObject *strings = TyTuple_New(stringslen);
    if (!strings) {
        return NULL;
    }

    TyObject *interpolations = TyTuple_New(interpolationslen);
    if (!interpolations) {
        Ty_DECREF(strings);
        return NULL;
    }

    last_was_str = 0;
    Ty_ssize_t stringsidx = 0, interpolationsidx = 0;
    for (Ty_ssize_t i = 0; i < argslen; i++) {
        TyObject *item = TyTuple_GET_ITEM(args, i);
        if (TyUnicode_Check(item)) {
            if (last_was_str) {
                TyObject *laststring = TyTuple_GET_ITEM(strings, stringsidx - 1);
                TyObject *concat = TyUnicode_Concat(laststring, item);
                Ty_DECREF(laststring);
                if (!concat) {
                    Ty_DECREF(strings);
                    Ty_DECREF(interpolations);
                    return NULL;
                }
                TyTuple_SET_ITEM(strings, stringsidx - 1, concat);
            }
            else {
                TyTuple_SET_ITEM(strings, stringsidx++, Ty_NewRef(item));
            }
            last_was_str = 1;
        }
        else if (_PyInterpolation_CheckExact(item)) {
            if (!last_was_str) {
                _Ty_DECLARE_STR(empty, "");
                TyTuple_SET_ITEM(strings, stringsidx++, &_Ty_STR(empty));
            }
            TyTuple_SET_ITEM(interpolations, interpolationsidx++, Ty_NewRef(item));
            last_was_str = 0;
        }
    }
    if (!last_was_str) {
        _Ty_DECLARE_STR(empty, "");
        TyTuple_SET_ITEM(strings, stringsidx++, &_Ty_STR(empty));
    }

    TyObject *template = _PyTemplate_Build(strings, interpolations);
    Ty_DECREF(strings);
    Ty_DECREF(interpolations);
    return template;
}

static void
template_dealloc(TyObject *op)
{
    PyObject_GC_UnTrack(op);
    Ty_TYPE(op)->tp_clear(op);
    Ty_TYPE(op)->tp_free(op);
}

static int
template_clear(TyObject *op)
{
    templateobject *self = templateobject_CAST(op);
    Ty_CLEAR(self->strings);
    Ty_CLEAR(self->interpolations);
    return 0;
}

static int
template_traverse(TyObject *op, visitproc visit, void *arg)
{
    templateobject *self = templateobject_CAST(op);
    Ty_VISIT(self->strings);
    Ty_VISIT(self->interpolations);
    return 0;
}

static TyObject *
template_repr(TyObject *op)
{
    templateobject *self = templateobject_CAST(op);
    return TyUnicode_FromFormat("%s(strings=%R, interpolations=%R)",
                                _TyType_Name(Ty_TYPE(self)),
                                self->strings,
                                self->interpolations);
}

static TyObject *
template_iter(TyObject *op)
{
    templateobject *self = templateobject_CAST(op);
    templateiterobject *iter = PyObject_GC_New(templateiterobject, &_PyTemplateIter_Type);
    if (iter == NULL) {
        return NULL;
    }

    TyObject *stringsiter = PyObject_GetIter(self->strings);
    if (stringsiter == NULL) {
        Ty_DECREF(iter);
        return NULL;
    }

    TyObject *interpolationsiter = PyObject_GetIter(self->interpolations);
    if (interpolationsiter == NULL) {
        Ty_DECREF(iter);
        Ty_DECREF(stringsiter);
        return NULL;
    }

    iter->stringsiter = stringsiter;
    iter->interpolationsiter = interpolationsiter;
    iter->from_strings = 1;
    PyObject_GC_Track(iter);
    return (TyObject *)iter;
}

static TyObject *
template_strings_concat(TyObject *left, TyObject *right)
{
    Ty_ssize_t left_stringslen = TyTuple_GET_SIZE(left);
    TyObject *left_laststring = TyTuple_GET_ITEM(left, left_stringslen - 1);
    Ty_ssize_t right_stringslen = TyTuple_GET_SIZE(right);
    TyObject *right_firststring = TyTuple_GET_ITEM(right, 0);

    TyObject *concat = TyUnicode_Concat(left_laststring, right_firststring);
    if (concat == NULL) {
        return NULL;
    }

    TyObject *newstrings = TyTuple_New(left_stringslen + right_stringslen - 1);
    if (newstrings == NULL) {
        Ty_DECREF(concat);
        return NULL;
    }

    Ty_ssize_t index = 0;
    for (Ty_ssize_t i = 0; i < left_stringslen - 1; i++) {
        TyTuple_SET_ITEM(newstrings, index++, Ty_NewRef(TyTuple_GET_ITEM(left, i)));
    }
    TyTuple_SET_ITEM(newstrings, index++, concat);
    for (Ty_ssize_t i = 1; i < right_stringslen; i++) {
        TyTuple_SET_ITEM(newstrings, index++, Ty_NewRef(TyTuple_GET_ITEM(right, i)));
    }

    return newstrings;
}

static TyObject *
template_concat_templates(templateobject *self, templateobject *other)
{
    TyObject *newstrings = template_strings_concat(self->strings, other->strings);
    if (newstrings == NULL) {
        return NULL;
    }

    TyObject *newinterpolations = PySequence_Concat(self->interpolations, other->interpolations);
    if (newinterpolations == NULL) {
        Ty_DECREF(newstrings);
        return NULL;
    }

    TyObject *newtemplate = _PyTemplate_Build(newstrings, newinterpolations);
    Ty_DECREF(newstrings);
    Ty_DECREF(newinterpolations);
    return newtemplate;
}

TyObject *
_PyTemplate_Concat(TyObject *self, TyObject *other)
{
    if (_PyTemplate_CheckExact(self) && _PyTemplate_CheckExact(other)) {
        return template_concat_templates((templateobject *) self, (templateobject *) other);
    }

    TyErr_Format(TyExc_TypeError,
        "can only concatenate string.templatelib.Template (not \"%T\") to string.templatelib.Template",
        other);
    return NULL;
}

static TyObject *
template_values_get(TyObject *op, void *Py_UNUSED(data))
{
    templateobject *self = templateobject_CAST(op);

    Ty_ssize_t len = TyTuple_GET_SIZE(self->interpolations);
    TyObject *values = TyTuple_New(TyTuple_GET_SIZE(self->interpolations));
    if (values == NULL) {
        return NULL;
    }

    for (Ty_ssize_t i = 0; i < len; i++) {
        TyObject *item = TyTuple_GET_ITEM(self->interpolations, i);
        TyTuple_SET_ITEM(values, i, _PyInterpolation_GetValueRef(item));
    }

    return values;
}

static TyMemberDef template_members[] = {
    {"strings", Ty_T_OBJECT_EX, offsetof(templateobject, strings), Py_READONLY, "Strings"},
    {"interpolations", Ty_T_OBJECT_EX, offsetof(templateobject, interpolations), Py_READONLY, "Interpolations"},
    {NULL},
};

static TyGetSetDef template_getset[] = {
    {"values", template_values_get, NULL,
     TyDoc_STR("Values of interpolations"), NULL},
    {NULL},
};

static PySequenceMethods template_as_sequence = {
    .sq_concat = _PyTemplate_Concat,
};

static TyObject*
template_reduce(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    TyObject *mod = TyImport_ImportModule("string.templatelib");
    if (mod == NULL) {
        return NULL;
    }
    TyObject *func = PyObject_GetAttrString(mod, "_template_unpickle");
    Ty_DECREF(mod);
    if (func == NULL) {
        return NULL;
    }

    templateobject *self = templateobject_CAST(op);
    TyObject *result = Ty_BuildValue("O(OO)",
                                     func,
                                     self->strings,
                                     self->interpolations);

    Ty_DECREF(func);
    return result;
}

static TyMethodDef template_methods[] = {
    {"__reduce__", template_reduce, METH_NOARGS, NULL},
    {"__class_getitem__", Ty_GenericAlias,
        METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    {NULL, NULL},
};

TyTypeObject _PyTemplate_Type = {
    TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "string.templatelib.Template",
    .tp_doc = TyDoc_STR("Template object"),
    .tp_basicsize = sizeof(templateobject),
    .tp_itemsize = 0,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_as_sequence = &template_as_sequence,
    .tp_new = template_new,
    .tp_alloc = TyType_GenericAlloc,
    .tp_dealloc = template_dealloc,
    .tp_clear = template_clear,
    .tp_free = PyObject_GC_Del,
    .tp_repr = template_repr,
    .tp_members = template_members,
    .tp_methods = template_methods,
    .tp_getset = template_getset,
    .tp_iter = template_iter,
    .tp_traverse = template_traverse,
};

TyObject *
_PyTemplate_Build(TyObject *strings, TyObject *interpolations)
{
    templateobject *template = PyObject_GC_New(templateobject, &_PyTemplate_Type);
    if (template == NULL) {
        return NULL;
    }

    template->strings = Ty_NewRef(strings);
    template->interpolations = Ty_NewRef(interpolations);
    PyObject_GC_Track(template);
    return (TyObject *) template;
}
