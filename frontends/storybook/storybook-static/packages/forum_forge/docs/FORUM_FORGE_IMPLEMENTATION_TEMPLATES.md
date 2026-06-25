# Forum Forge: Implementation Templates

**Quick reference for building missing components and workflows**

---

## A. Missing Page Component Templates

### 1. forum_home (Landing Page)

**File**: `/packages/forum_forge/components/forum_home.json`

```json
{
  "id": "forum_home",
  "name": "ForumHome",
  "description": "Forum home page with categories and recent activity",
  "packageId": "forum_forge",
  "level": 1,
  "requiresAuth": true,
  "render": {
    "type": "element",
    "template": {
      "type": "Stack",
      "direction": "column",
      "gap": 3,
      "className": "forum-home-container",
      "children": [
        {
          "type": "ForumRoot",
          "title": "Forum Forge",
          "subtitle": "Community discussion hub"
        },
        {
          "type": "ForumStatsGrid",
          "activeThreads": "{{ $data.stats.activeThreads }}",
          "repliesToday": "{{ $data.stats.repliesToday }}",
          "queuedFlags": "{{ $data.stats.queuedFlags }}"
        },
        {
          "type": "CategoryList",
          "categories": "{{ $data.categories }}",
          "title": "Forum Categories"
        },
        {
          "type": "ThreadList",
          "threads": "{{ $data.recentThreads }}",
          "title": "Recent Threads"
        }
      ]
    }
  },
  "data": {
    "categories": {
      "binding": "GET /api/v1/:tenantId/forum_forge/categories",
      "cache": 300
    },
    "recentThreads": {
      "binding": "GET /api/v1/:tenantId/forum_forge/threads?sortBy=lastReplyAt&limit=5",
      "cache": 60
    },
    "stats": {
      "binding": "GET /api/v1/:tenantId/forum_forge/admin/stats",
      "cache": 120
    }
  }
}
```

**Data Requirements**:
- GET `/api/v1/{tenant}/forum_forge/categories` → Array of categories
- GET `/api/v1/{tenant}/forum_forge/threads?limit=5` → Recent threads
- GET `/api/v1/{tenant}/forum_forge/admin/stats` → Stats object

---

### 2. forum_category_view (Category Page)

**File**: `/packages/forum_forge/components/forum_category_view.json`

```json
{
  "id": "forum_category_view",
  "name": "ForumCategoryView",
  "description": "Forum category page with thread list",
  "packageId": "forum_forge",
  "level": 1,
  "requiresAuth": true,
  "render": {
    "type": "element",
    "template": {
      "type": "Stack",
      "direction": "column",
      "gap": 2,
      "className": "forum-category-view",
      "children": [
        {
          "type": "Card",
          "variant": "outlined",
          "children": [
            {
              "type": "Stack",
              "direction": "column",
              "gap": 1,
              "sx": { "p": 3 },
              "children": [
                {
                  "type": "Text",
                  "variant": "h4",
                  "fontWeight": "bold",
                  "children": "{{ $data.category.name }}"
                },
                {
                  "type": "Text",
                  "variant": "body2",
                  "color": "secondary",
                  "children": "{{ $data.category.description }}"
                },
                {
                  "type": "Button",
                  "variant": "contained",
                  "color": "primary",
                  "href": "/forum/create-thread?categoryId={{ $data.category.id }}",
                  "children": "Create New Thread"
                }
              ]
            }
          ]
        },
        {
          "type": "ThreadList",
          "threads": "{{ $data.threads }}",
          "title": "Threads"
        },
        {
          "type": "Pagination",
          "page": "{{ $params.page || 1 }}",
          "pageSize": "{{ $params.limit || 20 }}",
          "totalCount": "{{ $data.pagination.total }}",
          "onPageChange": "handlePageChange"
        }
      ]
    }
  },
  "params": {
    "categoryId": {
      "type": "string",
      "source": "route",
      "required": true
    },
    "page": {
      "type": "number",
      "source": "query",
      "default": 1
    },
    "limit": {
      "type": "number",
      "source": "query",
      "default": 20
    }
  },
  "data": {
    "category": {
      "binding": "GET /api/v1/:tenantId/forum_forge/categories/:categoryId"
    },
    "threads": {
      "binding": "GET /api/v1/:tenantId/forum_forge/categories/:categoryId/threads?page={{ $params.page }}&limit={{ $params.limit }}"
    },
    "pagination": {
      "binding": "$data.threads.pagination"
    }
  }
}
```

