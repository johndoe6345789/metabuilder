import { StorybookStory } from '@/types/project'

export function generateStorybookStories(stories: StorybookStory[]): Record<string, string> {
  const fileMap: Record<string, StorybookStory[]> = {}

  stories.forEach(story => {
    const key = `${story.category}/${story.componentName}`
    if (!fileMap[key]) {
      fileMap[key] = []
    }
    fileMap[key].push(story)
  })

  const files: Record<string, string> = {}

  Object.entries(fileMap).forEach(([path, storyList]) => {
    const componentName = storyList[0].componentName
    let code = `import type { Meta, StoryObj } from '@storybook/react'\nimport { ${componentName} } from '@/components/${componentName}'\n\n`

    code += `const meta: Meta<typeof ${componentName}> = {\n`
    code += `  title: '${path}',\n`
    code += `  component: ${componentName},\n`
    code += `  tags: ['autodocs'],\n`
    code += `}\n\n`
    code += `export default meta\n`
    code += `type Story = StoryObj<typeof ${componentName}>\n\n`

    storyList.forEach(story => {
      code += `export const ${story.storyName.replace(/\s+/g, '')}: Story = {\n`
      if (Object.keys(story.args).length > 0) {
        code += `  args: ${JSON.stringify(story.args, null, 4).replace(/"/g, "'")},\n`
      }
      code += `}\n\n`
    })

    files[`src/stories/${componentName}.stories.tsx`] = code
  })

  return files
}
