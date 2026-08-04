'use client'

import { useConsoleState } from './hooks/useConsoleState'
import { LoginScreen } from './components/LoginScreen'
import { ModeBar } from './components/ModeBar'
import { CliPanel } from './components/CliPanel'
import { GuiPanel } from './components/GuiPanel'
import { ResponsePanel } from './components/ResponsePanel'
import { HistorySidebar } from './components/HistorySidebar'
import styles from './QueryConsole.module.scss'

export function QueryConsole() {
  const {
    mode, setMode, cliInput, setCliInput, cliRef,
    auth, hist, gui, exec,
    focusCli, handleHistorySelect,
    handleExecuteGui, handleExecuteCli,
  } = useConsoleState()

  if (auth.loading) {
    return null
  }

  if (!auth.authed) {
    return (
      <LoginScreen
        onLogin={auth.handleLogin}
        error={auth.error}
        onClearError={auth.clearError}
      />
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.layout}>
        <div className={styles.main}>
          <ModeBar
            mode={mode}
            onCli={focusCli}
            onGui={() => setMode('gui')}
            onDisconnect={auth.handleLogout}
          />
          {mode === 'cli' && (
            <CliPanel
              cliInput={cliInput} loading={exec.loading}
              cliRef={cliRef} onInputChange={setCliInput}
              onRun={handleExecuteCli}
            />
          )}
          {mode === 'gui' && (
            <GuiPanel
              method={gui.method} tenant={gui.tenant}
              pkg={gui.pkg} entity={gui.entity}
              entityId={gui.entityId} queryParams={gui.queryParams}
              body={gui.body} loading={exec.loading}
              pathPreview={gui.buildPath()}
              onMethodChange={gui.setMethod}
              onTenantChange={gui.setTenant}
              onPkgChange={gui.setPkg}
              onEntityChange={gui.setEntity}
              onEntityIdChange={gui.setEntityId}
              onQueryParamsChange={gui.setQueryParams}
              onBodyChange={gui.setBody}
              onExecute={handleExecuteGui}
            />
          )}
          <ResponsePanel
            loading={exec.loading}
            response={exec.response}
          />
        </div>
        <HistorySidebar
          history={hist.history}
          onSelect={handleHistorySelect}
          onClear={hist.clearHistory}
        />
      </div>
    </div>
  )
}