---

### 3. forum_thread_view (Thread Discussion Page)

**File**: `/packages/forum_forge/components/forum_thread_view.json`

```json
{
  "id": "forum_thread_view",
  "name": "ForumThreadView",
  "description": "Forum thread page with posts and reply form",
  "packageId": "forum_forge",
  "level": 1,
  "requiresAuth": true,
  "render": {
    "type": "element",
    "template": {
      "type": "Stack",
      "direction": "column",
      "gap": 2,
      "className": "forum-thread-view",
      "children": [
        {
          "type": "Card",
          "variant": "outlined",
          "children": [
            {
              "type": "Stack",
              "direction": "column",
              "gap": 2,
              "sx": { "p": 3 },
              "children": [
                {
                  "type": "Flex",
                  "justifyContent": "space-between",
                  "alignItems": "center",
                  "children": [
                    {
                      "type": "Stack",
                      "direction": "column",
                      "gap": 0.5,
                      "children": [
                        {
                          "type": "Text",
                          "variant": "h5",
                          "fontWeight": "bold",
                          "children": "{{ $data.thread.title }}"
                        },
                        {
                          "type": "Text",
                          "variant": "caption",
                          "color": "secondary",
                          "children": "Started by {{ $data.thread.authorName }} • {{ $data.thread.viewCount }} views"
                        }
                      ]
                    },
                    {
                      "type": "Flex",
                      "gap": 1,
                      "children": [
                        {
                          "type": "Button",
                          "size": "sm",
                          "variant": "outlined",
                          "children": "{{ $data.thread.isPinned ? 'Unpin' : 'Pin' }}",
                          "onClick": "handlePin",
                          "visible": "{{ $user.level >= 3 }}"
                        },
                        {
                          "type": "Button",
                          "size": "sm",
                          "variant": "outlined",
                          "children": "{{ $data.thread.isLocked ? 'Unlock' : 'Lock' }}",
                          "onClick": "handleLock",
                          "visible": "{{ $user.level >= 3 }}"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "Stack",
          "direction": "column",
          "gap": 2,
          "children": {
            "type": "loop",
            "items": "{{ $data.posts }}",
            "itemKey": "id",
            "template": {
              "type": "PostCard",
              "post": "{{ item }}"
            }
          }
        },
        {
          "type": "Pagination",
          "page": "{{ $params.page || 1 }}",
          "pageSize": "{{ $params.limit || 10 }}",
          "totalCount": "{{ $data.pagination.total }}"
        },
        {
          "type": "Card",
          "variant": "outlined",
          "visible": "{{ !$data.thread.isLocked }}",
          "children": [
            {
              "type": "Stack",
              "direction": "column",
              "gap": 2,
              "sx": { "p": 3 },
              "children": [
                {
                  "type": "Text",
                  "variant": "subtitle1",
                  "fontWeight": "semibold",
                  "children": "Reply to thread"
                },
                {
                  "type": "TextArea",
                  "ref": "replyContent",
                  "placeholder": "Write your reply...",
                  "rows": 5,
                  "minLength": 3,
                  "maxLength": 5000
                },
                {
                  "type": "Button",
                  "variant": "contained",
                  "onClick": "handleReply",
                  "children": "Post Reply"
                }
              ]
            }
          ]
        }
      ]
    }
  },
  "params": {
    "threadId": {
      "type": "string",
      "source": "route",
      "required": true
    },
    "page": {
      "type": "number",
      "source": "query",
      "default": 1
    },
    "limit": {
      "type": "number",
      "source": "query",
      "default": 10
    }
  },
  "data": {
    "thread": {
      "binding": "GET /api/v1/:tenantId/forum_forge/threads/:threadId"
    },
    "posts": {
      "binding": "GET /api/v1/:tenantId/forum_forge/threads/:threadId/posts?page={{ $params.page }}&limit={{ $params.limit }}"
    }
  },
  "handlers": {
    "handleReply": "POST /api/v1/:tenantId/forum_forge/threads/:threadId/posts { content: $refs.replyContent.value }",
    "handlePin": "PUT /api/v1/:tenantId/forum_forge/threads/:threadId/pin { pinned: !$data.thread.isPinned }",
    "handleLock": "PUT /api/v1/:tenantId/forum_forge/threads/:threadId/lock { locked: !$data.thread.isLocked }"
  }
}
```

