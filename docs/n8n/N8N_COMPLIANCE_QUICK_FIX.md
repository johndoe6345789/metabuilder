# N8N Compliance Quick Fix Guide

**Compliance Status**: 60/100 → 84/100 (Phase 1 fixes)
**Fix Time**: 2-3 hours for all blocking issues

---

## The Problems

### Problem 1: server.json Corrupted Connections
```json
// ❌ WRONG - Lines 127-193
"connections": {
  "Create App": {
    "main": {
      "0": [
        {
          "node": "[object Object]",  // CORRUPTED!
          "type": "main",
          "index": 0
        }
      ]
    }
  }
}
```

**Why**: JSON serialization converted object to string `[object Object]`

---

### Problem 2: Missing Connections (5 Workflows)
```json
// ❌ WRONG - All workflows except server.json
"connections": {}  // EMPTY!
```

**Why**: Connections object not populated; execution order undefined

---

### Problem 3: Control Flow in Parameters (Anti-Pattern)
```json
// ❌ WRONG - auth_login.json
{
  "id": "validate_fields",
  "parameters": {
    "condition": "$credentials.username == null || $credentials.password == null",
    "then": "error_invalid_request",  // References node ID!
    "else": "verify_password"         // References node ID!
  }
}

// Should be in connections, not parameters
```

**Why**: Execution flow should be declarative in connections object

---

## The Solution

### 1. Understand the Connection Format

