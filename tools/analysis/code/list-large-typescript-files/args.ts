import path from 'path'

import { DEFAULT_IGNORE, Options, usage } from './types'

const extendIgnore = (options: Options, commaSeparated?: string) => {
  const extra = (commaSeparated ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  extra.forEach((entry) => options.ignore.add(entry))
}

export const parseArgs = (): Options => {
  const args = process.argv.slice(2)
  const options: Options = {
    root: process.cwd(),
    maxLines: 150,
    ignore: new Set(DEFAULT_IGNORE),
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    switch (arg) {
      case '--root':
        options.root = path.resolve(args[i + 1] ?? '.')
        i += 1
        break
      case '--max-lines':
        options.maxLines = Number(args[i + 1] ?? options.maxLines)
        i += 1
        break
      case '--out':
        options.outFile = args[i + 1]
        i += 1
        break
      case '--ignore':
        extendIgnore(options, args[i + 1])
        i += 1
        break
      case '--help':
        console.log(usage)
        process.exit(0)
      default:
        if (arg.startsWith('--')) {
          console.warn(`Unknown option: ${arg}`)
        }
    }
  }

  return options
}
