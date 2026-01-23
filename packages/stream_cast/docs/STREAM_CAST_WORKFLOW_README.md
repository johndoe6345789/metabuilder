# Stream Cast Workflow Update - Documentation Index

**Project**: Stream Cast (stream_cast package)
**Scope**: Update 4 workflows to n8n compliance standard
**Status**: Ready for Implementation
**Created**: 2026-01-22

---

## 📚 Documentation Structure

This update includes comprehensive documentation across multiple levels. Select the document that matches your needs:

### 1️⃣ **For Quick Implementation**
→ **[STREAM_CAST_WORKFLOW_QUICK_REFERENCE.md](./STREAM_CAST_WORKFLOW_QUICK_REFERENCE.md)**
- 1-page fast lookup reference
- Copy-paste templates for connections, fields, tags
- Before/after examples
- Validation checklist
- Common mistakes and fixes

**Read this if**: You want to implement the changes quickly without reading extensive docs

---

### 2️⃣ **For Complete Implementation Plan**
→ **[STREAM_CAST_WORKFLOW_UPDATE_PLAN.md](./STREAM_CAST_WORKFLOW_UPDATE_PLAN.md)**
- Executive summary with compliance scoring
- Current state assessment
- Complete workflow specifications for all 4 workflows
- Updated JSON examples with all fields
- Detailed validation checklist
- Implementation steps (7 phases)
- Rollback plan
- Testing strategy
- Success criteria

**Read this if**: You're leading the implementation or need to understand the complete scope

---

### 3️⃣ **For Technical Deep Dive**
→ **[STREAM_CAST_WORKFLOW_TECHNICAL_DETAILS.md](./STREAM_CAST_WORKFLOW_TECHNICAL_DETAILS.md)**
- Architecture overview with system diagrams
- Complete JSON specifications for all 4 workflows
- Multi-tenant implementation details (with examples)
- Connection graph analysis (DAG verification)
- Node type registry with specifications
- Parameter specifications
- Edge cases & error handling scenarios
- Performance considerations
- Database indexing requirements

**Read this if**: You're doing code review, architecture validation, or deep technical work

---

## 📋 Quick Navigation by Role

### **Developer (Implementing the Changes)**
1. Read: STREAM_CAST_WORKFLOW_QUICK_REFERENCE.md (5 min)
2. Copy templates from there
3. Update 4 workflow files
4. Run validation commands
5. Create PR

### **Code Reviewer**
1. Read: STREAM_CAST_WORKFLOW_UPDATE_PLAN.md (15 min) - Validation Checklist section
2. Read: STREAM_CAST_WORKFLOW_TECHNICAL_DETAILS.md (20 min) - Multi-Tenant Implementation Details
3. Review updated JSON against examples
4. Verify multi-tenant filtering in all operations
5. Approve or request changes

### **Project Lead / Architect**
1. Read: STREAM_CAST_WORKFLOW_UPDATE_PLAN.md (30 min) - Full document
2. Skim: STREAM_CAST_WORKFLOW_TECHNICAL_DETAILS.md (15 min) - Architecture section
3. Review timeline and resource allocation
4. Approve implementation approach
5. Monitor progress against schedule

### **DevOps / Operations**
1. Read: STREAM_CAST_WORKFLOW_UPDATE_PLAN.md (20 min) - Timeline and Deployment
2. Prepare environment for testing
3. Set up monitoring for workflows
4. Coordinate with development for deployment

---

## 🎯 The 4 Workflows at a Glance

### Stream Subscribe (`stream-subscribe.json`)
- **Purpose**: User subscribes to live stream
- **Nodes**: 4 (validate → fetch → create → setup SSE)
- **Execution**: Linear
- **Key Update**: Add id, versionId, tenantId, tags, explicit connections
- **New Fields to Add**: 6

### Stream Unsubscribe (`stream-unsubscribe.json`)
- **Purpose**: User unsubscribes from stream
- **Nodes**: 3 (validate → delete → respond)
- **Execution**: Linear
- **Key Update**: Add id, versionId, tenantId, tags, explicit connections
- **New Fields to Add**: 6