---

### 4. forum_create_thread (Create Thread Form)

**File**: `/packages/forum_forge/components/forum_create_thread.json`

```json
{
  "id": "forum_create_thread",
  "name": "ForumCreateThread",
  "description": "Form for creating a new forum thread",
  "packageId": "forum_forge",
  "level": 1,
  "requiresAuth": true,
  "render": {
    "type": "element",
    "template": {
      "type": "Stack",
      "direction": "column",
      "gap": 3,
      "className": "forum-create-thread",
      "children": [
        {
          "type": "Text",
          "variant": "h4",
          "fontWeight": "bold",
          "children": "Create New Thread"
        },
        {
          "type": "Card",
          "variant": "outlined",
          "children": [
            {
              "type": "Stack",
              "direction": "column",
              "gap": 2,
              "sx": { "p": 3 },
              "children": [
                {
                  "type": "FormControl",
                  "children": [
                    {
                      "type": "Label",
                      "children": "Category"
                    },
                    {
                      "type": "Select",
                      "ref": "categoryId",
                      "required": true,
                      "options": "{{ $data.categories.map(c => ({ value: c.id, label: c.name })) }}"
                    }
                  ]
                },
                {
                  "type": "FormControl",
                  "children": [
                    {
                      "type": "Label",
                      "children": "Thread Title"
                    },
                    {
                      "type": "Input",
                      "ref": "title",
                      "placeholder": "Enter thread title",
                      "required": true,
                      "minLength": 3,
                      "maxLength": 200
                    }
                  ]
                },
                {
                  "type": "FormControl",
                  "children": [
                    {
                      "type": "Label",
                      "children": "Content"
                    },
                    {
                      "type": "TextArea",
                      "ref": "content",
                      "placeholder": "Write your thread content...",
                      "required": true,
                      "minLength": 10,
                      "maxLength": 5000,
                      "rows": 8
                    }
                  ]
                },
                {
                  "type": "Flex",
                  "gap": 1,
                  "justifyContent": "flex-end",
                  "children": [
                    {
                      "type": "Button",
                      "variant": "outlined",
                      "onClick": "handleCancel",
                      "children": "Cancel"
                    },
                    {
                      "type": "Button",
                      "variant": "contained",
                      "onClick": "handleSubmit",
                      "loading": "{{ $state.submitting }}",
                      "children": "Create Thread"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  "data": {
    "categories": {
      "binding": "GET /api/v1/:tenantId/forum_forge/categories"
    }
  },
  "handlers": {
    "handleSubmit": "POST /api/v1/:tenantId/forum_forge/threads { categoryId: $refs.categoryId.value, title: $refs.title.value, content: $refs.content.value }",
    "handleCancel": "navigate('/forum')"
  }
}
```

---

### 5. forum_moderation_panel (Admin Dashboard)

**File**: `/packages/forum_forge/components/forum_moderation_panel.json`

