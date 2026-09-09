import { describe, expect, it } from 'vitest'

import { projectFiles, projectTree, PROJECT_FOLDER } from './project-files'
import type { GodState } from '@/store/slices/god-slice'

const god = (over: Partial<GodState> = {}): GodState =>
  ({
    tree: { id: 'root', type: 'root', props: {}, children: [] },
    css: [{ id: 'c1', name: 'card', props: { padding: '8px' } }],
    workflows: {
      harbour: [
        {
          workflow: { id: 'wf1', name: 'Greeter', nodes: [], connections: [] },
          trigger: '',
          formName: '',
        },
      ],
    },
    ...over,
  }) as unknown as GodState

const file = (state: GodState, name: string) =>
  projectFiles(state, 'harbour')[`${PROJECT_FOLDER}/${name}`]

/**
 * The explorer listed three names that referred to nothing, and opening
 * one set the editor's content to the empty string -- so Nerd Mode was a
 * picture of an IDE.
 */
describe('projectFiles', () => {
  it('shows the page tree as it is stored', () => {
    const content = file(god(), 'page-tree.json').content
    expect(JSON.parse(content)).toMatchObject({ id: 'root' })
  })

  it('shows the stylesheet the site actually serves', () => {
    expect(file(god(), 'styles.css').content).toContain('padding: 8px')
  })

  it('shows the workflow open in the Workflows tab', () => {
    const content = file(god(), 'workflow.json').content
    expect(JSON.parse(content)).toMatchObject({ name: 'Greeter' })
  })

  it("shows this community's workflow, not another's", () => {
    const state = god({
      workflows: {
        harbour: [
          {
            workflow: { id: 'a', name: 'Ours', nodes: [], connections: [] },
            trigger: '',
            formName: '',
          },
        ],
        kestrel: [
          {
            workflow: { id: 'b', name: 'Theirs', nodes: [], connections: [] },
            trigger: '',
            formName: '',
          },
        ],
      },
    } as unknown as Partial<GodState>)
    expect(file(state, 'workflow.json').content).toContain('Ours')
    expect(file(state, 'workflow.json').content).not.toContain('Theirs')
  })

  it('says where to make a stylesheet when there is none', () => {
    expect(file(god({ css: [] }), 'styles.css').content).toContain(
      'Styles tab'
    )
  })

  it('says where to open a workflow when none is', () => {
    const state = god({ workflows: {} } as unknown as Partial<GodState>)
    expect(file(state, 'workflow.json').content).toContain('Workflows tab')
  })

  it('gives each file a language the editor can colour', () => {
    const files = projectFiles(god(), 'harbour')
    expect(Object.values(files).map(f => f.language).sort()).toEqual([
      'css',
      'json',
      'json',
    ])
  })
})

describe('projectTree', () => {
  it('is one folder of the three files', () => {
    const tree = projectTree(projectFiles(god(), 'harbour'))
    expect(tree).toHaveLength(1)
    expect(tree[0].name).toBe(PROJECT_FOLDER)
    expect(tree[0].children?.map(c => c.name)).toEqual([
      'page-tree.json',
      'styles.css',
      'workflow.json',
    ])
  })
})
