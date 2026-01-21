import { ComponentNode } from '@/types/project'

export function generateComponentCode(node: ComponentNode, indent: number = 0): string {
  const spaces = '  '.repeat(indent)
  const propsStr = Object.entries(node.props)
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`
      if (typeof value === 'boolean') return value ? key : ''
      return `${key}={${JSON.stringify(value)}}`
    })
    .filter(Boolean)
    .join(' ')

  if (node.children.length === 0) {
    return `${spaces}<${node.type}${propsStr ? ' ' + propsStr : ''} />`
  }

  let code = `${spaces}<${node.type}${propsStr ? ' ' + propsStr : ''}>\n`
  node.children.forEach((child) => {
    code += generateComponentCode(child, indent + 1) + '\n'
  })
  code += `${spaces}</${node.type}>`

  return code
}