```json
{
  "id": "forum_moderation_panel",
  "name": "ForumModerationPanel",
  "description": "Moderation dashboard for forum management",
  "packageId": "forum_forge",
  "level": 3,
  "requiresAuth": true,
  "minLevel": 3,
  "render": {
    "type": "element",
    "template": {
      "type": "Stack",
      "direction": "column",
      "gap": 3,
      "className": "forum-moderation-panel",
      "children": [
        {
          "type": "Text",
          "variant": "h4",
          "fontWeight": "bold",
          "children": "Forum Moderation"
        },
        {
          "type": "Tabs",
          "defaultTab": "flagged",
          "children": [
            {
              "tabId": "flagged",
              "label": "Flagged Posts",
              "content": {
                "type": "Stack",
                "direction": "column",
                "gap": 2,
                "children": [
                  {
                    "type": "Text",
                    "variant": "subtitle1",
                    "children": "Flagged for Review ({{ $data.flaggedPosts.length }})"
                  },
                  {
                    "type": "loop",
                    "items": "{{ $data.flaggedPosts }}",
                    "itemKey": "id",
                    "template": {
                      "type": "Card",
                      "variant": "outlined",
                      "children": [
                        {
                          "type": "Stack",
                          "direction": "column",
                          "gap": 1,
                          "sx": { "p": 2 },
                          "children": [
                            {
                              "type": "Text",
                              "variant": "body2",
                              "children": "{{ item.content }}"
                            },
                            {
                              "type": "Text",
                              "variant": "caption",
                              "color": "secondary",
                              "children": "Reason: {{ item.flagReason }} • Flagged by {{ item.flaggedBy }}"
                            },
                            {
                              "type": "Flex",
                              "gap": 1,
                              "children": [
                                {
                                  "type": "Button",
                                  "size": "sm",
                                  "variant": "contained",
                                  "color": "success",
                                  "onClick": "handleApproveFlaggedPost({{ item.id }})",
                                  "children": "Approve"
                                },
                                {
                                  "type": "Button",
                                  "size": "sm",
                                  "variant": "contained",
                                  "color": "error",
                                  "onClick": "handleRejectFlaggedPost({{ item.id }})",
                                  "children": "Delete"
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              "tabId": "stats",
              "label": "Statistics",
              "content": {
                "type": "Stack",
                "direction": "column",
                "gap": 2,
                "children": [
                  {
                    "type": "ForumStatsGrid",
                    "activeThreads": "{{ $data.stats.activeThreads }}",
                    "repliesToday": "{{ $data.stats.repliesToday }}",
                    "queuedFlags": "{{ $data.stats.queuedFlags }}"
                  }
                ]
              }
            },
            {
              "tabId": "audit",
              "label": "Audit Log",
              "content": {
                "type": "Stack",
                "direction": "column",
                "gap": 2,
                "children": [
                  {
                    "type": "loop",
                    "items": "{{ $data.auditLog }}",
                    "itemKey": "id",
                    "template": {
                      "type": "Card",
                      "variant": "outlined",
                      "children": [
                        {
                          "type": "Stack",
                          "direction": "column",
                          "gap": 0.5,
                          "sx": { "p": 2 },
                          "children": [
                            {
                              "type": "Text",
                              "variant": "body2",
                              "children": "{{ item.action }} by {{ item.moderator }}"
                            },
                            {
                              "type": "Text",
                              "variant": "caption",
                              "color": "secondary",
                              "children": "{{ item.timestamp }}"
                            }
                          ]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  },
  "data": {
    "flaggedPosts": {
      "binding": "GET /api/v1/:tenantId/forum_forge/admin/flagged-posts"
    },
    "stats": {
      "binding": "GET /api/v1/:tenantId/forum_forge/admin/stats"
    },
    "auditLog": {
      "binding": "GET /api/v1/:tenantId/forum_forge/admin/audit-log"
    }
  },
  "handlers": {
    "handleApproveFlaggedPost": "PUT /api/v1/:tenantId/forum_forge/admin/flagged-posts/:flagId { action: 'approve' }",
    "handleRejectFlaggedPost": "PUT /api/v1/:tenantId/forum_forge/admin/flagged-posts/:flagId { action: 'reject' }"
  }
}
```

---

## B. Missing Workflow Templates

### 1. update-thread.jsonscript

