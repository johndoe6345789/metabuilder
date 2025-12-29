import type { PackageTemplateConfig, ReactAppTemplateConfig } from '../../types'

export const BASE_REACT_APP_TEMPLATE_CONFIG: ReactAppTemplateConfig = {
  id: 'react_next_starter',
  name: 'Next.js Web App',
  description: 'A clean Next.js starter with app router, hero component, and typed config files.',
  rootName: 'web_app',
  tags: ['nextjs', 'react', 'web', 'starter'],
}

const socialHubComponents = [
  {
    id: 'social_hub_root',
    type: 'Stack',
    props: { className: 'flex flex-col gap-6' },
    children: [
      {
        id: 'social_hub_hero',
        type: 'Card',
        props: { className: 'p-6' },
        children: [
          {
            id: 'social_hub_heading',
            type: 'Heading',
            props: { children: 'Social Hub', level: '2', className: 'text-2xl font-bold' },
            children: [],
          },
          {
            id: 'social_hub_subtitle',
            type: 'Text',
            props: { children: 'A modern feed for creator updates, curated stories, and live moments.' },
            children: [],
          },
        ],
      },
      {
        id: 'social_hub_stats',
        type: 'Grid',
        props: { className: 'grid grid-cols-3 gap-4' },
        children: [
          {
            id: 'social_hub_stat_1',
            type: 'Card',
            props: { className: 'p-4' },
            children: [
              {
                id: 'social_hub_stat_label_1',
                type: 'Text',
                props: { children: 'Creators live', className: 'text-sm text-muted-foreground' },
                children: [],
              },
              {
                id: 'social_hub_stat_value_1',
                type: 'Heading',
                props: { children: '128', level: '3', className: 'text-xl font-semibold' },
                children: [],
              },
            ],
          },
          {
            id: 'social_hub_stat_2',
            type: 'Card',
            props: { className: 'p-4' },
            children: [
              {
                id: 'social_hub_stat_label_2',
                type: 'Text',
                props: { children: 'Trending tags', className: 'text-sm text-muted-foreground' },
                children: [],
              },
              {
                id: 'social_hub_stat_value_2',
                type: 'Heading',
                props: { children: '42', level: '3', className: 'text-xl font-semibold' },
                children: [],
              },
            ],
          },
          {
            id: 'social_hub_stat_3',
            type: 'Card',
            props: { className: 'p-4' },
            children: [
              {
                id: 'social_hub_stat_label_3',
                type: 'Text',
                props: { children: 'Live rooms', className: 'text-sm text-muted-foreground' },
                children: [],
              },
              {
                id: 'social_hub_stat_value_3',
                type: 'Heading',
                props: { children: '7', level: '3', className: 'text-xl font-semibold' },
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: 'social_hub_composer',
        type: 'Card',
        props: { className: 'p-4' },
        children: [
          {
            id: 'social_hub_composer_label',
            type: 'Label',
            props: { children: 'Share a quick update' },
            children: [],
          },
          {
            id: 'social_hub_composer_input',
            type: 'Textarea',
            props: { placeholder: 'What are you building today?', rows: 3 },
            children: [],
          },
          {
            id: 'social_hub_composer_actions',
            type: 'Flex',
            props: { className: 'flex gap-2' },
            children: [
              {
                id: 'social_hub_composer_publish',
                type: 'Button',
                props: { children: 'Publish', variant: 'default' },
                children: [],
              },
              {
                id: 'social_hub_composer_media',
                type: 'Button',
                props: { children: 'Add media', variant: 'outline' },
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: 'social_hub_feed',
        type: 'Stack',
        props: { className: 'flex flex-col gap-4' },
        children: [
          {
            id: 'social_hub_feed_post_1',
            type: 'Card',
            props: { className: 'p-5' },
            children: [
              {
                id: 'social_hub_feed_post_1_title',
                type: 'Heading',
                props: { children: 'Launch day recap', level: '3', className: 'text-lg font-semibold' },
                children: [],
              },
              {
                id: 'social_hub_feed_post_1_body',
                type: 'Text',
                props: { children: 'We shipped the new live rooms and saw a 32% boost in engagement.' },
                children: [],
              },
              {
                id: 'social_hub_feed_post_1_badge',
                type: 'Badge',
                props: { children: 'Community' },
                children: [],
              },
            ],
          },
          {
            id: 'social_hub_feed_post_2',
            type: 'Card',
            props: { className: 'p-5' },
            children: [
              {
                id: 'social_hub_feed_post_2_title',
                type: 'Heading',
                props: { children: 'Creator spotlight', level: '3', className: 'text-lg font-semibold' },
                children: [],
              },
              {
                id: 'social_hub_feed_post_2_body',
                type: 'Text',
                props: { children: 'Nova shares her workflow for livestreaming and managing subscribers.' },
                children: [],
              },
              {
                id: 'social_hub_feed_post_2_badge',
                type: 'Badge',
                props: { children: 'Spotlight', variant: 'secondary' },
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
]

const socialHubExamples = {
  feedItems: [
    {
      id: 'post_001',
      author: 'Nova',
      title: 'Launch day recap',
      summary: 'We shipped live rooms and doubled community sessions.',
      tags: ['launch', 'community'],
    },
    {
      id: 'post_002',
      author: 'Kai',
      title: 'Build log: day 42',
      summary: 'Refined the moderation pipeline and added creator scorecards.',
      tags: ['buildinpublic'],
    },
  ],
  trendingTags: ['#buildinpublic', '#metabuilder', '#live'],
  rooms: [
    { id: 'room_1', title: 'Creator Q&A', host: 'Eli', live: true },
    { id: 'room_2', title: 'Patch Notes', host: 'Nova', live: false },
  ],
}

const socialHubLuaScripts = [
  {
    fileName: 'init.lua',
    description: 'Lifecycle hooks for package installation.',
    code: 'local M = {}\\n\\nfunction M.on_install(context)\\n  return { message = "Social Hub installed", version = context.version }\\nend\\n\\nfunction M.on_uninstall()\\n  return { message = "Social Hub removed" }\\nend\\n\\nreturn M',
  },
  {
    fileName: 'permissions.lua',
    description: 'Role-based access rules for posting and moderation.',
    code: 'local Permissions = {}\\n\\nfunction Permissions.can_post(user)\\n  return user and (user.role == "user" or user.role == "admin" or user.role == "god")\\nend\\n\\nfunction Permissions.can_moderate(user)\\n  return user and (user.role == "admin" or user.role == "god" or user.role == "supergod")\\nend\\n\\nreturn Permissions',
  },
  {
    fileName: 'feed_rank.lua',
    description: 'Score feed items based on recency and engagement.',
    code: 'local FeedRank = {}\\n\\nfunction FeedRank.score(item)\\n  local freshness = item.age_minutes and (100 - item.age_minutes) or 50\\n  local engagement = (item.likes or 0) * 2 + (item.comments or 0) * 3\\n  return freshness + engagement\\nend\\n\\nreturn FeedRank',
  },
  {
    fileName: 'moderation.lua',
    description: 'Flag content for review using lightweight heuristics.',
    code: 'local Moderation = {}\\n\\nfunction Moderation.flag(content)\\n  local lowered = string.lower(content or "")\\n  if string.find(lowered, "spam") then\\n    return { flagged = true, reason = "spam_keyword" }\\n  end\\n  return { flagged = false }\\nend\\n\\nreturn Moderation',
  },
  {
    fileName: 'analytics.lua',
    description: 'Aggregate engagement signals for dashboards.',
    code: 'local Analytics = {}\\n\\nfunction Analytics.aggregate(events)\\n  local summary = { views = 0, likes = 0, comments = 0 }\\n  for _, event in ipairs(events or {}) do\\n    summary.views = summary.views + (event.views or 0)\\n    summary.likes = summary.likes + (event.likes or 0)\\n    summary.comments = summary.comments + (event.comments or 0)\\n  end\\n  return summary\\nend\\n\\nreturn Analytics',
  },
]

export const BASE_PACKAGE_TEMPLATE_CONFIGS: PackageTemplateConfig[] = [
  {
    id: 'package_social_hub',
    name: 'Social Hub Package',
    description: 'A package blueprint for social feeds, creator updates, and live rooms.',
    rootName: 'social_hub',
    packageId: 'social_hub',
    author: 'MetaBuilder',
    version: '1.0.0',
    category: 'social',
    summary: 'Modern social feed with creator tools and live rooms.',
    components: socialHubComponents,
    examples: socialHubExamples,
    luaScripts: socialHubLuaScripts,
    tags: ['package', 'social', 'feed', 'lua'],
  },
]
