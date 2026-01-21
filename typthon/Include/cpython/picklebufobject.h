/* PickleBuffer object. This is built-in for ease of use from third-party
 * C extensions.
 */

#ifndef Ty_PICKLEBUFOBJECT_H
#define Ty_PICKLEBUFOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_LIMITED_API

PyAPI_DATA(TyTypeObject) PyPickleBuffer_Type;

#define PyPickleBuffer_Check(op) Ty_IS_TYPE((op), &PyPickleBuffer_Type)

/* Create a PickleBuffer redirecting to the given buffer-enabled object */
PyAPI_FUNC(TyObject *) PyPickleBuffer_FromObject(TyObject *);
/* Get the PickleBuffer's underlying view to the original object
 * (NULL if released)
 */
PyAPI_FUNC(const Ty_buffer *) PyPickleBuffer_GetBuffer(TyObject *);
/* Release the PickleBuffer.  Returns 0 on success, -1 on error. */
PyAPI_FUNC(int) PyPickleBuffer_Release(TyObject *);

#endif /* !Ty_LIMITED_API */

#ifdef __cplusplus
}
#endif
#endif /* !Ty_PICKLEBUFOBJECT_H */
