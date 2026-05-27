/**
 * navigationGroups — sidebar navigation group definitions.
 */
import { icons } from './navigation-tab-info-a'
import {
  NavigationItemData,
  NavigationGroup,
} from './navigation-groups-types'
const { ChartBar, Code, Database, Tree, FlowArrow,
  PaintBrush, Flask, Play, BookOpen, Cube, Wrench,
  FileText, Gear, DeviceMobile, Image, Faders,
  Lightbulb, PencilRuler } = icons
const mk = (I: React.ElementType): React.ReactNode =>
  <I size={18} />

const it = (
  id: string,
  label: string,
  icon: React.ReactNode,
  featureKey?: NavigationItemData['featureKey'],
): NavigationItemData => ({ id, label, icon,
  value: id, ...(featureKey ? { featureKey } : {}) })

export const navigationGroups: NavigationGroup[] = [
  { id: 'overview', label: 'Overview',
    items: [it('dashboard', 'Dashboard', mk(ChartBar))] },
  { id: 'development', label: 'Development',
    items: [
      it('code', 'Code Editor', mk(Code), 'codeEditor'),
      it('models', 'Models', mk(Database), 'models'),
      it('components', 'Components', mk(Tree), 'components'),
      it('component-trees', 'Component Trees',
        mk(Tree), 'componentTrees'),
    ] },
  { id: 'automation', label: 'Automation',
    items: [
      it('workflows', 'Workflows',
        mk(FlowArrow), 'workflows'),
      it('lambdas', 'Lambdas', mk(Code), 'lambdas'),
    ] },
  { id: 'design', label: 'Design & Styling',
    items: [
      it('styling', 'Styling', mk(PaintBrush), 'styling'),
      it('sass', 'Sass Styles', mk(PaintBrush), 'sassStyles'),
      it('favicon', 'Favicon Designer',
        mk(Image), 'faviconDesigner'),
      it('ideas', 'Feature Ideas', mk(Lightbulb), 'ideaCloud'),
      it('schema-editor', 'Schema Editor',
        mk(PencilRuler), 'schemaEditor'),
      it('json-ui', 'JSON UI', mk(Code)),
    ] },
  { id: 'backend', label: 'Backend',
    items: [
      it('flask', 'Flask API', mk(Flask), 'flaskApi'),
    ] },
  { id: 'testing', label: 'Testing',
    items: [
      it('playwright', 'Playwright', mk(Play), 'playwright'),
      it('storybook', 'Storybook',
        mk(BookOpen), 'storybook'),
      it('unit-tests', 'Unit Tests',
        mk(Cube), 'unitTests'),
    ] },
  { id: 'tools', label: 'Tools & Configuration',
    items: [
      it('errors', 'Error Repair',
        mk(Wrench), 'errorRepair'),
      it('docs', 'Documentation',
        mk(FileText), 'documentation'),
      it('json-conversion-showcase',
        'JSON Conversion Showcase', mk(BookOpen)),
      it('settings', 'Settings', mk(Gear)),
      it('pwa', 'PWA', mk(DeviceMobile)),
      it('features', 'Features', mk(Faders)),
    ] },
]
