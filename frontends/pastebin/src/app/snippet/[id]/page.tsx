'use client'

import { useRouter } from 'next/navigation'
import { PageLayout } from '@/app/PageLayout'
import { LANGUAGE_COLORS, appConfig } from '@/lib/config'
import { useSnippetViewPage, getFilename } from './hooks/useSnippetViewPage'
import { buildCommands } from './snippetCommands'
import { SnippetPageBody } from './SnippetPageBody'
import styles from './snippet-view-page.module.scss'

export default function SnippetViewPage() {
  const router = useRouter()
  const vm = useSnippetViewPage()
  const {
    snippet,
    namespaces,
    activeFile,
    localCode,
    snippetRef,
    activeFileRef,
    filesRef,
  } = vm

  if (!snippet) {
    return (
      <PageLayout>
        <div className={styles.loading}>Loading…</div>
      </PageLayout>
    )
  }

  const filename = getFilename(snippet.title, snippet.language)
  const namespace = namespaces.find(n => n.id === snippet.namespaceId)
  const langBgClass = (
    LANGUAGE_COLORS[snippet.language] || LANGUAGE_COLORS['Other']
  ).split(' ')[0]
  const files = snippet.files?.length
    ? snippet.files
    : [{ name: filename, content: snippet.code }]
  const activeFileObj = files.find(f => f.name === activeFile) ?? files[0]
  const activeCode = activeFileObj?.content ?? snippet.code
  const lineCount = (localCode ?? activeCode).split('\n').length

  // eslint-disable-next-line react-hooks/refs
  snippetRef.current = snippet
  // eslint-disable-next-line react-hooks/refs
  activeFileRef.current = activeFile || (files[0]?.name ?? '')
  // eslint-disable-next-line react-hooks/refs
  filesRef.current = files

  const viewSnippet = { ...snippet, code: localCode ?? activeCode }
  const isEntryFile =
    !activeFile || activeFile === (snippet.entryPoint ?? files[0]?.name)
  const canPreview = !!(
    isEntryFile &&
    snippet.hasPreview &&
    appConfig.previewEnabledLanguages.includes(snippet.language)
  )
  const commands = buildCommands({
    vm,
    snippet,
    activeFile,
    activeCode,
    files,
    canPreview,
    onBack: () => router.push('/'),
  })
  const onCommitNewFile = () =>
    vm.commitNewFile(files, filename).then(n => {
      if (n) {
        vm.setActiveFile(n)
        vm.setActiveTab('code')
      }
    })

  return (
    <PageLayout fitViewport>
      <SnippetPageBody
        vm={vm}
        onBack={() => router.push('/')}
        filename={filename}
        files={files}
        activeCode={activeCode}
        viewSnippet={viewSnippet}
        canPreview={canPreview}
        lineCount={lineCount}
        namespace={namespace}
        langBgClass={langBgClass}
        commands={commands}
        onCommitNewFile={onCommitNewFile}
      />
    </PageLayout>
  )
}
