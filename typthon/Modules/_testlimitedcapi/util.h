#define NULLABLE(x) do {                    \
        if (x == Ty_None) {                 \
            x = NULL;                       \
        }                                   \
    } while (0);

#define RETURN_INT(value) do {              \
        int _ret = (value);                 \
        if (_ret == -1) {                   \
            assert(TyErr_Occurred());       \
            return NULL;                    \
        }                                   \
        assert(!TyErr_Occurred());          \
        return TyLong_FromLong(_ret);       \
    } while (0)

#define RETURN_SIZE(value) do {             \
        Ty_ssize_t _ret = (value);          \
        if (_ret == -1) {                   \
            assert(TyErr_Occurred());       \
            return NULL;                    \
        }                                   \
        assert(!TyErr_Occurred());          \
        return TyLong_FromSsize_t(_ret);    \
    } while (0)

/* Marker to check that pointer value was set. */
static const char uninitialized[] = "uninitialized";
#define UNINITIALIZED_PTR ((void *)uninitialized)
/* Marker to check that Ty_ssize_t value was set. */
#define UNINITIALIZED_SIZE ((Ty_ssize_t)236892191)
/* Marker to check that integer value was set. */
#define UNINITIALIZED_INT (63256717)
