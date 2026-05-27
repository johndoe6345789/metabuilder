import { MaterialIcon } from '@metabuilder/components/fakemui'
import type { Mode } from './hooks/useLoginPage'
import pkg from '../../../package.json'
import styles from './login.module.scss'

const FEATURES = [
  { icon: 'code', label: 'Multi-language syntax highlighting' },
  { icon: 'folder_special', label: 'Smart namespace organisation' },
  { icon: 'terminal', label: 'Live Python runner' },
  { icon: 'auto_awesome', label: 'AI-powered error analysis' },
]

interface LoginBrandPanelProps {
  mode: Mode
}

export function LoginBrandPanel({ mode }: LoginBrandPanelProps) {
  return (
    <div className={styles.brand}>
      <div className={styles.brandTop}>
        <div className={styles.brandLogo}>
          <div className={styles.brandIconWrap}>
            <MaterialIcon name="code" />
          </div>
          <span className={styles.brandName}>CodeSnippet</span>
        </div>

        <h2 className={styles.brandHeadline}>
          {mode === 'signin' ? 'Welcome\nback.' : 'Start building\ntoday.'}
        </h2>
        <p className={styles.brandSub}>
          {mode === 'signin'
            ? 'Sign in to access your snippets, namespaces and tools.'
            : 'Create a free account and start organising your code.'}
        </p>

        <ul className={styles.features}>
          {FEATURES.map(f => (
            <li key={f.icon} className={styles.featureItem}>
              <MaterialIcon
                name={f.icon}
                className={styles.featureIcon}
              />
              {f.label}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.codeWindow}>
        <div className={styles.codeChrome}>
          <span /><span /><span />
          <span className={styles.codeFile}>snippet.ts</span>
        </div>
        <pre className={styles.codePre}>
          <span className={styles.cm}>
            {'// Smart snippet manager'}
          </span>
          {'\n'}
          <span className={styles.kw}>{'const'}</span>
          {' snippet '}
          <span className={styles.op}>{'='}</span>
          {' {\n'}
          {'  title: '}
          <span className={styles.str}>{'"Hello World"'}</span>
          {',\n'}
          {'  lang:  '}
          <span className={styles.str}>{'"typescript"'}</span>
          {',\n'}
          {'  tags:  ['}
          <span className={styles.str}>{'"api"'}</span>
          {', '}
          <span className={styles.str}>{'"utils"'}</span>
          {'],\n'}
          {'  '}
          <span className={styles.fn}>{'run'}</span>
          <span className={styles.op}>{'()'}</span>
          {' '}
          <span className={styles.op}>{'{'}</span>
          {'\n'}
          {'    '}
          <span className={styles.kw}>{'await'}</span>
          {' '}
          <span className={styles.fn}>{'execute'}</span>
          <span className={styles.op}>{'()'}</span>
          {'\n'}
          {'  '}
          <span className={styles.op}>{'}'}</span>
          {'\n'}
          {'}'}
        </pre>
      </div>

      <p className={styles.brandBottom}>
        CodeSnippet · v{pkg.version}
      </p>
    </div>
  )
}