```json
{
  "version": "2.2.0",
  "name": "Update Forum Thread",
  "description": "Update thread title or content (owner or moderator only)",
  "trigger": {
    "type": "http",
    "method": "PUT",
    "path": "/forum/threads/:threadId"
  },
  "nodes": [
    {
      "id": "validate_tenant",
      "type": "operation",
      "op": "condition",
      "condition": "{{ $context.tenantId !== undefined }}"
    },
    {
      "id": "validate_user",
      "type": "operation",
      "op": "condition",
      "condition": "{{ $context.user.id !== undefined }}"
    },
    {
      "id": "fetch_thread",
      "type": "operation",
      "op": "database_read",
      "entity": "ForumThread",
      "params": {
        "filter": {
          "id": "{{ $json.threadId }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "check_ownership",
      "type": "operation",
      "op": "condition",
      "condition": "{{ $steps.fetch_thread.output.authorId === $context.user.id || $context.user.level >= 3 }}"
    },
    {
      "id": "validate_input",
      "type": "operation",
      "op": "validate",
      "input": "{{ $json }}",
      "rules": {
        "title": "required|string|minLength:3|maxLength:200",
        "content": "required|string|minLength:10|maxLength:5000"
      }
    },
    {
      "id": "update_thread",
      "type": "operation",
      "op": "database_update",
      "entity": "ForumThread",
      "params": {
        "filter": {
          "id": "{{ $json.threadId }}"
        },
        "data": {
          "title": "{{ $json.title }}",
          "content": "{{ $json.content }}",
          "updatedAt": "{{ new Date().toISOString() }}"
        }
      }
    },
    {
      "id": "emit_updated",
      "type": "action",
      "action": "emit_event",
      "event": "thread_updated",
      "channel": "{{ 'forum:thread:' + $json.threadId }}",
      "data": {
        "threadId": "{{ $json.threadId }}",
        "title": "{{ $json.title }}",
        "updatedBy": "{{ $context.user.id }}"
      }
    },
    {
      "id": "return_success",
      "type": "action",
      "action": "http_response",
      "status": 200,
      "body": "{{ $steps.update_thread.output }}"
    }
  ],
  "errorHandler": {
    "type": "action",
    "action": "http_response",
    "status": 400,
    "body": {
      "error": "Failed to update thread",
      "message": "{{ $error.message }}"
    }
  }
}
```

---

### 2. lock-thread.jsonscript

```json
{
  "version": "2.2.0",
  "name": "Lock Forum Thread",
  "description": "Lock/unlock thread to prevent replies (moderator only)",
  "trigger": {
    "type": "http",
    "method": "PUT",
    "path": "/forum/threads/:threadId/lock"
  },
  "nodes": [
    {
      "id": "validate_moderator",
      "type": "operation",
      "op": "condition",
      "condition": "{{ $context.user.level >= 3 }}"
    },
    {
      "id": "update_thread",
      "type": "operation",
      "op": "database_update",
      "entity": "ForumThread",
      "params": {
        "filter": {
          "id": "{{ $json.threadId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "data": {
          "isLocked": "{{ $json.locked }}"
        }
      }
    },
    {
      "id": "emit_locked",
      "type": "action",
      "action": "emit_event",
      "event": "thread_locked",
      "channel": "{{ 'forum:thread:' + $json.threadId }}",
      "data": {
        "threadId": "{{ $json.threadId }}",
        "locked": "{{ $json.locked }}",
        "moderator": "{{ $context.user.id }}"
      }
    },
    {
      "id": "return_success",
      "type": "action",
      "action": "http_response",
      "status": 200,
      "body": "{{ $steps.update_thread.output }}"
    }
  ]
}
```

---

### 3. flag-post.jsonscript

