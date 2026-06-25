import type { TechStack } from './hooks/useSiteGenerator'

const STACK_INSTRUCTIONS: Record<TechStack, string> = {
  html:
    'Generate a single-page website using plain HTML, ' +
    'CSS, and vanilla JavaScript. ' +
    'Output files: index.html, styles.css, and ' +
    'optionally script.js. Use modern CSS ' +
    '(custom properties, flexbox/grid). ' +
    'No build step required.',
  react:
    'Generate a React application using Vite. ' +
    'Output files: package.json, vite.config.js, ' +
    'index.html, src/main.jsx, src/App.jsx, and ' +
    'component files in src/components/. ' +
    'Use functional components with hooks. ' +
    'Include inline styles or Tailwind via CDN.',
  nextjs:
    'Generate a Next.js 14 application using the ' +
    'App Router. Output files: package.json, ' +
    'next.config.js, app/layout.tsx, app/page.tsx, ' +
    'and supporting files. Use TypeScript. Include ' +
    'Tailwind CSS. Use Server Components by default.',
}

export function buildPrompt(
  description: string,
  stack: TechStack
): string {
  return (
    'You are a senior web developer. Generate a ' +
    'complete website based on this description:\n\n' +
    `"${description}"\n\n` +
    `${STACK_INSTRUCTIONS[stack]}\n\n` +
    'IMPORTANT: Respond with ONLY valid JSON — ' +
    'no markdown fences, no explanation outside JSON.\n\n' +
    'JSON format:\n' +
    '{\n' +
    '  "description": "one sentence describing what ' +
    'was built",\n' +
    '  "files": [\n' +
    '    { "name": "path/to/file.ext",\n' +
    '      "content": "full file content here" }\n' +
    '  ]\n' +
    '}\n\n' +
    'Requirements:\n' +
    '- Generate ALL files needed to run the site\n' +
    '- Each file must be complete and production-ready\n' +
    '- Use modern best practices\n' +
    '- Make the design polished and professional\n' +
    '- Include realistic placeholder content matching\n' +
    '  the site description'
  )
}