### Scene Transition (`scene-transition.json`)
- **Purpose**: Moderator changes active scene (with broadcast)
- **Nodes**: 6 (validate → auth → fetch → update → emit → respond)
- **Execution**: Linear (sequential)
- **Key Update**: Add id, versionId, tenantId, tags, enhance auth check, explicit connections
- **New Fields to Add**: 6

### Viewer Count Update (`viewer-count-update.json`)
- **Purpose**: Periodically update and broadcast viewer counts
- **Nodes**: 3 (fetch → parallel count → broadcast)
- **Execution**: Sequential with parallel operations
- **Key Update**: Add id, versionId, tenantId, tags, fix parallel task references
- **New Fields to Add**: 6

---

## 📊 Compliance Matrix

| Aspect | Target | Difficulty | Status |
|--------|--------|------------|--------|
| **Workflow IDs** | stream_cast_{name}_{version} | Low | Ready |
| **Version Tracking** | versionId: v1.0.0 | Low | Ready |
| **Multi-Tenant** | tenantId in all filters | Medium | Documented |
| **Timestamps** | createdAt, updatedAt | Low | Ready |
| **Tags** | Domain-specific categorization | Low | Ready |
| **Connections** | Explicit n8n adjacency map | Medium | Documented |
| **Meta** | Description, author, domain | Low | Ready |
| **Authorization** | Scene: level >= 2 | Medium | Documented |

---

## ⏱️ Timeline

| Phase | Duration | Deliverable | Status |
|-------|----------|-------------|--------|
| **Phase 1: Exploration** | 1 day | Analysis, plan approved | ✅ COMPLETE |
| **Phase 2: Subscribe/Unsubscribe** | 1 day | 2 workflows updated | ⏳ PENDING |
| **Phase 3: Scene/Viewer** | 1 day | 2 workflows updated | ⏳ PENDING |
| **Phase 4: Validation** | 0.5 day | All validation passed | ⏳ PENDING |
| **Phase 5: Review & Merge** | 0.5 day | PR approved & merged | ⏳ PENDING |
| **TOTAL** | **3.5 days** | **All workflows production-ready** | ⏳ PENDING |

---

## 🔐 Multi-Tenant Safety (Critical)

### The Core Rule
```
EVERY database operation MUST filter by tenantId
```

### Pattern (Required in ALL workflows)
```json
"filter": {
  "id": "{{ $json.id }}",
  "tenantId": "{{ $context.tenantId }}"
}
```

### Where It's Critical
- ✅ Subscribe: fetch_channel + create_subscription
- ✅ Unsubscribe: delete_subscription (triple-key)
- ✅ Scene: fetch_channel + update_active_scene + broadcast
- ✅ Viewer: fetch_active_streams + parallel tasks

### What Happens Without It
- ❌ Data leakage between tenants
- ❌ Users seeing other tenants' streams
- ❌ Security breach
- ❌ Regulatory violations (SOC2, HIPAA, etc.)

---

## 📦 Required Fields Summary

Add these 6 fields to ALL 4 workflows (at root level):

```json
{
  "id": "stream_cast_{workflow_name}_{version}",
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": ["streaming", "category", ...]
}
```

---

## ✅ Validation Checklist

Before creating a PR, ensure:

- [ ] All 4 workflow files updated
- [ ] All required fields present (id, versionId, tenantId, createdAt, updatedAt, tags)
- [ ] All database operations filter by tenantId
- [ ] Connections object properly mapped (no empty `{}`)
- [ ] Meta object populated with description, author, domain
- [ ] JSON syntax valid (no typos)
- [ ] Node IDs referenced in connections exist
- [ ] No circular connections
- [ ] Authorization checks include tenantId (scene workflow)
- [ ] Event broadcasts scoped to tenant
- [ ] Timestamps in ISO 8601 format
- [ ] Tags accurately describe workflow purpose
- [ ] Schema validation passes: `npx ajv validate`
- [ ] TypeScript check passes: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] E2E tests pass: `npm run test:e2e`

---

## 🚀 Implementation Command Checklist