```json
{
  "version": "2.2.0",
  "name": "Flag Forum Post",
  "description": "Report inappropriate post for moderation review",
  "trigger": {
    "type": "http",
    "method": "POST",
    "path": "/forum/posts/:postId/flag"
  },
  "nodes": [
    {
      "id": "validate_user",
      "type": "operation",
      "op": "condition",
      "condition": "{{ $context.user.id !== undefined }}"
    },
    {
      "id": "validate_input",
      "type": "operation",
      "op": "validate",
      "input": "{{ $json }}",
      "rules": {
        "reason": "required|string|minLength:10|maxLength:500"
      }
    },
    {
      "id": "get_post",
      "type": "operation",
      "op": "database_read",
      "entity": "ForumPost",
      "params": {
        "filter": {
          "id": "{{ $json.postId }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "create_flag",
      "type": "operation",
      "op": "database_create",
      "entity": "PostFlag",
      "data": {
        "tenantId": "{{ $context.tenantId }}",
        "postId": "{{ $json.postId }}",
        "threadId": "{{ $steps.get_post.output.threadId }}",
        "flaggedBy": "{{ $context.user.id }}",
        "reason": "{{ $json.reason }}",
        "status": "pending",
        "createdAt": "{{ new Date().toISOString() }}"
      }
    },
    {
      "id": "emit_flagged",
      "type": "action",
      "action": "emit_event",
      "event": "post_flagged",
      "channel": "{{ 'forum:moderation:' + $context.tenantId }}",
      "data": {
        "postId": "{{ $json.postId }}",
        "reason": "{{ $json.reason }}",
        "flaggedBy": "{{ $context.user.id }}"
      }
    },
    {
      "id": "return_success",
      "type": "action",
      "action": "http_response",
      "status": 201,
      "body": {
        "message": "Post reported successfully",
        "flagId": "{{ $steps.create_flag.output.id }}"
      }
    }
  ]
}
```

---

### 4. list-categories.jsonscript

```json
{
  "version": "2.2.0",
  "name": "List Forum Categories",
  "description": "List all forum categories with statistics",
  "trigger": {
    "type": "http",
    "method": "GET",
    "path": "/forum/categories"
  },
  "nodes": [
    {
      "id": "validate_tenant",
      "type": "operation",
      "op": "condition",
      "condition": "{{ $context.tenantId !== undefined }}"
    },
    {
      "id": "fetch_categories",
      "type": "operation",
      "op": "database_read",
      "entity": "ForumCategory",
      "params": {
        "filter": {
          "tenantId": "{{ $context.tenantId }}"
        },
        "sort": {
          "sortOrder": 1
        }
      }
    },
    {
      "id": "enrich_with_stats",
      "type": "operation",
      "op": "transform_data",
      "output": "{{ $steps.fetch_categories.output.map(cat => ({ ...cat, threadCount: 0, postCount: 0 })) }}"
    },
    {
      "id": "return_success",
      "type": "action",
      "action": "http_response",
      "status": 200,
      "body": "{{ $steps.enrich_with_stats.output }}"
    }
  ]
}
```

---

## C. Missing Sub-Components

### post_card Component

```json
{
  "id": "post_card",
  "name": "PostCard",
  "description": "Display single forum post with metadata and actions",
  "props": [
    {
      "name": "post",
      "type": "object",
      "required": true,
      "description": "Post data object"
    }
  ],
  "render": {
    "type": "element",
    "template": {
      "type": "Card",
      "variant": "outlined",
      "className": "forum-post-card",
      "children": [
        {
          "type": "Stack",
          "direction": "column",
          "gap": 1.5,
          "sx": { "p": 2 },
          "children": [
            {
              "type": "Flex",
              "justifyContent": "space-between",
              "alignItems": "flex-start",
              "children": [
                {
                  "type": "Stack",
                  "direction": "column",
                  "gap": 0.5,
                  "children": [
                    {
                      "type": "Text",
                      "variant": "body2",
                      "fontWeight": "semibold",
                      "children": "{{ post.authorName }}"
                    },
                    {
                      "type": "Text",
                      "variant": "caption",
                      "color": "secondary",
                      "children": "{{ post.createdAt }}"
                    }
                  ]
                },
                {
                  "type": "Flex",
                  "gap": 1,
                  "children": [
                    {
                      "type": "Button",
                      "size": "sm",
                      "variant": "ghost",
                      "icon": "Heart",
                      "children": "{{ post.likes }}",
                      "onClick": "handleLike"
                    },
                    {
                      "type": "IconButton",
                      "size": "sm",
                      "icon": "Flag",
                      "onClick": "handleFlag",
                      "title": "Report post"
                    },
                    {
                      "type": "IconButton",
                      "size": "sm",
                      "icon": "MoreVertical",
                      "onClick": "showMoreMenu",
                      "visible": "{{ $user.id === post.authorId || $user.level >= 3 }}"
                    }
                  ]
                }
              ]
            },
            {
              "type": "Text",
              "variant": "body2",
              "children": "{{ post.content }}"
            },
            {
              "type": "Text",
              "variant": "caption",
              "color": "secondary",
              "children": "{{ post.isEdited ? 'Edited ' + post.updatedAt : '' }}"
            }
          ]
        }
      ]
    }
  }
}
```

