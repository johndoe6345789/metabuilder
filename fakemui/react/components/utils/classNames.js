/**
 * Utility function to combine class names conditionally
 * Similar to the 'clsx' or 'classnames' npm packages
 */
export function classNames(...args) {
  const classes = []

  args.forEach((arg) => {
    if (!arg) return

    const argType = typeof arg

    if (argType === 'string' || argType === 'number') {
      classes.push(arg)
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        const inner = classNames(...arg)
        if (inner) {
          classes.push(inner)
        }
      }
    } else if (argType === 'object') {
      if (arg.toString !== Object.prototype.toString) {
        classes.push(arg.toString())
      } else {
        Object.entries(arg).forEach(([key, value]) => {
          if (value) {
            classes.push(key)
          }
        })
      }
    }
  })

  return classes.join(' ')
}

export default classNames