```bash
# 1. Create feature branch
git checkout -b feat/stream-cast-n8n-compliance

# 2. Update workflow files
# - Edit all 4 JSON files in packages/stream_cast/workflow/

# 3. Validate JSON schema
npx ajv validate -s schemas/n8n-workflow.schema.json \
  packages/stream_cast/workflow/stream-subscribe.json
# Repeat for all 4 files

# 4. Format code
npx prettier --write packages/stream_cast/workflow/*.json

# 5. Type check
npm run typecheck

# 6. Lint
npm run lint

# 7. Build
npm run build

# 8. Test
npm run test:e2e

# 9. Commit
git add packages/stream_cast/workflow/
git commit -m "feat(stream_cast): update workflows to n8n compliance standard

- Add id, versionId, tenantId, timestamps to all workflows
- Ensure all database operations filter by tenantId
- Add explicit connection mappings using n8n adjacency format
- Populate meta documentation
- Add categorization tags
- Verify multi-tenant safety for all 4 workflows

Closes #XXXX"

# 10. Push
git push origin feat/stream-cast-n8n-compliance
```

---

## 🔗 Related Documentation

### Internal References
- `/docs/N8N_COMPLIANCE_AUDIT.md` - Compliance audit framework
- `/docs/CLAUDE.md` - Development principles (multi-tenant, JSON-first)
- `/docs/AGENTS.md` - Domain-specific rules
- `/schemas/n8n-workflow.schema.json` - N8N specification

### Package Files
- `packages/stream_cast/package.json` - Package metadata
- `packages/stream_cast/workflow/*.json` - Target workflow files

### Schema Files
- `/schemas/n8n-workflow.schema.json` - Workflow schema spec
- `/schemas/n8n-workflow-validation.schema.json` - Validation rules

---

## 📞 Support & Questions

### Common Questions

**Q: Do I need to worry about backwards compatibility?**
A: These are internal workflows. No public API changes. Safe to update.

**Q: What if a node type doesn't exist?**
A: All node types (metabuilder.validate, metabuilder.database, etc.) must exist in the workflow executor registry. Contact platform team if unsure.

**Q: Can I use different connection formats?**
A: No. Use the n8n adjacency map format: `{ nodeId: { main: [[{ node: "target", index: 0 }]] } }`

**Q: What if I need different field values?**
A: Follow the patterns exactly. These have been reviewed and approved.

---

## 📝 Document Organization

```
docs/
├── STREAM_CAST_WORKFLOW_README.md              ← You are here
├── STREAM_CAST_WORKFLOW_QUICK_REFERENCE.md     ← Quick lookup
├── STREAM_CAST_WORKFLOW_UPDATE_PLAN.md         ← Full plan
└── STREAM_CAST_WORKFLOW_TECHNICAL_DETAILS.md   ← Deep dive
```

---

## 📊 Success Metrics

### Before Update
- Compliance Score: 35/100
- Missing Fields: id, versionId, tenantId, createdAt, updatedAt
- Multi-tenant Safety: Partial
- Documentation: Minimal

### After Update
- Compliance Score: 100/100 ✅
- All Required Fields: Present ✅
- Multi-tenant Safety: Complete ✅
- Documentation: Comprehensive ✅
- Test Coverage: 99%+ ✅

---

## 🎓 Learning Resources

### Understanding n8n Workflows
- n8n workflow specification: [schemas/n8n-workflow.schema.json](../schemas/n8n-workflow.schema.json)
- Compliance audit framework: [docs/N8N_COMPLIANCE_AUDIT.md](./N8N_COMPLIANCE_AUDIT.md)

### Understanding Multi-Tenant Architecture
- Multi-tenant guide: [docs/MULTI_TENANT_AUDIT.md](./MULTI_TENANT_AUDIT.md)
- Development principles: [docs/CLAUDE.md](./CLAUDE.md)

### Understanding JSON Script
- JSON Script v2.2.0 spec: [schemas/package-schemas/script_schema.json](../schemas/package-schemas/script_schema.json)

---

## 👤 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-22 | MetaBuilder Team | Initial creation |

---

## 🔄 Next Steps

1. **Immediate**: Review appropriate documentation based on your role
2. **Day 1**: Complete implementation using templates
3. **Day 2**: Run validation and testing
4. **Day 3**: Create PR with comprehensive description
5. **Day 4**: Code review and approval
6. **Day 5**: Merge to main branch

---

**Status**: Ready for Implementation
**Last Updated**: 2026-01-22
**Target Completion**: 2026-01-25
**Owner**: MetaBuilder Team
