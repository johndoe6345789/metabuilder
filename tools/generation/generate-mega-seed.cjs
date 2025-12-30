#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const categories = [
  { id: 'cat_launch', name: 'Launch Radar', description: 'Product drops and milestone updates' },
  { id: 'cat_growth', name: 'Growth Ops', description: 'Retention, onboarding, and community tactics' },
  { id: 'cat_design', name: 'Design Systems', description: 'Tokens, theming, and UI governance' },
  { id: 'cat_ai', name: 'AI Tooling', description: 'Prompt playbooks, evals, and guardrails' },
  { id: 'cat_ops', name: 'Community Ops', description: 'Moderation workflows and engagement rituals' },
  { id: 'cat_hiring', name: 'Hiring & Ops', description: 'Team growth, planning, and operating cadence' },
  { id: 'cat_funding', name: 'Funding Desk', description: 'Rounds, terms, and investor updates' },
  { id: 'cat_culture', name: 'Culture Lab', description: 'Rituals, values, and remote collaboration' },
  { id: 'cat_docs', name: 'Docs Guild', description: 'Documentation standards and knowledge bases' },
  { id: 'cat_security', name: 'Security Flight', description: 'Threat modeling and incident response' },
]

const titles = [
  'First 1000 users playbook',
  'Launch checklist for indie teams',
  'Building a tokenized design system',
  'How to measure community health',
  'Prompt playbooks for onboarding',
  'Moderation handoff checklists',
  'Hiring your first community lead',
  'Feature flag cadence for launches',
  'Post-launch retrospectives that actually work',
  'Creator pipelines and content calendars',
  'How we scaled support without burnout',
  'Founder updates cadence for investors',
  'Red teaming your onboarding flow',
  'From doc chaos to a unified handbook',
  'Battle-tested incident comms templates',
  'What to automate in week one',
  'Designing for multi-tenant UX',
  'What metrics matter in community programs',
  'Building an experimentation runway',
  'On-call rotations for small teams',
]

const threads = titles.map((title, index) => {
  const category = categories[index % categories.length]
  return {
    id: `thread_${index + 1}`,
    title,
    categoryId: category.id,
    replyCount: 12 + (index * 7) % 120,
    likeCount: 20 + (index * 11) % 240,
  }
})

const payload = {
  generatedAt: new Date().toISOString(),
  examples: {
    categories,
    threads,
  },
}

const outputPath = path.join(__dirname, '..', 'packages', 'forum_forge', 'static_content', 'examples.json')
fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n')

console.log(`Wrote ${outputPath} with ${categories.length} categories and ${threads.length} threads`)
