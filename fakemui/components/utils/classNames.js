/**
 * Utility for constructing className strings conditionally.
 * Similar to the popular 'classnames' npm package but minimal.
 *
 * @param {...(string|object|array|undefined|null|false)} args
 * @returns {string} Combined class names
 *
 * @example
 * classNames('foo', 'bar') // => 'foo bar'
 * classNames('foo', { bar: true, baz: false }) // => 'foo bar'
 * classNames(['foo', 'bar']) // => 'foo bar'
 * classNames('foo', undefined, null, false, 'bar') // => 'foo bar'
 */
export function classNames(...args) {
  const classes = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === 'string') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg);
      if (inner) classes.push(inner);
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

export default classNames;
