import { SnippetTemplate } from '@/lib/types'

export interface TemplateSection {
  label: string
  templates: SnippetTemplate[]
}

export function buildTemplateSections(
  templates: SnippetTemplate[],
): TemplateSection[] {
  const byCategory = (cat: string) => templates.filter(t => t.category === cat)
  const byLangs = (cat: string, langs: string[]) =>
    templates.filter(t => t.category === cat && langs.includes(t.language))

  return [
    { label: 'React Components', templates: byCategory('react') },
    {
      label: 'JavaScript / TypeScript',
      templates: templates.filter(t =>
        ['api', 'basics', 'async', 'types'].includes(t.category),
      ),
    },
    { label: 'CSS Layouts', templates: byCategory('layout') },
    { label: 'Python — Project Euler', templates: byCategory('euler') },
    {
      label: 'Python — Algorithms',
      templates: byLangs('algorithms', ['Python']),
    },
    {
      label: 'Python — Interactive',
      templates: byCategory('interactive'),
    },
    {
      label: 'Go / Rust / Java / C++',
      templates: byLangs('example', ['Go', 'Rust', 'Java', 'C++']),
    },
    {
      label: 'JS / TS Examples',
      templates: byLangs('example', ['JavaScript', 'TypeScript']),
    },
    {
      label: 'Ruby / PHP / Kotlin / Swift',
      templates: byLangs('example', ['Ruby', 'PHP', 'Kotlin', 'Swift']),
    },
    {
      label: 'Scala / Haskell / Elixir / Dart',
      templates: byLangs('example', ['Scala', 'Haskell', 'Elixir', 'Dart']),
    },
    {
      label: 'R / Julia / Lua / Perl / Bash / C#',
      templates: byLangs('example', [
        'R',
        'Julia',
        'Lua',
        'Perl',
        'Bash',
        'C#',
      ]),
    },
  ]
}
