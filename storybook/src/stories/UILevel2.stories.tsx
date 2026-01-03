/**
 * UI Level 2 Package Stories
 *
 * User content area - Forums, social features, profile management
 * Green theme with user dashboards and comment systems
 */

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'

// User Avatar Component
const UserAvatar: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <div
    className="box user-avatar"
    style={{
      width: size,
      height: size,
      borderRadius: '9999px',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    }}
  />
)

// Profile Card Component
const ProfileCard: React.FC<{
  username: string
  bio: string
  email: string
}> = ({ username, bio, email }) => (
  <div className="card profile-card" style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'var(--color-card)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <UserAvatar size={48} />
      <div>
        <h3 style={{ margin: 0, fontWeight: 600 }}>{username}</h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>{email}</p>
      </div>
    </div>
    <p style={{ color: 'var(--color-foreground)' }}>{bio}</p>
  </div>
)

// Comment Item Component
const CommentItem: React.FC<{
  username: string
  content: string
  timestamp: string
}> = ({ username, content, timestamp }) => (
  <div
    className="box comment-item"
    style={{
      padding: '0.75rem',
      marginBottom: '0.75rem',
      border: '1px solid var(--color-border)',
      borderRadius: '0.375rem',
      backgroundColor: 'var(--color-background)',
      transition: 'background-color 150ms ease-in-out'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <UserAvatar size={24} />
      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{username}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{timestamp}</span>
    </div>
    <p style={{ margin: 0, fontSize: '0.875rem' }}>{content}</p>
  </div>
)

// Comment Box Component
const CommentBox: React.FC = () => (
  <div
    className="box comment-box"
    style={{
      padding: '1rem',
      marginBottom: '1.5rem',
      border: '1px solid var(--color-border)',
      borderRadius: '0.375rem',
      backgroundColor: 'var(--color-card)'
    }}
  >
    <h4 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Add a Comment</h4>
    <textarea
      placeholder="Share your thoughts..."
      style={{
        width: '100%',
        minHeight: '80px',
        padding: '0.5rem',
        border: '1px solid var(--color-input)',
        borderRadius: '0.375rem',
        fontFamily: 'inherit',
        fontSize: '0.875rem'
      }}
    />
    <button
      style={{
        marginTop: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        fontWeight: 600,
        cursor: 'pointer'
      }}
    >
      Post Comment
    </button>
  </div>
)

// User Dashboard Component
const UserDashboard: React.FC = () => (
  <section className="section user-dashboard" style={{ padding: '2rem', maxWidth: '1280px' }}>
    <h2 style={{ marginBottom: '2rem' }}>User Dashboard</h2>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
      <ProfileCard
        username="GreenUser123"
        bio="Full-stack developer passionate about open source and clean code."
        email="user@example.com"
      />
      <ProfileCard
        username="CommunityMod"
        bio="Community moderator helping users and maintaining forum quality."
        email="mod@example.com"
      />
    </div>

    <h3 style={{ marginBottom: '1rem' }}>Recent Comments</h3>
    <CommentBox />

    <div>
      <CommentItem
        username="GreenUser123"
        content="This is a great feature! Really enjoying the new Level 2 user area."
        timestamp="2 hours ago"
      />
      <CommentItem
        username="CommunityMod"
        content="Thanks for the feedback! We're constantly improving the platform."
        timestamp="1 hour ago"
      />
      <CommentItem
        username="NewUser2024"
        content="Just signed up and loving the community vibe here!"
        timestamp="30 minutes ago"
      />
    </div>
  </section>
)

// Level 2 Navigation
const Level2Nav: React.FC = () => (
  <nav
    className="nav level2-nav"
    style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--color-card)',
      borderBottom: '1px solid var(--color-border)',
      padding: '1rem 2rem'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '0.5rem',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
        }} />
        <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Level 2 Community</span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <a href="#" style={{ color: 'var(--color-foreground)', textDecoration: 'none' }}>Forum</a>
        <a href="#" style={{ color: 'var(--color-foreground)', textDecoration: 'none' }}>Profile</a>
        <UserAvatar size={32} />
      </div>
    </div>
  </nav>
)

// Meta configuration
const meta: Meta = {
  title: 'Packages/UI Level 2',
  parameters: {
    package: 'ui_level2',
    layout: 'fullscreen',
  },
}

export default meta

// Stories
type Story = StoryObj

export const Navigation: Story = {
  render: () => <Level2Nav />,
}

export const SingleProfileCard: Story = {
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <ProfileCard
        username="GreenUser123"
        bio="Full-stack developer passionate about open source and clean code."
        email="user@example.com"
      />
    </div>
  ),
}

export const CommentThread: Story = {
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <CommentBox />
      <CommentItem
        username="GreenUser123"
        content="This is a great feature! Really enjoying the new Level 2 user area."
        timestamp="2 hours ago"
      />
      <CommentItem
        username="CommunityMod"
        content="Thanks for the feedback! We're constantly improving the platform."
        timestamp="1 hour ago"
      />
    </div>
  ),
}

export const FullDashboard: Story = {
  render: () => (
    <div>
      <Level2Nav />
      <UserDashboard />
    </div>
  ),
}

export const AvatarGallery: Story = {
  render: () => (
    <div style={{ padding: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <UserAvatar size={24} />
      <UserAvatar size={32} />
      <UserAvatar size={48} />
      <UserAvatar size={64} />
      <UserAvatar size={96} />
    </div>
  ),
}