---

## D. Quick Routes Checklist

**Category Routes** (Public):
- [ ] GET `/categories` → List all categories
- [ ] GET `/categories/:id` → Get category detail

**Thread Routes** (Public):
- [ ] GET `/threads` → List threads (paginated, filterable)
- [ ] GET `/threads/:id` → Get thread with first post

**Thread Routes** (Authenticated):
- [ ] POST `/threads` → Create thread (workflow: create-thread)
- [ ] PUT `/threads/:id` → Update thread (workflow: update-thread)
- [ ] DELETE `/threads/:id` → Delete thread (cascade delete posts)
- [ ] PUT `/threads/:id/lock` → Lock/unlock thread (workflow: lock-thread)
- [ ] PUT `/threads/:id/pin` → Pin/unpin thread

**Post Routes** (Public):
- [ ] GET `/threads/:threadId/posts` → List posts in thread (paginated)

**Post Routes** (Authenticated):
- [ ] POST `/threads/:threadId/posts` → Create post (workflow: create-post)
- [ ] PUT `/threads/:threadId/posts/:id` → Update own post (workflow: update-post)
- [ ] DELETE `/threads/:threadId/posts/:id` → Delete post (workflow: delete-post)
- [ ] POST `/posts/:id/flag` → Flag post (workflow: flag-post)

**Moderation Routes** (Level 3+):
- [ ] GET `/admin/flagged-posts` → List flagged posts
- [ ] PUT `/admin/flagged-posts/:id` → Approve/reject flagged post
- [ ] GET `/admin/stats` → Forum statistics
- [ ] GET `/admin/audit-log` → Moderation audit log

**Admin Routes** (Level 4+):
- [ ] POST `/categories` → Create category
- [ ] PUT `/categories/:id` → Update category
- [ ] DELETE `/categories/:id` → Delete category

---

## E. Database Query Examples

### List threads in category with pagination:
```typescript
// Query signature
db.forumThread.list({
  filter: { tenantId, categoryId },
  sort: { lastReplyAt: 'desc' },
  limit: 20,
  offset: (page - 1) * 20
})
```

### Get thread with related data:
```typescript
// With joins (if supported)
db.forumThread.findUnique({
  where: { id: threadId, tenantId },
  include: {
    category: true,
    author: true,
    posts: {
      take: 10,
      orderBy: { createdAt: 'asc' }
    }
  }
})
```

### Check ownership for ACL:
```typescript
// In workflow
const post = await db.forumPost.findUnique({
  where: { id: postId, tenantId }
})
const canUpdate = post.authorId === userId || userLevel >= 3
```

---

## F. Validation Rules Template

### Thread Creation:
```json
{
  "categoryId": "required|exists:categories|string",
  "title": "required|string|minLength:3|maxLength:200",
  "content": "required|string|minLength:10|maxLength:5000"
}
```

### Post Creation:
```json
{
  "content": "required|string|minLength:3|maxLength:5000"
}
```

### Category Creation:
```json
{
  "name": "required|string|minLength:3|maxLength:100|unique:categories",
  "description": "string|maxLength:500",
  "icon": "string|maxLength:50",
  "parentId": "exists:categories|nullable"
}
```

### Flag Post:
```json
{
  "reason": "required|string|minLength:10|maxLength:500"
}
```

---

## Conclusion

Use these templates to:
1. Create missing page component JSON files
2. Generate missing workflow JSON scripts
3. Implement sub-components (post_card, etc.)
4. Define API routes and handlers

All files follow the **95% data / 5% code** principle and use JSON Script v2.2.0 for workflows.
