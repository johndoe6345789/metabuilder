# TLA+ Specifications Quick Reference

## Overview

This document provides a quick reference for working with MetaBuilder's TLA+ specifications.

## Specifications Available

| Module | Purpose | Key Features |
|--------|---------|--------------|
| `metabuilder.tla` | Core system | Permissions, multi-tenancy, DBAL, packages |
| `workflow_system.tla` | Workflow engine | Template management, execution, scheduling, retries |
| `collaboration.tla` | Real-time collab | Concurrent editing, comments, mentions, presence |
| `integrations.tla` | Integration ecosystem | Webhooks, OAuth, API keys, rate limiting |

## Running TLA+ Model Checker

### Prerequisites

Download TLA+ tools:
```bash
wget https://github.com/tlaplus/tlaplus/releases/download/v1.8.0/tla2tools.jar
```

### Syntax Validation

Check if a specification is syntactically correct:

```bash
java -cp tla2tools.jar tla2sany.SANY spec/workflow_system.tla
java -cp tla2tools.jar tla2sany.SANY spec/collaboration.tla
java -cp tla2tools.jar tla2sany.SANY spec/integrations.tla
```

Expected output for valid specs:
```
Semantic processing of module <name>
Linting of module <name>
```

### Model Checking

Run the model checker to verify properties:

```bash
# Check workflow system (may take several minutes)
java -cp tla2tools.jar tlc2.TLC spec/workflow_system.tla -config spec/workflow_system.cfg

# Check collaboration system
java -cp tla2tools.jar tlc2.TLC spec/collaboration.tla -config spec/collaboration.cfg

# Check integrations system
java -cp tla2tools.jar tlc2.TLC spec/integrations.tla -config spec/integrations.cfg
```

### Model Checking Options

```bash
# Use multiple worker threads for faster checking
java -cp tla2tools.jar tlc2.TLC -workers 4 spec/workflow_system.tla -config spec/workflow_system.cfg

# Generate detailed statistics
java -cp tla2tools.jar tlc2.TLC -coverage 1 spec/workflow_system.tla -config spec/workflow_system.cfg

# Simulate execution instead of exhaustive checking (faster)
java -cp tla2tools.jar tlc2.TLC -simulate spec/workflow_system.tla -config spec/workflow_system.cfg
```

## Understanding Model Checker Output

### Success
```
TLC finished checking the model.
States found: 12345
Distinct states: 10000
```

### Invariant Violation
```
Error: Invariant TenantIsolation is violated.
The behavior up to this point is:
State 1: <initial state>
State 2: <transition>
...
```
This indicates a bug in the specification or a potential implementation issue.

### Deadlock
```
Error: Deadlock reached.
```
This means the system reached a state where no actions are possible, but liveness properties are unsatisfied.

## Key Properties by Module

### Workflow System

**Safety Properties:**
- `GodOnlyTemplateCreation`: Only Level 5+ users can create workflow templates
- `AdminOnlyExecution`: Only Level 4+ users can execute workflows
- `TenantIsolation`: Workflows are isolated by tenant
- `ConcurrencyLimit`: Per-tenant execution limits are enforced
- `RetryLimit`: Failed steps don't retry indefinitely
- `DependencyEnforcement`: Step dependencies are respected

**Liveness Properties:**
- `EventualStepExecution`: Pending steps eventually execute
- `EventualCompletion`: Running workflows eventually complete or fail
- `EventualScheduleTrigger`: Scheduled workflows eventually trigger

### Collaboration System

**Safety Properties:**
- `DocumentTenantIsolation`: Editors can only access documents in their tenant
- `ConcurrentEditorLimit`: Maximum concurrent editors per document enforced
- `CommentTenantConsistency`: Comments belong to document's tenant
- `MentionTenantIsolation`: Mentions stay within tenant boundaries
- `NotificationLimit`: Pending notifications don't exceed limits
- `DisconnectedNotEditing`: Disconnected users automatically stop editing

**Liveness Properties:**
- `EventualNotificationHandling`: Notifications eventually get read or cleared
- `EventualMentionRead`: Mentioned users eventually see their mentions
- `EventualStopEditing`: Active editors eventually stop or disconnect

### Integration Ecosystem

**Safety Properties:**
- `AdminOnlyIntegrationManagement`: Only Level 4+ users manage integrations
- `WebhookTenantLimit`: Webhooks per tenant don't exceed limits
- `APIKeyUserLimit`: API keys per user don't exceed limits
- `RateLimitEnforcement`: API calls respect rate limits
- `WebhookTenantIsolation`: Webhooks isolated by tenant
- `TokenTenantConsistency`: OAuth tokens match app tenants

**Liveness Properties:**
- `EventualDeliveryCompletion`: Webhook deliveries eventually complete or fail
- `EventualRetryOrFail`: Failed deliveries retry or permanently fail
- `EventualExpiration`: Expired API keys eventually marked as expired

## Modifying Specifications

### Adding a New Operation

1. Define the operation in the appropriate section:
```tla
\* User performs new action
NewAction(user, params) ==
    /\ <preconditions>
    /\ <state updates>
    /\ UNCHANGED <unchanged variables>
```

2. Add to the Next state relation:
```tla
Next ==
    \/ ... existing actions ...
    \/ \E u \in Users, p \in Params: NewAction(u, p)
```

3. Add relevant invariants if needed
4. Re-run model checker to verify

### Adjusting State Space Constraints

Edit the `.cfg` file to change the model size:

```
CONSTANTS
    Users = {u1, u2, u3, u4}     # Increase from 3 to 4
    MaxRetries = 5                # Increase retry limit
```

Or adjust constraints to explore larger state spaces:
```
CONSTRAINT
    Len(auditLog) <= 20           # Increase from 10
    Cardinality(instances) <= 10  # Increase from 5
```

**Warning**: Larger state spaces take exponentially longer to check!

## Common Issues

### "State space too large"
- Reduce constants in `.cfg` file
- Add or tighten CONSTRAINT clauses
- Use simulation mode instead: `-simulate`

### "Deadlock found"
- Check that all actions have proper fairness conditions
- Verify that the system can always make progress
- Review the deadlock trace to identify the stuck state

### "Invariant violation"
- Review the error trace step by step
- Identify which action caused the violation
- Check if the preconditions are sufficient
- Verify that state updates maintain the invariant

## Integration with Development

### Before Implementation
1. Review the relevant TLA+ specification
2. Understand the state transitions and invariants
3. Identify edge cases from the formal model
4. Use properties as test requirements

### During Implementation
1. Map specification states to code structures
2. Implement invariant checks as assertions
3. Use temporal properties to guide test scenarios
4. Validate multi-tenant isolation per spec

### After Implementation
1. Run property-based tests matching TLA+ properties
2. Test edge cases identified in the specification
3. Verify that implementation maintains all invariants
4. Update specification if design changes

## Resources

- **TLA+ Homepage**: https://lamport.azurewebsites.net/tla/tla.html
- **Learn TLA+**: https://learntla.com/
- **TLA+ Video Course**: https://lamport.azurewebsites.net/video/videos.html
- **Specifying Systems (book)**: https://lamport.azurewebsites.net/tla/book.html
- **TLA+ Examples**: https://github.com/tlaplus/Examples

## Support

For questions about the specifications:
1. Review the inline comments in the `.tla` files
2. Check the main `spec/README.md` for detailed documentation
3. Consult the architecture docs in `docs/architecture/`
4. Run the model checker to explore system behavior

---

*Last Updated*: 2025-12-27
