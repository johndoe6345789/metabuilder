# MetaBuilder Formal Specification

This directory contains the formal TLA+ specification for the MetaBuilder system, a data-driven, multi-tenant platform with hierarchical permissions and declarative components.

## Overview

The specification models the core invariants and behaviors of MetaBuilder, including:

- **6-Level Permission System**: Hierarchical access control (Public → User → Moderator → Admin → God → Supergod)
- **Multi-Tenant Data Isolation**: Strict separation of data between tenants
- **Database Abstraction Layer (DBAL)**: Query processing with security guarantees
- **Package Management**: Installation, enabling, and disabling of feature packages
- **Audit Logging**: Complete tracking of privileged operations

## Files

### `metabuilder.tla`

The main TLA+ specification file that defines:

- **State Variables**: System state including users, permissions, tenants, packages, and DBAL
- **Permission Model**: Hierarchical levels with inheritance
- **Operations**: Data access, user management, package operations, DBAL transitions
- **Safety Properties**: Invariants that must always hold
  - `TenantIsolation`: Users can only access data in their tenant
  - `PermissionEnforcement`: Operations require appropriate permission levels
  - `DataConsistency`: No data overlap between tenants
  - `PackageConsistency`: Installed packages are in valid states
  - `DBALSafety`: No dangerous operations in error state
  - `AuditCompleteness`: All privileged operations are logged
- **Liveness Properties**: Things that eventually happen
  - `EventualProcessing`: Queries eventually complete
  - `EventualRecovery`: DBAL recovers from errors
  - `EventualPackageInstall`: Package installations complete

### `metabuilder.cfg`

Configuration file for the TLC model checker that specifies:

- Constants for model checking (users, tenants, packages, records)
- Invariants to check
- Temporal properties to verify
- State space constraints for bounded model checking

## Key Concepts

### Permission Levels

The system enforces a strict hierarchy:

```
Level 1 (Public)    → Unauthenticated, read-only access
Level 2 (User)      → Authenticated users, can create/modify own content
Level 3 (Moderator) → Content moderation capabilities
Level 4 (Admin)     → User management, package installation, tenant administration
Level 5 (God)       → Advanced workflows, system scripting
Level 6 (Supergod)  → Complete system control
```

Higher levels inherit all permissions from lower levels.

### Multi-Tenancy

Every user belongs to exactly one tenant, and:

- Users can only access data within their tenant
- All database queries are automatically filtered by `tenantId`
- Tenant data is completely isolated from other tenants
- Package installations are per-tenant

### DBAL (Database Abstraction Layer)

The specification models the DBAL as a state machine with states:

- `ready`: Ready to accept queries
- `processing`: Actively executing a query
- `error`: Encountered an error (can recover)

The DBAL enforces:

- Permission checks before query execution
- Row-level security
- Audit logging
- Eventual consistency

### Package System

Packages are self-contained feature modules that can be:

- Installed by admins (Level 4+)
- Enabled or disabled per-tenant
- Tracked through state transitions: `available` → `installing` → `installed` ↔ `disabled`

## Using the Specification

### Prerequisites

