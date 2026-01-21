/* PyInterpreterConfig API */

#include "Python.h"
#include "pycore_interp.h" // Ty_RTFLAGS
#include "pycore_pylifecycle.h"

#include <stdbool.h>

#include "config_common.h"


static const char *
gil_flag_to_str(int flag)
{
    switch (flag) {
    case PyInterpreterConfig_DEFAULT_GIL:
        return "default";
    case PyInterpreterConfig_SHARED_GIL:
        return "shared";
    case PyInterpreterConfig_OWN_GIL:
        return "own";
    default:
        TyErr_SetString(TyExc_SystemError,
                        "invalid interpreter config 'gil' value");
        return NULL;
    }
}

static int
gil_flag_from_str(const char *str, int *p_flag)
{
    int flag;
    if (str == NULL) {
        flag = PyInterpreterConfig_DEFAULT_GIL;
    }
    else if (strcmp(str, "default") == 0) {
        flag = PyInterpreterConfig_DEFAULT_GIL;
    }
    else if (strcmp(str, "shared") == 0) {
        flag = PyInterpreterConfig_SHARED_GIL;
    }
    else if (strcmp(str, "own") == 0) {
        flag = PyInterpreterConfig_OWN_GIL;
    }
    else {
        TyErr_Format(TyExc_ValueError,
                     "unsupported interpreter config .gil value '%s'", str);
        return -1;
    }
    *p_flag = flag;
    return 0;
}

