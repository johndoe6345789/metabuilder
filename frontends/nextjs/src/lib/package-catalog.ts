import type { PackageManifest, PackageContent } from './package-types'

export const PACKAGE_CATALOG: Record<string, { manifest: PackageManifest; content: PackageContent }> = {
  'forum-classic': {
    manifest: {
      id: 'forum-classic',
      name: 'Classic Forum',
      version: '1.0.0',
      description: 'Full-featured discussion forum with threads, categories, user profiles, and moderation tools. Perfect for building community discussions.',
      author: 'MetaBuilder Team',
      category: 'social',
      icon: '💬',
      screenshots: [],
      tags: ['forum', 'discussion', 'community', 'threads'],
      dependencies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 1247,
      rating: 4.7,
      installed: false,
    },
    content: {
      schemas: [
        {
          name: 'ForumCategory',
          displayName: 'Forum Category',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'name', type: 'string', label: 'Category Name', required: true },
            { name: 'description', type: 'text', label: 'Description', required: false },
            { name: 'order', type: 'number', label: 'Display Order', required: true, defaultValue: 0 },
            { name: 'icon', type: 'string', label: 'Icon', required: false },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'ForumThread',
          displayName: 'Forum Thread',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'categoryId', type: 'string', label: 'Category ID', required: true },
            { name: 'title', type: 'string', label: 'Thread Title', required: true },
            { name: 'authorId', type: 'string', label: 'Author ID', required: true },
            { name: 'content', type: 'text', label: 'Content', required: true },
            { name: 'isPinned', type: 'boolean', label: 'Pinned', required: false, defaultValue: false },
            { name: 'isLocked', type: 'boolean', label: 'Locked', required: false, defaultValue: false },
            { name: 'views', type: 'number', label: 'View Count', required: true, defaultValue: 0 },
            { name: 'replyCount', type: 'number', label: 'Reply Count', required: true, defaultValue: 0 },
            { name: 'lastReplyAt', type: 'number', label: 'Last Reply At', required: false },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
            { name: 'updatedAt', type: 'number', label: 'Updated At', required: false },
          ],
        },
        {
          name: 'ForumPost',
          displayName: 'Forum Post',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'threadId', type: 'string', label: 'Thread ID', required: true },
            { name: 'authorId', type: 'string', label: 'Author ID', required: true },
            { name: 'content', type: 'text', label: 'Content', required: true },
            { name: 'likes', type: 'number', label: 'Like Count', required: true, defaultValue: 0 },
            { name: 'isEdited', type: 'boolean', label: 'Edited', required: false, defaultValue: false },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
            { name: 'updatedAt', type: 'number', label: 'Updated At', required: false },
          ],
        },
      ],
      pages: [
        {
          id: 'page_forum_home',
          path: '/forum',
          title: 'Forum Home',
          level: 2,
          componentTree: [],
          requiresAuth: true,
          requiredRole: 'user',
        },
        {
          id: 'page_forum_category',
          path: '/forum/category/:id',
          title: 'Forum Category',
          level: 2,
          componentTree: [],
          requiresAuth: true,
          requiredRole: 'user',
        },
        {
          id: 'page_forum_thread',
          path: '/forum/thread/:id',
          title: 'Forum Thread',
          level: 2,
          componentTree: [],
          requiresAuth: true,
          requiredRole: 'user',
        },
      ],
      workflows: [
        {
          id: 'workflow_create_thread',
          name: 'Create Forum Thread',
          description: 'Workflow for creating a new forum thread',
          nodes: [],
          edges: [],
          enabled: true,
        },
        {
          id: 'workflow_post_reply',
          name: 'Post Forum Reply',
          description: 'Workflow for posting a reply to a thread',
          nodes: [],
          edges: [],
          enabled: true,
        },
      ],
      luaScripts: [
        {
          id: 'lua_forum_thread_count',
          name: 'Get Thread Count',
          description: 'Count threads in a category',
          code: 'function countThreads(categoryId)\n  return 0\nend\nreturn countThreads',
          parameters: [{ name: 'categoryId', type: 'string' }],
          returnType: 'number',
        },
      ],
      componentHierarchy: {},
      componentConfigs: {},
      seedData: {
        ForumCategory: [
          { id: 'cat_1', name: 'General Discussion', description: 'Talk about anything', order: 1, icon: '💭', createdAt: Date.now() },
          { id: 'cat_2', name: 'Announcements', description: 'Official announcements', order: 0, icon: '📢', createdAt: Date.now() },
        ],
      },
    },
  },
  'guestbook-retro': {
    manifest: {
      id: 'guestbook-retro',
      name: 'Retro Guestbook',
      version: '1.0.0',
      description: 'Nostalgic 90s-style guestbook with animated GIFs, custom backgrounds, and visitor messages. Perfect for retro-themed websites.',
      author: 'MetaBuilder Team',
      category: 'content',
      icon: '📖',
      screenshots: [],
      tags: ['guestbook', 'retro', '90s', 'nostalgia'],
      dependencies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 892,
      rating: 4.5,
      installed: false,
    },
    content: {
      schemas: [
        {
          name: 'GuestbookEntry',
          displayName: 'Guestbook Entry',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'authorName', type: 'string', label: 'Name', required: true },
            { name: 'authorEmail', type: 'string', label: 'Email', required: false },
            { name: 'authorWebsite', type: 'string', label: 'Website', required: false },
            { name: 'message', type: 'text', label: 'Message', required: true },
            { name: 'backgroundColor', type: 'string', label: 'Background Color', required: false },
            { name: 'textColor', type: 'string', label: 'Text Color', required: false },
            { name: 'gifUrl', type: 'string', label: 'GIF URL', required: false },
            { name: 'approved', type: 'boolean', label: 'Approved', required: true, defaultValue: false },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
      ],
      pages: [
        {
          id: 'page_guestbook',
          path: '/guestbook',
          title: 'Guestbook',
          level: 1,
          componentTree: [],
          requiresAuth: false,
        },
      ],
      workflows: [],
      luaScripts: [],
      componentHierarchy: {},
      componentConfigs: {},
      seedData: {
        GuestbookEntry: [
          { 
            id: 'entry_1', 
            authorName: 'WebMaster99', 
            authorWebsite: 'http://coolsite.net',
            message: 'Cool site! Check out mine too!', 
            backgroundColor: '#FF00FF',
            textColor: '#00FF00',
            approved: true,
            createdAt: Date.now() - 86400000 
          },
        ],
      },
    },
  },
  'youtube-clone': {
    manifest: {
      id: 'youtube-clone',
      name: 'Video Platform',
      version: '1.0.0',
      description: 'Complete video sharing platform with upload, streaming, comments, likes, subscriptions, and playlists. Build your own YouTube!',
      author: 'MetaBuilder Team',
      category: 'entertainment',
      icon: '🎥',
      screenshots: [],
      tags: ['video', 'streaming', 'media', 'youtube'],
      dependencies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 2156,
      rating: 4.8,
      installed: false,
    },
    content: {
      schemas: [
        {
          name: 'Video',
          displayName: 'Video',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'description', type: 'text', label: 'Description', required: false },
            { name: 'uploaderId', type: 'string', label: 'Uploader ID', required: true },
            { name: 'videoUrl', type: 'string', label: 'Video URL', required: true },
            { name: 'thumbnailUrl', type: 'string', label: 'Thumbnail URL', required: false },
            { name: 'duration', type: 'number', label: 'Duration (seconds)', required: true },
            { name: 'views', type: 'number', label: 'Views', required: true, defaultValue: 0 },
            { name: 'likes', type: 'number', label: 'Likes', required: true, defaultValue: 0 },
            { name: 'dislikes', type: 'number', label: 'Dislikes', required: true, defaultValue: 0 },
            { name: 'category', type: 'string', label: 'Category', required: false },
            { name: 'tags', type: 'json', label: 'Tags', required: false },
            { name: 'published', type: 'boolean', label: 'Published', required: true, defaultValue: false },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'VideoComment',
          displayName: 'Video Comment',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'videoId', type: 'string', label: 'Video ID', required: true },
            { name: 'userId', type: 'string', label: 'User ID', required: true },
            { name: 'content', type: 'text', label: 'Content', required: true },
            { name: 'likes', type: 'number', label: 'Likes', required: true, defaultValue: 0 },
            { name: 'parentId', type: 'string', label: 'Parent Comment ID', required: false },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'Subscription',
          displayName: 'Subscription',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'subscriberId', type: 'string', label: 'Subscriber ID', required: true },
            { name: 'channelId', type: 'string', label: 'Channel ID', required: true },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'Playlist',
          displayName: 'Playlist',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'name', type: 'string', label: 'Name', required: true },
            { name: 'description', type: 'text', label: 'Description', required: false },
            { name: 'ownerId', type: 'string', label: 'Owner ID', required: true },
            { name: 'videoIds', type: 'json', label: 'Video IDs', required: true },
            { name: 'isPublic', type: 'boolean', label: 'Public', required: true, defaultValue: true },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
      ],
      pages: [
        {
          id: 'page_video_home',
          path: '/videos',
          title: 'Video Home',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page_video_watch',
          path: '/watch/:id',
          title: 'Watch Video',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page_video_upload',
          path: '/upload',
          title: 'Upload Video',
          level: 2,
          componentTree: [],
          requiresAuth: true,
          requiredRole: 'user',
        },
        {
          id: 'page_channel',
          path: '/channel/:id',
          title: 'Channel',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
      ],
      workflows: [],
      luaScripts: [],
      componentHierarchy: {},
      componentConfigs: {},
    },
  },
  'spotify-clone': {
    manifest: {
      id: 'spotify-clone',
      name: 'Music Streaming Platform',
      version: '1.0.0',
      description: 'Full music streaming service with playlists, albums, artists, search, and playback controls. Create your own Spotify!',
      author: 'MetaBuilder Team',
      category: 'entertainment',
      icon: '🎵',
      screenshots: [],
      tags: ['music', 'streaming', 'audio', 'spotify'],
      dependencies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 1823,
      rating: 4.6,
      installed: false,
    },
    content: {
      schemas: [
        {
          name: 'Artist',
          displayName: 'Artist',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'name', type: 'string', label: 'Name', required: true },
            { name: 'bio', type: 'text', label: 'Biography', required: false },
            { name: 'imageUrl', type: 'string', label: 'Image URL', required: false },
            { name: 'genre', type: 'string', label: 'Genre', required: false },
            { name: 'verified', type: 'boolean', label: 'Verified', required: true, defaultValue: false },
            { name: 'followers', type: 'number', label: 'Followers', required: true, defaultValue: 0 },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'Album',
          displayName: 'Album',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'artistId', type: 'string', label: 'Artist ID', required: true },
            { name: 'coverUrl', type: 'string', label: 'Cover URL', required: false },
            { name: 'releaseDate', type: 'number', label: 'Release Date', required: false },
            { name: 'genre', type: 'string', label: 'Genre', required: false },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'Track',
          displayName: 'Track',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'artistId', type: 'string', label: 'Artist ID', required: true },
            { name: 'albumId', type: 'string', label: 'Album ID', required: false },
            { name: 'audioUrl', type: 'string', label: 'Audio URL', required: true },
            { name: 'duration', type: 'number', label: 'Duration (seconds)', required: true },
            { name: 'trackNumber', type: 'number', label: 'Track Number', required: false },
            { name: 'plays', type: 'number', label: 'Play Count', required: true, defaultValue: 0 },
            { name: 'likes', type: 'number', label: 'Likes', required: true, defaultValue: 0 },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'MusicPlaylist',
          displayName: 'Playlist',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'name', type: 'string', label: 'Name', required: true },
            { name: 'description', type: 'text', label: 'Description', required: false },
            { name: 'ownerId', type: 'string', label: 'Owner ID', required: true },
            { name: 'coverUrl', type: 'string', label: 'Cover URL', required: false },
            { name: 'trackIds', type: 'json', label: 'Track IDs', required: true },
            { name: 'isPublic', type: 'boolean', label: 'Public', required: true, defaultValue: true },
            { name: 'followers', type: 'number', label: 'Followers', required: true, defaultValue: 0 },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
      ],
      pages: [
        {
          id: 'page_music_home',
          path: '/music',
          title: 'Music Home',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page_music_search',
          path: '/search',
          title: 'Search Music',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page_music_artist',
          path: '/artist/:id',
          title: 'Artist',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page_music_album',
          path: '/album/:id',
          title: 'Album',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page_music_playlist',
          path: '/playlist/:id',
          title: 'Playlist',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
      ],
      workflows: [],
      luaScripts: [],
      componentHierarchy: {},
      componentConfigs: {},
    },
  },
  'retro-games': {
    manifest: {
      id: 'retro-games',
      name: 'Retro Games Arcade',
      version: '1.0.0',
      description: 'Classic arcade games collection with high scores, leaderboards, and achievements. Includes Snake, Tetris, Pong, and more!',
      author: 'MetaBuilder Team',
      category: 'gaming',
      icon: '🕹️',
      screenshots: [],
      tags: ['games', 'arcade', 'retro', 'entertainment'],
      dependencies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 1567,
      rating: 4.9,
      installed: false,
    },
    content: {
      schemas: [
        {
          name: 'Game',
          displayName: 'Game',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'name', type: 'string', label: 'Name', required: true },
            { name: 'description', type: 'text', label: 'Description', required: false },
            { name: 'thumbnailUrl', type: 'string', label: 'Thumbnail URL', required: false },
            { name: 'gameType', type: 'string', label: 'Game Type', required: true },
            { name: 'difficulty', type: 'string', label: 'Difficulty', required: false },
            { name: 'playCount', type: 'number', label: 'Play Count', required: true, defaultValue: 0 },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'HighScore',
          displayName: 'High Score',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'gameId', type: 'string', label: 'Game ID', required: true },
            { name: 'userId', type: 'string', label: 'User ID', required: true },
            { name: 'playerName', type: 'string', label: 'Player Name', required: true },
            { name: 'score', type: 'number', label: 'Score', required: true },
            { name: 'level', type: 'number', label: 'Level Reached', required: false },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'Achievement',
          displayName: 'Achievement',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'name', type: 'string', label: 'Name', required: true },
            { name: 'description', type: 'text', label: 'Description', required: false },
            { name: 'gameId', type: 'string', label: 'Game ID', required: true },
            { name: 'iconUrl', type: 'string', label: 'Icon URL', required: false },
            { name: 'requirement', type: 'string', label: 'Requirement', required: true },
            { name: 'points', type: 'number', label: 'Points', required: true, defaultValue: 10 },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'UserAchievement',
          displayName: 'User Achievement',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'userId', type: 'string', label: 'User ID', required: true },
            { name: 'achievementId', type: 'string', label: 'Achievement ID', required: true },
            { name: 'unlockedAt', type: 'number', label: 'Unlocked At', required: true },
          ],
        },
      ],
      pages: [
        {
          id: 'page_arcade_home',
          path: '/arcade',
          title: 'Arcade Home',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page_game_play',
          path: '/arcade/play/:id',
          title: 'Play Game',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page_leaderboard',
          path: '/arcade/leaderboard',
          title: 'Leaderboard',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
      ],
      workflows: [],
      luaScripts: [],
      componentHierarchy: {},
      componentConfigs: {},
      seedData: {
        Game: [
          { id: 'game_snake', name: 'Snake', description: 'Classic snake game', gameType: 'snake', difficulty: 'medium', playCount: 0, createdAt: Date.now() },
          { id: 'game_tetris', name: 'Tetris', description: 'Block-stacking puzzle', gameType: 'tetris', difficulty: 'medium', playCount: 0, createdAt: Date.now() },
          { id: 'game_pong', name: 'Pong', description: 'Classic paddle game', gameType: 'pong', difficulty: 'easy', playCount: 0, createdAt: Date.now() },
        ],
      },
    },
  },
  'ecommerce-basic': {
    manifest: {
      id: 'ecommerce-basic',
      name: 'E-Commerce Store',
      version: '1.0.0',
      description: 'Complete online store with products, shopping cart, checkout, orders, and inventory management. Start selling online!',
      author: 'MetaBuilder Team',
      category: 'ecommerce',
      icon: '🛒',
      screenshots: [],
      tags: ['ecommerce', 'shop', 'store', 'products'],
      dependencies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 2341,
      rating: 4.7,
      installed: false,
    },
    content: {
      schemas: [
        {
          name: 'Product',
          displayName: 'Product',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'name', type: 'string', label: 'Name', required: true },
            { name: 'description', type: 'text', label: 'Description', required: false },
            { name: 'price', type: 'number', label: 'Price', required: true },
            { name: 'salePrice', type: 'number', label: 'Sale Price', required: false },
            { name: 'imageUrl', type: 'string', label: 'Image URL', required: false },
            { name: 'category', type: 'string', label: 'Category', required: false },
            { name: 'stock', type: 'number', label: 'Stock Quantity', required: true, defaultValue: 0 },
            { name: 'sku', type: 'string', label: 'SKU', required: false },
            { name: 'featured', type: 'boolean', label: 'Featured', required: true, defaultValue: false },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'Cart',
          displayName: 'Shopping Cart',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'userId', type: 'string', label: 'User ID', required: true },
            { name: 'items', type: 'json', label: 'Items', required: true },
            { name: 'totalAmount', type: 'number', label: 'Total Amount', required: true, defaultValue: 0 },
            { name: 'updatedAt', type: 'number', label: 'Updated At', required: true },
          ],
        },
        {
          name: 'Order',
          displayName: 'Order',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'userId', type: 'string', label: 'User ID', required: true },
            { name: 'items', type: 'json', label: 'Items', required: true },
            { name: 'totalAmount', type: 'number', label: 'Total Amount', required: true },
            { name: 'status', type: 'string', label: 'Status', required: true },
            { name: 'shippingAddress', type: 'json', label: 'Shipping Address', required: true },
            { name: 'paymentMethod', type: 'string', label: 'Payment Method', required: false },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
      ],
      pages: [
        {
          id: 'page_shop_home',
          path: '/shop',
          title: 'Shop',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page_product_detail',
          path: '/product/:id',
          title: 'Product Details',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page_cart',
          path: '/cart',
          title: 'Shopping Cart',
          level: 2,
          componentTree: [],
          requiresAuth: true,
          requiredRole: 'user',
        },
        {
          id: 'page_checkout',
          path: '/checkout',
          title: 'Checkout',
          level: 2,
          componentTree: [],
          requiresAuth: true,
          requiredRole: 'user',
        },
      ],
      workflows: [],
      luaScripts: [],
      componentHierarchy: {},
      componentConfigs: {},
    },
  },
  'irc-webchat': {
    manifest: {
      id: 'irc-webchat',
      name: 'IRC-Style Webchat',
      version: '1.0.0',
      description: 'Classic IRC-style webchat with channels, commands, online users, and real-time messaging. Perfect for community chat rooms.',
      author: 'MetaBuilder Team',
      category: 'social',
      icon: '💬',
      screenshots: [],
      tags: ['chat', 'irc', 'messaging', 'realtime'],
      dependencies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 1543,
      rating: 4.8,
      installed: false,
    },
    content: {
      schemas: [
        {
          name: 'ChatChannel',
          displayName: 'Chat Channel',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'name', type: 'string', label: 'Channel Name', required: true },
            { name: 'description', type: 'text', label: 'Description', required: false },
            { name: 'topic', type: 'string', label: 'Channel Topic', required: false },
            { name: 'isPrivate', type: 'boolean', label: 'Private', required: false, defaultValue: false },
            { name: 'createdBy', type: 'string', label: 'Created By', required: true },
            { name: 'createdAt', type: 'number', label: 'Created At', required: true },
          ],
        },
        {
          name: 'ChatMessage',
          displayName: 'Chat Message',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'channelId', type: 'string', label: 'Channel ID', required: true },
            { name: 'username', type: 'string', label: 'Username', required: true },
            { name: 'userId', type: 'string', label: 'User ID', required: true },
            { name: 'message', type: 'text', label: 'Message', required: true },
            { name: 'type', type: 'string', label: 'Message Type', required: true },
            { name: 'timestamp', type: 'number', label: 'Timestamp', required: true },
          ],
        },
        {
          name: 'ChatUser',
          displayName: 'Chat User',
          fields: [
            { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
            { name: 'channelId', type: 'string', label: 'Channel ID', required: true },
            { name: 'username', type: 'string', label: 'Username', required: true },
            { name: 'userId', type: 'string', label: 'User ID', required: true },
            { name: 'joinedAt', type: 'number', label: 'Joined At', required: true },
          ],
        },
      ],
      pages: [
        {
          id: 'page_chat',
          path: '/chat',
          title: 'IRC Webchat',
          level: 2,
          componentTree: [
            {
              id: 'comp_chat_root',
              type: 'IRCWebchat',
              props: {
                channelName: 'general',
              },
              children: [],
            },
          ],
          requiresAuth: true,
          requiredRole: 'user',
        },
      ],
      workflows: [
        {
          id: 'workflow_send_message',
          name: 'Send Chat Message',
          description: 'Workflow for sending a chat message',
          nodes: [],
          edges: [],
          enabled: true,
        },
        {
          id: 'workflow_join_channel',
          name: 'Join Channel',
          description: 'Workflow for joining a chat channel',
          nodes: [],
          edges: [],
          enabled: true,
        },
      ],
      luaScripts: [
        {
          id: 'lua_irc_send_message',
          name: 'Send IRC Message',
          description: 'Sends a message to the chat channel',
          code: `-- Send IRC Message
function sendMessage(channelId, username, userId, message)
  local msgId = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999)
  local msg = {
    id = msgId,
    channelId = channelId,
    username = username,
    userId = userId,
    message = message,
    type = "message",
    timestamp = os.time() * 1000
  }
  log("Sending message: " .. message)
  return msg
end

return sendMessage`,
          parameters: [
            { name: 'channelId', type: 'string' },
            { name: 'username', type: 'string' },
            { name: 'userId', type: 'string' },
            { name: 'message', type: 'string' },
          ],
          returnType: 'table',
        },
        {
          id: 'lua_irc_handle_command',
          name: 'Handle IRC Command',
          description: 'Processes IRC commands like /help, /users, etc',
          code: `-- Handle IRC Command
function handleCommand(command, channelId, username, onlineUsers)
  local parts = {}
  for part in string.gmatch(command, "%S+") do
    table.insert(parts, part)
  end
  
  local cmd = parts[1]:lower()
  local response = {
    id = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999),
    username = "System",
    userId = "system",
    type = "system",
    timestamp = os.time() * 1000,
    channelId = channelId
  }
  
  if cmd == "/help" then
    response.message = "Available commands: /help, /users, /clear, /me <action>"
  elseif cmd == "/users" then
    local userCount = #onlineUsers
    local userList = table.concat(onlineUsers, ", ")
    response.message = "Online users (" .. userCount .. "): " .. userList
  elseif cmd == "/clear" then
    response.message = "CLEAR_MESSAGES"
    response.type = "command"
  elseif cmd == "/me" then
    if #parts > 1 then
      local action = table.concat(parts, " ", 2)
      response.message = action
      response.username = username
      response.userId = username
      response.type = "system"
    else
      response.message = "Usage: /me <action>"
    end
  else
    response.message = "Unknown command: " .. cmd .. ". Type /help for available commands."
  end
  
  return response
end

return handleCommand`,
          parameters: [
            { name: 'command', type: 'string' },
            { name: 'channelId', type: 'string' },
            { name: 'username', type: 'string' },
            { name: 'onlineUsers', type: 'table' },
          ],
          returnType: 'table',
        },
        {
          id: 'lua_irc_format_time',
          name: 'Format Timestamp',
          description: 'Formats a timestamp for display',
          code: `-- Format Timestamp
function formatTime(timestamp)
  local date = os.date("*t", timestamp / 1000)
  local hour = date.hour
  local ampm = "AM"
  
  if hour >= 12 then
    ampm = "PM"
    if hour > 12 then
      hour = hour - 12
    end
  end
  
  if hour == 0 then
    hour = 12
  end
  
  return string.format("%02d:%02d %s", hour, date.min, ampm)
end

return formatTime`,
          parameters: [
            { name: 'timestamp', type: 'number' },
          ],
          returnType: 'string',
        },
        {
          id: 'lua_irc_user_join',
          name: 'User Join Channel',
          description: 'Handles user joining a channel',
          code: `-- User Join Channel
function userJoin(channelId, username, userId)
  local joinMsg = {
    id = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999),
    channelId = channelId,
    username = "System",
    userId = "system",
    message = username .. " has joined the channel",
    type = "join",
    timestamp = os.time() * 1000
  }
  
  log(username .. " joined channel " .. channelId)
  return joinMsg
end

return userJoin`,
          parameters: [
            { name: 'channelId', type: 'string' },
            { name: 'username', type: 'string' },
            { name: 'userId', type: 'string' },
          ],
          returnType: 'table',
        },
        {
          id: 'lua_irc_user_leave',
          name: 'User Leave Channel',
          description: 'Handles user leaving a channel',
          code: `-- User Leave Channel
function userLeave(channelId, username, userId)
  local leaveMsg = {
    id = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999),
    channelId = channelId,
    username = "System",
    userId = "system",
    message = username .. " has left the channel",
    type = "leave",
    timestamp = os.time() * 1000
  }
  
  log(username .. " left channel " .. channelId)
  return leaveMsg
end

return userLeave`,
          parameters: [
            { name: 'channelId', type: 'string' },
            { name: 'username', type: 'string' },
            { name: 'userId', type: 'string' },
          ],
          returnType: 'table',
        },
      ],
      componentHierarchy: {
        page_chat: {
          id: 'comp_chat_root',
          type: 'IRCWebchat',
          props: {},
          children: [],
        },
      },
      componentConfigs: {
        IRCWebchat: {
          type: 'IRCWebchat',
          category: 'social',
          label: 'IRC Webchat',
          description: 'IRC-style chat component with channels and commands',
          icon: '💬',
          props: [
            {
              name: 'channelName',
              type: 'string',
              label: 'Channel Name',
              defaultValue: 'general',
              required: false,
            },
            {
              name: 'showSettings',
              type: 'boolean',
              label: 'Show Settings',
              defaultValue: false,
              required: false,
            },
            {
              name: 'height',
              type: 'string',
              label: 'Height',
              defaultValue: '600px',
              required: false,
            },
          ],
          config: {
            layout: 'Card',
            styling: {
              className: 'h-[600px] flex flex-col',
            },
            children: [
              {
                id: 'header',
                type: 'CardHeader',
                props: {
                  className: 'border-b border-border pb-3',
                },
                children: [
                  {
                    id: 'title_container',
                    type: 'Flex',
                    props: {
                      className: 'flex items-center justify-between',
                    },
                    children: [
                      {
                        id: 'title',
                        type: 'CardTitle',
                        props: {
                          className: 'flex items-center gap-2 text-lg',
                          content: '#{channelName}',
                        },
                      },
                      {
                        id: 'actions',
                        type: 'Flex',
                        props: {
                          className: 'flex items-center gap-2',
                        },
                        children: [
                          {
                            id: 'user_badge',
                            type: 'Badge',
                            props: {
                              variant: 'secondary',
                              className: 'gap-1.5',
                              icon: 'Users',
                              content: '{onlineUsersCount}',
                            },
                          },
                          {
                            id: 'settings_button',
                            type: 'Button',
                            props: {
                              size: 'sm',
                              variant: 'ghost',
                              icon: 'Gear',
                              onClick: 'toggleSettings',
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'content',
                type: 'CardContent',
                props: {
                  className: 'flex-1 flex flex-col p-0 overflow-hidden',
                },
                children: [
                  {
                    id: 'main_area',
                    type: 'Flex',
                    props: {
                      className: 'flex flex-1 overflow-hidden',
                    },
                    children: [
                      {
                        id: 'messages_area',
                        type: 'ScrollArea',
                        props: {
                          className: 'flex-1 p-4',
                        },
                        children: [
                          {
                            id: 'messages_container',
                            type: 'MessageList',
                            props: {
                              className: 'space-y-2 font-mono text-sm',
                              dataSource: 'messages',
                              itemRenderer: 'renderMessage',
                            },
                          },
                        ],
                      },
                      {
                        id: 'sidebar',
                        type: 'Container',
                        props: {
                          className: 'w-48 border-l border-border p-4 bg-muted/20',
                          conditional: 'showSettings',
                        },
                        children: [
                          {
                            id: 'sidebar_title',
                            type: 'Heading',
                            props: {
                              level: '4',
                              className: 'font-semibold text-sm mb-3',
                              content: 'Online Users',
                            },
                          },
                          {
                            id: 'users_list',
                            type: 'UserList',
                            props: {
                              className: 'space-y-1.5 text-sm',
                              dataSource: 'onlineUsers',
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: 'input_area',
                    type: 'Container',
                    props: {
                      className: 'border-t border-border p-4',
                    },
                    children: [
                      {
                        id: 'input_row',
                        type: 'Flex',
                        props: {
                          className: 'flex gap-2',
                        },
                        children: [
                          {
                            id: 'message_input',
                            type: 'Input',
                            props: {
                              className: 'flex-1 font-mono',
                              placeholder: 'Type a message... (/help for commands)',
                              onKeyPress: 'handleKeyPress',
                              value: '{inputMessage}',
                              onChange: 'updateInputMessage',
                            },
                          },
                          {
                            id: 'send_button',
                            type: 'Button',
                            props: {
                              size: 'icon',
                              icon: 'PaperPlaneTilt',
                              onClick: 'handleSendMessage',
                            },
                          },
                        ],
                      },
                      {
                        id: 'help_text',
                        type: 'Text',
                        props: {
                          className: 'text-xs text-muted-foreground mt-2',
                          content: 'Press Enter to send. Type /help for commands.',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      seedData: {
        ChatChannel: [
          {
            id: 'channel_general',
            name: 'general',
            description: 'General discussion',
            topic: 'Welcome to the general chat!',
            isPrivate: false,
            createdBy: 'system',
            createdAt: Date.now(),
          },
          {
            id: 'channel_random',
            name: 'random',
            description: 'Random conversations',
            topic: 'Talk about anything here',
            isPrivate: false,
            createdBy: 'system',
            createdAt: Date.now(),
          },
        ],
      },
    },
  },
}
