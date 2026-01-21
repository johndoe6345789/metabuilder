
static inline int
_config_dict_get(TyObject *dict, const char *name, TyObject **p_item)
{
    TyObject *item;
    if (TyDict_GetItemStringRef(dict, name, &item) < 0) {
        return -1;
    }
    if (item == NULL) {
        // We do not set an exception.
        return -1;
    }
    *p_item = item;
    return 0;
}


static TyObject*
config_dict_get(TyObject *dict, const char *name)
{
    TyObject *item;
    if (_config_dict_get(dict, name, &item) < 0) {
        if (!TyErr_Occurred()) {
            TyErr_Format(TyExc_ValueError, "missing config key: %s", name);
        }
        return NULL;
    }
    return item;
}


static void
config_dict_invalid_type(const char *name)
{
    TyErr_Format(TyExc_TypeError, "invalid config type: %s", name);
}
