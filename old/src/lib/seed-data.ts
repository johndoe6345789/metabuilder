import { Database, ComponentNode, ComponentConfig } from './database'
import type { PageConfig, LuaScript, Workflow, Comment } from './level-types'
import { getPageDefinitionBuilder } from './page-definition-builder'

export async function seedDatabase() {
  const pages = await Database.getPages()
  if (pages.length > 0) {
    return
  }

  const builder = getPageDefinitionBuilder()
  await builder.initializeDefaultPages()

  const samplePages: PageConfig[] = [
    {
      id: 'page_home',
      path: '/',
      title: 'Home Page',
      level: 1,
      requiresAuth: false,
      componentTree: [],
    },
    {
      id: 'page_about',
      path: '/about',
      title: 'About Us',
      level: 1,
      requiresAuth: false,
      componentTree: [],
    },
    {
      id: 'page_dashboard',
      path: '/dashboard',
      title: 'User Dashboard',
      level: 2,
      requiresAuth: true,
      requiredRole: 'user',
      componentTree: [],
    },
    {
      id: 'page_profile',
      path: '/profile',
      title: 'User Profile',
      level: 2,
      requiresAuth: true,
      requiredRole: 'user',
      componentTree: [],
    },
    {
      id: 'page_admin_users',
      path: '/admin/users',
      title: 'User Management',
      level: 3,
      requiresAuth: true,
      requiredRole: 'admin',
      componentTree: [],
    },
    {
      id: 'page_admin_content',
      path: '/admin/content',
      title: 'Content Management',
      level: 3,
      requiresAuth: true,
      requiredRole: 'admin',
      componentTree: [],
    },
  ]

  for (const page of samplePages) {
    await Database.addPage(page)
  }

  const homePageHierarchy: ComponentNode[] = [
    {
      id: 'node_home_container',
      type: 'Container',
      childIds: ['node_home_hero', 'node_home_features', 'node_home_cta'],
      order: 0,
      pageId: 'page_home',
    },
    {
      id: 'node_home_hero',
      type: 'Stack',
      parentId: 'node_home_container',
      childIds: ['node_home_heading', 'node_home_subtitle', 'node_home_button'],
      order: 0,
      pageId: 'page_home',
    },
    {
      id: 'node_home_heading',
      type: 'Heading',
      parentId: 'node_home_hero',
      childIds: [],
      order: 0,
      pageId: 'page_home',
    },
    {
      id: 'node_home_subtitle',
      type: 'Text',
      parentId: 'node_home_hero',
      childIds: [],
      order: 1,
      pageId: 'page_home',
    },
    {
      id: 'node_home_button',
      type: 'Button',
      parentId: 'node_home_hero',
      childIds: [],
      order: 2,
      pageId: 'page_home',
    },
    {
      id: 'node_home_features',
      type: 'Grid',
      parentId: 'node_home_container',
      childIds: ['node_feature_1', 'node_feature_2', 'node_feature_3'],
      order: 1,
      pageId: 'page_home',
    },
    {
      id: 'node_feature_1',
      type: 'Card',
      parentId: 'node_home_features',
      childIds: ['node_feature_1_title', 'node_feature_1_text'],
      order: 0,
      pageId: 'page_home',
    },
    {
      id: 'node_feature_1_title',
      type: 'Heading',
      parentId: 'node_feature_1',
      childIds: [],
      order: 0,
      pageId: 'page_home',
    },
    {
      id: 'node_feature_1_text',
      type: 'Text',
      parentId: 'node_feature_1',
      childIds: [],
      order: 1,
      pageId: 'page_home',
    },
    {
      id: 'node_feature_2',
      type: 'Card',
      parentId: 'node_home_features',
      childIds: ['node_feature_2_title', 'node_feature_2_text'],
      order: 1,
      pageId: 'page_home',
    },
    {
      id: 'node_feature_2_title',
      type: 'Heading',
      parentId: 'node_feature_2',
      childIds: [],
      order: 0,
      pageId: 'page_home',
    },
    {
      id: 'node_feature_2_text',
      type: 'Text',
      parentId: 'node_feature_2',
      childIds: [],
      order: 1,
      pageId: 'page_home',
    },
    {
      id: 'node_feature_3',
      type: 'Card',
      parentId: 'node_home_features',
      childIds: ['node_feature_3_title', 'node_feature_3_text'],
      order: 2,
      pageId: 'page_home',
    },
    {
      id: 'node_feature_3_title',
      type: 'Heading',
      parentId: 'node_feature_3',
      childIds: [],
      order: 0,
      pageId: 'page_home',
    },
    {
      id: 'node_feature_3_text',
      type: 'Text',
      parentId: 'node_feature_3',
      childIds: [],
      order: 1,
      pageId: 'page_home',
    },
    {
      id: 'node_home_cta',
      type: 'Card',
      parentId: 'node_home_container',
      childIds: ['node_cta_text', 'node_cta_button'],
      order: 2,
      pageId: 'page_home',
    },
    {
      id: 'node_cta_text',
      type: 'Heading',
      parentId: 'node_home_cta',
      childIds: [],
      order: 0,
      pageId: 'page_home',
    },
    {
      id: 'node_cta_button',
      type: 'Button',
      parentId: 'node_home_cta',
      childIds: [],
      order: 1,
      pageId: 'page_home',
    },
  ]

  for (const node of homePageHierarchy) {
    await Database.addComponentNode(node)
  }

  const homePageConfigs: Record<string, ComponentConfig> = {
    node_home_container: {
      id: 'config_home_container',
      componentId: 'node_home_container',
      props: {
        className: 'max-w-6xl mx-auto p-8 space-y-16',
      },
      styles: {},
      events: {},
    },
    node_home_hero: {
      id: 'config_home_hero',
      componentId: 'node_home_hero',
      props: {
        className: 'flex flex-col items-center text-center gap-6 py-16',
      },
      styles: {},
      events: {},
    },
    node_home_heading: {
      id: 'config_home_heading',
      componentId: 'node_home_heading',
      props: {
        children: 'Welcome to MetaBuilder',
        level: '1',
        className: 'text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
      },
      styles: {},
      events: {},
    },
    node_home_subtitle: {
      id: 'config_home_subtitle',
      componentId: 'node_home_subtitle',
      props: {
        children: 'Build powerful web applications with our visual development platform',
        className: 'text-xl text-muted-foreground max-w-2xl',
      },
      styles: {},
      events: {},
    },
    node_home_button: {
      id: 'config_home_button',
      componentId: 'node_home_button',
      props: {
        children: 'Get Started',
        variant: 'default',
        size: 'lg',
      },
      styles: {},
      events: {},
    },
    node_home_features: {
      id: 'config_home_features',
      componentId: 'node_home_features',
      props: {
        className: 'grid grid-cols-1 md:grid-cols-3 gap-6',
      },
      styles: {},
      events: {},
    },
    node_feature_1: {
      id: 'config_feature_1',
      componentId: 'node_feature_1',
      props: {
        className: 'p-6 space-y-3',
      },
      styles: {},
      events: {},
    },
    node_feature_1_title: {
      id: 'config_feature_1_title',
      componentId: 'node_feature_1_title',
      props: {
        children: 'Visual Builder',
        level: '3',
        className: 'text-2xl font-semibold',
      },
      styles: {},
      events: {},
    },
    node_feature_1_text: {
      id: 'config_feature_1_text',
      componentId: 'node_feature_1_text',
      props: {
        children: 'Drag and drop components to build your application without writing code',
        className: 'text-muted-foreground',
      },
      styles: {},
      events: {},
    },
    node_feature_2: {
      id: 'config_feature_2',
      componentId: 'node_feature_2',
      props: {
        className: 'p-6 space-y-3',
      },
      styles: {},
      events: {},
    },
    node_feature_2_title: {
      id: 'config_feature_2_title',
      componentId: 'node_feature_2_title',
      props: {
        children: 'Lua Scripting',
        level: '3',
        className: 'text-2xl font-semibold',
      },
      styles: {},
      events: {},
    },
    node_feature_2_text: {
      id: 'config_feature_2_text',
      componentId: 'node_feature_2_text',
      props: {
        children: 'Extend functionality with custom Lua scripts for advanced logic',
        className: 'text-muted-foreground',
      },
      styles: {},
      events: {},
    },
    node_feature_3: {
      id: 'config_feature_3',
      componentId: 'node_feature_3',
      props: {
        className: 'p-6 space-y-3',
      },
      styles: {},
      events: {},
    },
    node_feature_3_title: {
      id: 'config_feature_3_title',
      componentId: 'node_feature_3_title',
      props: {
        children: 'Real-time Preview',
        level: '3',
        className: 'text-2xl font-semibold',
      },
      styles: {},
      events: {},
    },
    node_feature_3_text: {
      id: 'config_feature_3_text',
      componentId: 'node_feature_3_text',
      props: {
        children: 'See your changes instantly with live preview across all application levels',
        className: 'text-muted-foreground',
      },
      styles: {},
      events: {},
    },
    node_home_cta: {
      id: 'config_home_cta',
      componentId: 'node_home_cta',
      props: {
        className: 'p-12 text-center space-y-6 bg-gradient-to-br from-primary/10 to-accent/10',
      },
      styles: {},
      events: {},
    },
    node_cta_text: {
      id: 'config_cta_text',
      componentId: 'node_cta_text',
      props: {
        children: 'Ready to start building?',
        level: '2',
        className: 'text-3xl font-bold',
      },
      styles: {},
      events: {},
    },
    node_cta_button: {
      id: 'config_cta_button',
      componentId: 'node_cta_button',
      props: {
        children: 'Create Your First App',
        variant: 'default',
        size: 'lg',
      },
      styles: {},
      events: {},
    },
  }

  const allConfigs = await Database.getComponentConfigs()
  for (const [nodeId, config] of Object.entries(homePageConfigs)) {
    allConfigs[nodeId] = config
  }
  await Database.setComponentConfigs(allConfigs)

  const dashboardHierarchy: ComponentNode[] = [
    {
      id: 'node_dash_container',
      type: 'Container',
      childIds: ['node_dash_header', 'node_dash_content'],
      order: 0,
      pageId: 'page_dashboard',
    },
    {
      id: 'node_dash_header',
      type: 'Flex',
      parentId: 'node_dash_container',
      childIds: ['node_dash_title', 'node_dash_badge'],
      order: 0,
      pageId: 'page_dashboard',
    },
    {
      id: 'node_dash_title',
      type: 'Heading',
      parentId: 'node_dash_header',
      childIds: [],
      order: 0,
      pageId: 'page_dashboard',
    },
    {
      id: 'node_dash_badge',
      type: 'Badge',
      parentId: 'node_dash_header',
      childIds: [],
      order: 1,
      pageId: 'page_dashboard',
    },
    {
      id: 'node_dash_content',
      type: 'Grid',
      parentId: 'node_dash_container',
      childIds: ['node_dash_card1', 'node_dash_card2'],
      order: 1,
      pageId: 'page_dashboard',
    },
    {
      id: 'node_dash_card1',
      type: 'Card',
      parentId: 'node_dash_content',
      childIds: ['node_dash_card1_title', 'node_dash_card1_text'],
      order: 0,
      pageId: 'page_dashboard',
    },
    {
      id: 'node_dash_card1_title',
      type: 'Heading',
      parentId: 'node_dash_card1',
      childIds: [],
      order: 0,
      pageId: 'page_dashboard',
    },
    {
      id: 'node_dash_card1_text',
      type: 'Text',
      parentId: 'node_dash_card1',
      childIds: [],
      order: 1,
      pageId: 'page_dashboard',
    },
    {
      id: 'node_dash_card2',
      type: 'Card',
      parentId: 'node_dash_content',
      childIds: ['node_dash_card2_title', 'node_dash_card2_progress'],
      order: 1,
      pageId: 'page_dashboard',
    },
    {
      id: 'node_dash_card2_title',
      type: 'Heading',
      parentId: 'node_dash_card2',
      childIds: [],
      order: 0,
      pageId: 'page_dashboard',
    },
    {
      id: 'node_dash_card2_progress',
      type: 'Progress',
      parentId: 'node_dash_card2',
      childIds: [],
      order: 1,
      pageId: 'page_dashboard',
    },
  ]

  for (const node of dashboardHierarchy) {
    await Database.addComponentNode(node)
  }

  const dashboardConfigs: Record<string, ComponentConfig> = {
    node_dash_container: {
      id: 'config_dash_container',
      componentId: 'node_dash_container',
      props: { className: 'max-w-6xl mx-auto p-8 space-y-8' },
      styles: {},
      events: {},
    },
    node_dash_header: {
      id: 'config_dash_header',
      componentId: 'node_dash_header',
      props: { className: 'flex items-center justify-between' },
      styles: {},
      events: {},
    },
    node_dash_title: {
      id: 'config_dash_title',
      componentId: 'node_dash_title',
      props: { children: 'Dashboard', level: '1', className: 'text-4xl font-bold' },
      styles: {},
      events: {},
    },
    node_dash_badge: {
      id: 'config_dash_badge',
      componentId: 'node_dash_badge',
      props: { children: 'Active', variant: 'default' },
      styles: {},
      events: {},
    },
    node_dash_content: {
      id: 'config_dash_content',
      componentId: 'node_dash_content',
      props: { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
      styles: {},
      events: {},
    },
    node_dash_card1: {
      id: 'config_dash_card1',
      componentId: 'node_dash_card1',
      props: { className: 'p-6 space-y-4' },
      styles: {},
      events: {},
    },
    node_dash_card1_title: {
      id: 'config_dash_card1_title',
      componentId: 'node_dash_card1_title',
      props: { children: 'Welcome Back!', level: '3', className: 'text-xl font-semibold' },
      styles: {},
      events: {},
    },
    node_dash_card1_text: {
      id: 'config_dash_card1_text',
      componentId: 'node_dash_card1_text',
      props: { children: 'You have access to all user features and your personal dashboard.' },
      styles: {},
      events: {},
    },
    node_dash_card2: {
      id: 'config_dash_card2',
      componentId: 'node_dash_card2',
      props: { className: 'p-6 space-y-4' },
      styles: {},
      events: {},
    },
    node_dash_card2_title: {
      id: 'config_dash_card2_title',
      componentId: 'node_dash_card2_title',
      props: { children: 'Profile Completion', level: '3', className: 'text-xl font-semibold' },
      styles: {},
      events: {},
    },
    node_dash_card2_progress: {
      id: 'config_dash_card2_progress',
      componentId: 'node_dash_card2_progress',
      props: { value: 75 },
      styles: {},
      events: {},
    },
  }

  const allConfigsUpdated = await Database.getComponentConfigs()
  for (const [nodeId, config] of Object.entries(dashboardConfigs)) {
    allConfigsUpdated[nodeId] = config
  }
  await Database.setComponentConfigs(allConfigsUpdated)

  const sampleLuaScripts: LuaScript[] = [
    {
      id: 'lua_validate_email',
      name: 'Validate Email',
      description: 'Check if email format is valid',
      code: `function validate_email(email)
  local pattern = "^[%w%._%+-]+@[%w%._%+-]+%.[%a]+$"
  return email:match(pattern) ~= nil
end

return validate_email(...)`,
      parameters: [{ name: 'email', type: 'string' }],
      returnType: 'boolean',
    },
    {
      id: 'lua_calculate_discount',
      name: 'Calculate Discount',
      description: 'Calculate discounted price',
      code: `function calculate_discount(price, discount_percent)
  return price * (1 - discount_percent / 100)
end

return calculate_discount(...)`,
      parameters: [
        { name: 'price', type: 'number' },
        { name: 'discount_percent', type: 'number' },
      ],
      returnType: 'number',
    },
  ]

  for (const script of sampleLuaScripts) {
    await Database.addLuaScript(script)
  }

  const sampleComments: Comment[] = [
    {
      id: 'comment_1',
      userId: 'user_demo',
      content: 'This is a great platform! Looking forward to building something amazing.',
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'comment_2',
      userId: 'user_admin',
      content: 'Welcome! Feel free to explore all the features.',
      createdAt: Date.now() - 43200000,
    },
  ]

  for (const comment of sampleComments) {
    await Database.addComment(comment)
  }
}