```json
{
  "connections": {
    "SourceNodeName": {                    // Node's human name
      "main": {                            // Output type (always "main")
        "0": [                             // Output index (false/success)
          {
            "node": "TargetNodeName",      // Target node's human name
            "type": "main",                // Connection type
            "index": 0                     // Target input index
          }
        ],
        "1": [                             // Output index (true/error)
          {
            "node": "ErrorNodeName",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

**Key Points**:
- Use **node `name`** (not `id`) as keys
- Each source node maps to outputs (main)
- Each output has indices (0 = false/success, 1 = true/error)
- Each index contains array of target connections

---

### 2. Fix server.json (Sequential Flow)

**Execution Order**: Create App → Register Publish → Register Download → Register Latest → Register Versions → Register Login → Start Server

```json
{
  "connections": {
    "Create App": {
      "main": {
        "0": [
          {
            "node": "Register Publish",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Register Publish": {
      "main": {
        "0": [
          {
            "node": "Register Download",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Register Download": {
      "main": {
        "0": [
          {
            "node": "Register Latest",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Register Latest": {
      "main": {
        "0": [
          {
            "node": "Register Versions",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Register Versions": {
      "main": {
        "0": [
          {
            "node": "Register Login",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Register Login": {
      "main": {
        "0": [
          {
            "node": "Start Server",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

---

### 3. Fix auth_login.json (With Conditional Branching)

**Execution Order**:
```
Parse Body → Validate Fields
           ├→ (false) Error Invalid Request
           └→ (true) Verify Password
                     → Check Verified
                     ├→ (true) Error Unauthorized
                     └→ (false) Generate Token
                               → Respond Success
```

```json
{
  "connections": {
    "Parse Body": {
      "main": {
        "0": [
          {
            "node": "Validate Fields",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Validate Fields": {
      "main": {
        "0": [
          {
            "node": "Error Invalid Request",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Verify Password",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Verify Password": {
      "main": {
        "0": [
          {
            "node": "Check Verified",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Check Verified": {
      "main": {
        "0": [
          {
            "node": "Error Unauthorized",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Generate Token",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Generate Token": {
      "main": {
        "0": [
          {
            "node": "Respond Success",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

**Important Notes**:
- Index `0` = false/success branch
- Index `1` = true/error branch
- Only "Validate Fields" and "Check Verified" have multiple outputs
- Error nodes don't need connections (they terminate flow)

---

### 4. Fix download_artifact.json (With Conditional Branching)

**Execution Order**:
```
Parse Path → Normalize → Get Meta → Check Exists
                                  ├→ (null) Error Not Found
                                  └→ (else) Read Blob
                                           → Check Blob Exists
                                           ├→ (null) Error Blob Missing
                                           └→ (else) Respond Blob
```

```json
{
  "connections": {
    "Parse Path": {
      "main": {
        "0": [{"node": "Normalize", "type": "main", "index": 0}]
      }
    },
    "Normalize": {
      "main": {
        "0": [{"node": "Get Meta", "type": "main", "index": 0}]
      }
    },
    "Get Meta": {
      "main": {
        "0": [{"node": "Check Exists", "type": "main", "index": 0}]
      }
    },
    "Check Exists": {
      "main": {
        "0": [{"node": "Error Not Found", "type": "main", "index": 0}],
        "1": [{"node": "Read Blob", "type": "main", "index": 0}]
      }
    },
    "Read Blob": {
      "main": {
        "0": [{"node": "Check Blob Exists", "type": "main", "index": 0}]
      }
    },
    "Check Blob Exists": {
      "main": {
        "0": [{"node": "Error Blob Missing", "type": "main", "index": 0}],
        "1": [{"node": "Respond Blob", "type": "main", "index": 0}]
      }
    }
  }
}
```

---

### 5. Fix list_versions.json (Simple Conditional)

**Execution Order**:
```
Parse Path → Normalize → Query Index → Check Exists
                                     ├→ (null) Error Not Found
                                     └→ (else) Enrich Versions → Respond Json
```

```json
{
  "connections": {
    "Parse Path": {
      "main": {
        "0": [{"node": "Normalize", "type": "main", "index": 0}]
      }
    },
    "Normalize": {
      "main": {
        "0": [{"node": "Query Index", "type": "main", "index": 0}]
      }
    },
    "Query Index": {
      "main": {
        "0": [{"node": "Check Exists", "type": "main", "index": 0}]
      }
    },
    "Check Exists": {
      "main": {
        "0": [{"node": "Error Not Found", "type": "main", "index": 0}],
        "1": [{"node": "Enrich Versions", "type": "main", "index": 0}]
      }
    },
    "Enrich Versions": {
      "main": {
        "0": [{"node": "Respond Json", "type": "main", "index": 0}]
      }
    }
  }
}
```

---

### 6. Fix resolve_latest.json (Simple Conditional)

**Execution Order**:
```
Parse Path → Normalize → Query Index → Check Exists
                                     ├→ (empty) Error Not Found
                                     └→ (else) Find Latest → Get Meta → Respond Json
```

```json
{
  "connections": {
    "Parse Path": {
      "main": {
        "0": [{"node": "Normalize", "type": "main", "index": 0}]
      }
    },
    "Normalize": {
      "main": {
        "0": [{"node": "Query Index", "type": "main", "index": 0}]
      }
    },
    "Query Index": {
      "main": {
        "0": [{"node": "Check Exists", "type": "main", "index": 0}]
      }
    },
    "Check Exists": {
      "main": {
        "0": [{"node": "Error Not Found", "type": "main", "index": 0}],
        "1": [{"node": "Find Latest", "type": "main", "index": 0}]
      }
    },
    "Find Latest": {
      "main": {
        "0": [{"node": "Get Meta", "type": "main", "index": 0}]
      }
    },
    "Get Meta": {
      "main": {
        "0": [{"node": "Respond Json", "type": "main", "index": 0}]
      }
    }
  }
}
```

---

### 7. Fix publish_artifact.json (Complex Multi-Step)

**Execution Order**:
```
Verify Auth → Check Write Scope → Parse Path
                    ↓
              Normalize → Validate → Compute Digest → Check Exists
                                                     ├→ (exists) Error Exists
                                                     └→ (not) Write Blob → Write Meta → Update Index → Success
```

```json
{
  "connections": {
    "Verify Auth": {
      "main": {
        "0": [{"node": "Check Write Scope", "type": "main", "index": 0}]
      }
    },
    "Check Write Scope": {
      "main": {
        "0": [{"node": "Parse Path", "type": "main", "index": 0}]
      }
    },
    "Parse Path": {
      "main": {
        "0": [{"node": "Normalize", "type": "main", "index": 0}]
      }
    },
    "Normalize": {
      "main": {
        "0": [{"node": "Validate", "type": "main", "index": 0}]
      }
    },
    "Validate": {
      "main": {
        "0": [{"node": "Compute Digest", "type": "main", "index": 0}]
      }
    },
    "Compute Digest": {
      "main": {
        "0": [{"node": "Check Exists", "type": "main", "index": 0}]
      }
    },
    "Check Exists": {
      "main": {
        "0": [{"node": "Error Exists", "type": "main", "index": 0}],
        "1": [{"node": "Write Blob", "type": "main", "index": 0}]
      }
    },
    "Write Blob": {
      "main": {
        "0": [{"node": "Write Meta", "type": "main", "index": 0}]
      }
    },
    "Write Meta": {
      "main": {
        "0": [{"node": "Update Index", "type": "main", "index": 0}]
      }
    },
    "Update Index": {
      "main": {
        "0": [{"node": "Success", "type": "main", "index": 0}]
      }
    }
  }
}
```

---

## Validation Checklist

After applying fixes, verify each workflow:

- [ ] `connections` object is NOT empty
- [ ] All node names in connections exist as nodes with that name
- [ ] Sequential nodes chain together: A → B → C
- [ ] Conditional nodes have both index 0 and 1 (if applicable)
- [ ] Error nodes are targets, not sources (dead ends)
- [ ] No "[object Object]" strings in connections
- [ ] All node `name` fields are unique within workflow

**Test Command**:
```bash
npm run validate:workflows
# or manually: npm --prefix workflow/executor/python run validate
```

---

## Common Mistakes to Avoid

### ❌ Using node `id` instead of `name`
```json
// WRONG
"node": "validate_fields"  // This is the ID

// CORRECT
"node": "Validate Fields"  // This is the name
```

### ❌ Forgetting conditional branches
```json
// WRONG - Only one output index
"Check Exists": {
  "main": {
    "0": [{"node": "Read Blob", ...}]
    // Missing index 1 for error case!
  }
}

// CORRECT
"Check Exists": {
  "main": {
    "0": [{"node": "Error Not Found", ...}],
    "1": [{"node": "Read Blob", ...}]
  }
}
```

### ❌ Leaving connections empty
```json
// WRONG
"connections": {}

// CORRECT - Define all flows
"connections": {
  "Node A": { "main": { "0": [...] } },
  "Node B": { "main": { "0": [...] } }
}
```

---

## File Locations

```
/packagerepo/backend/workflows/
├── server.json                  (FIX #1: server serialization)
├── auth_login.json             (FIX #2: add connections)
├── download_artifact.json      (FIX #3: add connections)
├── list_versions.json          (FIX #4: add connections)
├── resolve_latest.json         (FIX #5: add connections)
└── publish_artifact.json       (FIX #6: add connections)
```

---

## Next Steps

1. **Apply fixes** using the patterns above (2-3 hours)
2. **Test execution** with Python executor
3. **Add optional properties** (Phase 2 - see full report)
4. **Validate with schema** using `/schemas/n8n-workflow.schema.json`
5. **Create migration script** for future workflows

---

**Full Report**: `/docs/UI_SCHEMA_EDITOR_N8N_COMPLIANCE_REPORT.md`