TyObject *
_PyInterpreterConfig_AsDict(PyInterpreterConfig *config)
{
    TyObject *dict = TyDict_New();
    if (dict == NULL) {
        return NULL;
    }

#define ADD(NAME, OBJ)                                              \
        do {                                                        \
            int res = TyDict_SetItemString(dict, NAME, (OBJ));      \
            Ty_DECREF(OBJ);                                         \
            if (res < 0) {                                          \
                goto error;                                         \
            }                                                       \
        } while (0)
#define ADD_BOOL(FIELD) \
        ADD(#FIELD, Ty_NewRef(config->FIELD ? Ty_True : Ty_False))
#define ADD_STR(FIELD, STR)                                         \
        do {                                                        \
            if (STR == NULL) {                                      \
                goto error;                                         \
            }                                                       \
            TyObject *obj = TyUnicode_FromString(STR);              \
            if (obj == NULL) {                                      \
                goto error;                                         \
            }                                                       \
            ADD(#FIELD, obj);                                       \
        } while (0)

    ADD_BOOL(use_main_obmalloc);
    ADD_BOOL(allow_fork);
    ADD_BOOL(allow_exec);
    ADD_BOOL(allow_threads);
    ADD_BOOL(allow_daemon_threads);
    ADD_BOOL(check_multi_interp_extensions);

    ADD_STR(gil, gil_flag_to_str(config->gil));

#undef ADD_STR
#undef ADD_BOOL
#undef ADD

    return dict;

error:
    Ty_DECREF(dict);
    return NULL;
}

static int
_config_dict_get_bool(TyObject *dict, const char *name, int *p_flag)
{
    TyObject *item;
    if (_config_dict_get(dict, name, &item) < 0) {
        return -1;
    }
    // For now we keep things strict, rather than using PyObject_IsTrue().
    int flag = item == Ty_True;
    if (!flag && item != Ty_False) {
        Ty_DECREF(item);
        config_dict_invalid_type(name);
        return -1;
    }
    Ty_DECREF(item);
    *p_flag = flag;
    return 0;
}

static int
_config_dict_copy_str(TyObject *dict, const char *name,
                      char *buf, size_t bufsize)
{
    TyObject *item;
    if (_config_dict_get(dict, name, &item) < 0) {
        return -1;
    }
    if (!TyUnicode_Check(item)) {
        Ty_DECREF(item);
        config_dict_invalid_type(name);
        return -1;
    }
    strncpy(buf, TyUnicode_AsUTF8(item), bufsize-1);
    buf[bufsize-1] = '\0';
    Ty_DECREF(item);
    return 0;
}

static int
interp_config_from_dict(TyObject *origdict, PyInterpreterConfig *config,
                        bool missing_allowed)
{
    TyObject *dict = TyDict_New();
    if (dict == NULL) {
        return -1;
    }
    if (TyDict_Update(dict, origdict) < 0) {
        goto error;
    }

#define CHECK(NAME)                                                 \
    do {                                                            \
        if (TyErr_Occurred()) {                                     \
            goto error;                                             \
        }                                                           \
        else {                                                      \
            if (!missing_allowed) {                                 \
                (void)config_dict_get(dict, NAME);                  \
                assert(TyErr_Occurred());                           \
                goto error;                                         \
            }                                                       \
        }                                                           \
    } while (0)
#define COPY_BOOL(FIELD)                                            \
    do {                                                            \
        int flag;                                                   \
        if (_config_dict_get_bool(dict, #FIELD, &flag) < 0) {       \
            CHECK(#FIELD);                                          \
        }                                                           \
        else {                                                      \
            config->FIELD = flag;                                   \
            (void)TyDict_PopString(dict, #FIELD, NULL);             \
        }                                                           \
    } while (0)

    COPY_BOOL(use_main_obmalloc);
    COPY_BOOL(allow_fork);
    COPY_BOOL(allow_exec);
    COPY_BOOL(allow_threads);
    COPY_BOOL(allow_daemon_threads);
    COPY_BOOL(check_multi_interp_extensions);

    // PyInterpreterConfig.gil
    char buf[20];
    if (_config_dict_copy_str(dict, "gil", buf, 20) < 0) {
        CHECK("gil");
    }
    else {
        int flag;
        if (gil_flag_from_str(buf, &flag) < 0) {
            goto error;
        }
        config->gil = flag;
        (void)TyDict_PopString(dict, "gil", NULL);
    }

#undef COPY_BOOL
#undef CHECK

    Ty_ssize_t unused = TyDict_GET_SIZE(dict);
    if (unused == 1) {
        TyErr_Format(TyExc_ValueError,
                     "config dict has 1 extra item (%R)", dict);
        goto error;
    }
    else if (unused > 0) {
        TyErr_Format(TyExc_ValueError,
                     "config dict has %d extra items (%R)", unused, dict);
        goto error;
    }

    Ty_DECREF(dict);
    return 0;

error:
    Ty_DECREF(dict);
    return -1;
}

int
_PyInterpreterConfig_InitFromDict(PyInterpreterConfig *config, TyObject *dict)
{
    if (!TyDict_Check(dict)) {
        TyErr_SetString(TyExc_TypeError, "dict expected");
        return -1;
    }
    if (interp_config_from_dict(dict, config, false) < 0) {
        return -1;
    }
    return 0;
}

int
_PyInterpreterConfig_UpdateFromDict(PyInterpreterConfig *config, TyObject *dict)
{
    if (!TyDict_Check(dict)) {
        TyErr_SetString(TyExc_TypeError, "dict expected");
        return -1;
    }
    if (interp_config_from_dict(dict, config, true) < 0) {
        return -1;
    }
    return 0;
}

int
_PyInterpreterConfig_InitFromState(PyInterpreterConfig *config,
                                   TyInterpreterState *interp)
{
    // Populate the config by re-constructing the values from the interpreter.
    *config = (PyInterpreterConfig){
#define FLAG(flag) \
        (interp->feature_flags & Ty_RTFLAGS_ ## flag)
        .use_main_obmalloc = FLAG(USE_MAIN_OBMALLOC),
        .allow_fork = FLAG(FORK),
        .allow_exec = FLAG(EXEC),
        .allow_threads = FLAG(THREADS),
        .allow_daemon_threads = FLAG(DAEMON_THREADS),
        .check_multi_interp_extensions = FLAG(MULTI_INTERP_EXTENSIONS),
#undef FLAG
        .gil = interp->ceval.own_gil
            ? PyInterpreterConfig_OWN_GIL
            : PyInterpreterConfig_SHARED_GIL,
    };
    return 0;
}