Install the TLA+ Toolbox or command-line tools:
- [TLA+ Toolbox](https://lamport.azurewebsites.net/tla/toolbox.html) (GUI)
- [TLA+ Tools](https://github.com/tlaplus/tlaplus) (command-line)

### Model Checking

1. **With TLA+ Toolbox**:
   - Open the Toolbox
   - Create a new specification and add `metabuilder.tla`
   - Create a new model based on `metabuilder.cfg`
   - Run the model checker (TLC)

2. **With Command Line**:
   ```bash
   # Check syntax
   java -cp tla2tools.jar tla2sast.SANY spec/metabuilder.tla
   
   # Run model checker
   java -cp tla2tools.jar tlc2.TLC spec/metabuilder.tla -config spec/metabuilder.cfg
   ```

### Adjusting the Model

The constants in `metabuilder.cfg` can be adjusted to explore different scenarios:

```
CONSTANTS
    Users = {u1, u2, u3}      # Add more users
    Tenants = {t1, t2, t3}    # Add more tenants
    Packages = {p1, p2}       # Add more packages
    DataRecords = {r1, r2}    # Add more records
    MaxLevel = 6               # Fixed at 6 levels
```

**Note**: Larger constants will increase the state space exponentially. Use constraints to bound the search:

```
CONSTRAINT
    Len(auditLog) <= 10
    Cardinality(activeQueries) <= 5
```

## Properties Verified

### Safety (Invariants)

These properties must hold in every reachable state:

1. **Type Safety**: All variables have correct types
2. **Tenant Isolation**: Cross-tenant access is impossible
3. **Permission Enforcement**: Operations require appropriate levels
4. **Data Consistency**: No data duplication across tenants
5. **Package State Consistency**: Packages have valid states
6. **DBAL Safety**: No dangerous operations during errors
7. **Audit Completeness**: All privileged operations are logged

### Liveness (Temporal Properties)

These properties describe what eventually happens:

1. **Query Completion**: Active queries eventually complete
2. **Error Recovery**: DBAL recovers from error states
3. **Package Installation**: Package installs eventually complete

## Understanding Results

### Invariant Violations

If TLC finds an invariant violation, it will show:
- The violated invariant
- A trace of actions leading to the violation
- The state where the violation occurred

This helps identify:
- Permission bypass vulnerabilities
- Tenant isolation breaches
- Data consistency issues
- Missing audit log entries

### Deadlocks

If TLC finds a deadlock (state with no enabled actions and liveness properties unfulfilled), review:
- Whether queries can complete
- Whether DBAL can recover from errors
- Whether packages can finish installing

## Extending the Specification

To add new features:

1. **Add State Variables**: Define new variables in the `VARIABLES` section
2. **Update TypeOK**: Add type constraints for new variables
3. **Define Operations**: Add new actions in the style of existing operations
4. **Update Next**: Include new actions in the next-state relation
5. **Add Invariants**: Define safety properties for new features
6. **Add to Spec**: Include weak fairness conditions if needed

Example: Adding workflow execution:

```tla
VARIABLES
    workflows,          \* Tenant -> Set of workflows
    runningWorkflows    \* Set of currently executing workflows

\* God can execute workflows (requires Level 5+)
ExecuteWorkflow(user, workflow) ==
    /\ CanPerformAction(user, userTenants[user], Level.God)
    /\ workflow \in workflows[userTenants[user]]
    /\ runningWorkflows' = runningWorkflows \cup {workflow}
    /\ ...
```

## Architecture Alignment

This specification aligns with the MetaBuilder architecture documentation:

- `docs/architecture/security-docs/5-level-system.md` → Permission model (extended to 6 levels)
- `docs/architecture/data/data-driven-architecture.md` → Package system
- `dbal/README.md` → DBAL state machine and security model
- `README.md` → Multi-tenant system

## References

- [TLA+ Homepage](https://lamport.azurewebsites.net/tla/tla.html)
- [Learn TLA+](https://learntla.com/)
- [TLA+ Video Course](https://lamport.azurewebsites.net/video/videos.html)
- [Specifying Systems (book)](https://lamport.azurewebsites.net/tla/book.html)
- [TLA+ Examples](https://github.com/tlaplus/Examples)

## Contributing

When modifying the system implementation:

1. Update this specification to reflect changes
2. Run the model checker to verify properties still hold
3. Update the configuration if new constants are needed
4. Document any new invariants or properties
5. Update this README with relevant changes

The specification serves as:
- **Documentation**: Precise description of system behavior
- **Design Tool**: Explore design decisions before implementation
- **Verification**: Prove critical properties hold
- **Regression Prevention**: Detect when changes violate invariants

---

*Last Updated*: 2025-12-27  
*TLA+ Version*: Compatible with TLA+ 2.x  
*MetaBuilder Version*: Iteration 25+
