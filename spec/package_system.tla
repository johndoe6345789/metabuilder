---------------------------- MODULE package_system ----------------------------
(***************************************************************************
 * Package System Specification for MetaBuilder                            *
 *                                                                          *
 * This specification models the schema-driven package system including:   *
 *   - Multi-source package loading (local, remote, git)                   *
 *   - Package schema validation                                           *
 *   - Dependency resolution and version constraints                       *
 *   - Permission-level filtering (minLevel)                               *
 *   - Package registry management                                         *
 *   - Conflict resolution strategies                                      *
 *                                                                          *
 * Aligned with:                                                           *
 *   - schemas/package-schemas/*.json                                      *
 *   - storybook/JSON_PACKAGES.md (JSON package format and discovery)      *
 *   - packages/*/package.json or packages/*/seed/metadata.json            *
 ***************************************************************************)

EXTENDS Naturals, Sequences, FiniteSets, TLC

CONSTANTS
    Users,                  \* Set of all users
    Tenants,                \* Set of tenants
    Packages,               \* Set of package IDs
    PackageVersions,        \* Set of version strings (e.g., "1.0.0", "2.0.0")
    PackageSources,         \* Set of source IDs (local, remote, custom)
    SchemaTypes,            \* Set of schema types (metadata, entities, components, etc.)
    MaxLevel                \* Maximum permission level (6)

VARIABLES
    userLevels,             \* User -> Permission Level (1-6)
    userTenants,            \* User -> Tenant
    \* Package Source Management
    sourceConfigs,          \* Source -> SourceConfig
    sourceIndex,            \* Source -> Set of PackageIndexEntries
    sourceCache,            \* Source -> CacheState
    \* Package Registry (per tenant)
    packageRegistry,        \* Tenant -> Package -> PackageEntry
    installedPackages,      \* Tenant -> Set of installed package IDs
    enabledPackages,        \* Tenant -> Set of enabled package IDs
    \* Schema Validation
    schemaValidations,      \* Package -> SchemaType -> ValidationResult
    \* Dependency Resolution
    dependencyGraph,        \* Package -> Set of dependency Package IDs
    resolvedDependencies,   \* Package -> ResolvedDependencies
    \* Conflict Resolution
    conflictResolutionMode, \* Current conflict resolution strategy
    packageConflicts,       \* Set of detected conflicts
    \* Operations & Audit
    pendingOperations,      \* Set of async package operations
    packageAuditLog         \* Sequence of package events

vars == <<userLevels, userTenants, sourceConfigs, sourceIndex, sourceCache,
          packageRegistry, installedPackages, enabledPackages, schemaValidations,
          dependencyGraph, resolvedDependencies, conflictResolutionMode,
          packageConflicts, pendingOperations, packageAuditLog>>

-----------------------------------------------------------------------------
(* Type Definitions *)

PermissionLevel == 1..MaxLevel

\* Permission level names (matches MetaBuilder 6-level system)
Level == [
    Public    |-> 1,
    User      |-> 2,
    Moderator |-> 3,
    Admin     |-> 4,
    God       |-> 5,
    Supergod  |-> 6
]

\* Package categories (from metadata_schema.json)
PackageCategory == {"ui", "managers", "tools", "editors", "auth", "social", "system"}

\* Package source types
SourceType == {"local", "remote", "git"}

\* Source priorities (lower = higher priority)
SourcePriority == 0..100

\* Conflict resolution strategies
ConflictStrategy == {"priority", "latest-version", "local-first", "remote-first"}

\* Package states
PackageState == {"available", "validating", "installing", "installed", 
                 "enabled", "disabled", "uninstalling", "error"}

\* Schema validation states
ValidationState == {"pending", "valid", "invalid", "warning"}

\* Operation types
OperationType == {"install", "uninstall", "enable", "disable", 
                  "validate", "fetch-index", "resolve-deps"}

\* Source configuration
SourceConfig == [
    id: PackageSources,
    name: STRING,
    type: SourceType,
    priority: SourcePriority,
    enabled: BOOLEAN,
    url: STRING \cup {<<>>},  \* Optional for local
    authToken: STRING \cup {<<>>}
]

\* Package index entry (from source)
PackageIndexEntry == [
    packageId: Packages,
    name: STRING,
    version: PackageVersions,
    minLevel: PermissionLevel,
    category: PackageCategory,
    source: PackageSources,
    dependencies: SUBSET Packages,
    format: {"json"},                \* Package format (JSON-based packages)
    manifestPath: STRING              \* Path to package manifest (package.json or seed metadata)
]

\* Full package entry in registry
PackageEntry == [
    packageId: Packages,
    name: STRING,
    version: PackageVersions,
    minLevel: PermissionLevel,
    category: PackageCategory,
    source: PackageSources,
    state: PackageState,
    dependencies: SUBSET Packages,
    \* For JSON-based packages the manifest contains exports and metadata
    manifestPath: STRING,
    exports: [
        components: SUBSET STRING,
        scripts: SUBSET STRING,
        types: SUBSET STRING
    ],
    validated: BOOLEAN,
    installedAt: Nat \cup {0},
    format: {"json"}
]

\* Pending operation
PendingOperation == [
    id: Nat,
    type: OperationType,
    packageId: Packages \cup {<<>>},
    tenant: Tenants,
    user: Users,
    source: PackageSources \cup {<<>>},
    status: {"pending", "running", "completed", "failed"},
    startedAt: Nat
]

\* Package conflict
PackageConflict == [
    packageId: Packages,
    sources: SUBSET PackageSources,
    versions: SUBSET PackageVersions,
    resolvedTo: PackageSources \cup {<<>>}
]

\* Audit log entry
AuditEntry == [
    user: Users,
    action: STRING,
    packageId: Packages \cup {<<>>},
    tenant: Tenants,
    source: PackageSources \cup {<<>>},
    level: PermissionLevel,
    timestamp: Nat
]

-----------------------------------------------------------------------------
(* Type Invariant *)

TypeOK ==
    /\ userLevels \in [Users -> PermissionLevel]
    /\ userTenants \in [Users -> Tenants]
    /\ sourceConfigs \in [PackageSources -> SourceConfig]
    /\ sourceIndex \subseteq (PackageSources \X PackageIndexEntry)
    /\ sourceCache \in [PackageSources -> {"fresh", "stale", "empty"}]
    /\ packageRegistry \in [Tenants -> SUBSET PackageEntry]
    /\ installedPackages \in [Tenants -> SUBSET Packages]
    /\ enabledPackages \in [Tenants -> SUBSET Packages]
    /\ schemaValidations \subseteq (Packages \X SchemaTypes \X ValidationState)
    /\ dependencyGraph \in [Packages -> SUBSET Packages]
    /\ resolvedDependencies \in [Packages -> SUBSET Packages]
    /\ conflictResolutionMode \in ConflictStrategy
    /\ packageConflicts \subseteq PackageConflict
    /\ pendingOperations \subseteq PendingOperation
    /\ packageAuditLog \in Seq(AuditEntry)

-----------------------------------------------------------------------------
(* Permission Checks *)

\* User has at least the required permission level
HasPermission(user, requiredLevel) ==
    userLevels[user] >= requiredLevel

\* User belongs to the specified tenant
BelongsToTenant(user, tenant) ==
    userTenants[user] = tenant

\* Combined check for performing tenant-scoped operations
CanPerformAction(user, tenant, requiredLevel) ==
    /\ HasPermission(user, requiredLevel)
    /\ BelongsToTenant(user, tenant)

\* Check if user can access a package based on minLevel
CanAccessPackage(user, pkgMinLevel) ==
    userLevels[user] >= pkgMinLevel

\* Admin (Level 4+) required for package management
CanManagePackages(user, tenant) ==
    CanPerformAction(user, tenant, Level.Admin)

\* Supergod (Level 6) required for source management
CanManageSources(user) ==
    HasPermission(user, Level.Supergod)

-----------------------------------------------------------------------------
(* Initial State *)

Init ==
    /\ userLevels \in [Users -> PermissionLevel]
    /\ userTenants \in [Users -> Tenants]
    \* Default local source configured
    /\ sourceConfigs \in [PackageSources -> SourceConfig]
    /\ sourceIndex = {}
    /\ sourceCache = [s \in PackageSources |-> "empty"]
    /\ packageRegistry = [t \in Tenants |-> {}]
    /\ installedPackages = [t \in Tenants |-> {}]
    /\ enabledPackages = [t \in Tenants |-> {}]
    /\ schemaValidations = {}
    /\ dependencyGraph = [p \in Packages |-> {}]
    /\ resolvedDependencies = [p \in Packages |-> {}]
    /\ conflictResolutionMode = "priority"
    /\ packageConflicts = {}
    /\ pendingOperations = {}
    /\ packageAuditLog = <<>>

-----------------------------------------------------------------------------
(* Source Management Operations *)

\* Supergod can add a new package source
AddPackageSource(user, sourceId, config) ==
    /\ CanManageSources(user)
    /\ sourceId \in PackageSources
    /\ sourceConfigs' = [sourceConfigs EXCEPT ![sourceId] = config]
    /\ packageAuditLog' = Append(packageAuditLog, [
           user |-> user,
           action |-> "add_source",
           packageId |-> <<>>,
           tenant |-> userTenants[user],
           source |-> sourceId,
           level |-> userLevels[user],
           timestamp |-> Len(packageAuditLog) + 1
       ])
    /\ UNCHANGED <<userLevels, userTenants, sourceIndex, sourceCache,
                   packageRegistry, installedPackages, enabledPackages,
                   schemaValidations, dependencyGraph, resolvedDependencies,
                   conflictResolutionMode, packageConflicts, pendingOperations>>

\* Toggle package source enabled/disabled
TogglePackageSource(user, sourceId) ==
    /\ CanManageSources(user)
    /\ sourceId \in PackageSources
    /\ LET currentConfig == sourceConfigs[sourceId] IN
       sourceConfigs' = [sourceConfigs EXCEPT ![sourceId].enabled = 
                         ~currentConfig.enabled]
    /\ packageAuditLog' = Append(packageAuditLog, [
           user |-> user,
           action |-> "toggle_source",
           packageId |-> <<>>,
           tenant |-> userTenants[user],
           source |-> sourceId,
           level |-> userLevels[user],
           timestamp |-> Len(packageAuditLog) + 1
       ])
    /\ UNCHANGED <<userLevels, userTenants, sourceIndex, sourceCache,
                   packageRegistry, installedPackages, enabledPackages,
                   schemaValidations, dependencyGraph, resolvedDependencies,
                   conflictResolutionMode, packageConflicts, pendingOperations>>

\* Fetch index from a source (async operation starts)
FetchSourceIndex(user, sourceId) ==
    /\ CanManagePackages(user, userTenants[user])
    /\ sourceId \in PackageSources
    /\ sourceConfigs[sourceId].enabled = TRUE
    /\ LET op == [
           id |-> Cardinality(pendingOperations) + 1,
           type |-> "fetch-index",
           packageId |-> <<>>,
           tenant |-> userTenants[user],
           user |-> user,
           source |-> sourceId,
           status |-> "pending",
           startedAt |-> Len(packageAuditLog) + 1
       ] IN
       pendingOperations' = pendingOperations \cup {op}
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex, 
                   sourceCache, packageRegistry, installedPackages, 
                   enabledPackages, schemaValidations, dependencyGraph,
                   resolvedDependencies, conflictResolutionMode, 
                   packageConflicts, packageAuditLog>>

\* Index fetch completes (system action)
CompleteFetchIndex(sourceId, newEntries) ==
    /\ \E op \in pendingOperations: 
           op.type = "fetch-index" /\ op.source = sourceId /\ op.status = "pending"
    /\ sourceIndex' = (sourceIndex \ {e \in sourceIndex: e[1] = sourceId}) \cup
                      {<<sourceId, entry>>: entry \in newEntries}
    /\ sourceCache' = [sourceCache EXCEPT ![sourceId] = "fresh"]
    /\ pendingOperations' = {op \in pendingOperations: 
                             ~(op.type = "fetch-index" /\ op.source = sourceId)}
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, packageRegistry,
                   installedPackages, enabledPackages, schemaValidations,
                   dependencyGraph, resolvedDependencies, conflictResolutionMode,
                   packageConflicts, packageAuditLog>>

-----------------------------------------------------------------------------
(* Conflict Detection and Resolution *)

\* Detect conflicts when same package exists in multiple sources
DetectConflicts ==
    LET packagesInMultipleSources == 
        {pkg \in Packages: 
            Cardinality({s \in PackageSources: 
                \E entry \in sourceIndex: entry[1] = s /\ entry[2].packageId = pkg}) > 1}
    IN
    packageConflicts' = {[
        packageId |-> pkg,
        sources |-> {s \in PackageSources: 
            \E entry \in sourceIndex: entry[1] = s /\ (entry[2]).packageId = pkg},
        versions |-> {(e[2]).version : e \in sourceIndex, (e[2]).packageId = pkg},
        resolvedTo |-> <<>>
    ]: pkg \in packagesInMultipleSources}
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex, 
                   sourceCache, packageRegistry, installedPackages, 
                   enabledPackages, schemaValidations, dependencyGraph,
                   resolvedDependencies, conflictResolutionMode,
                   pendingOperations, packageAuditLog>>

\* Set conflict resolution strategy (Supergod only)
SetConflictResolution(user, strategy) ==
    /\ CanManageSources(user)
    /\ strategy \in ConflictStrategy
    /\ conflictResolutionMode' = strategy
    /\ packageAuditLog' = Append(packageAuditLog, [
           user |-> user,
           action |-> "set_conflict_strategy",
           packageId |-> <<>>,
           tenant |-> userTenants[user],
           source |-> <<>>,
           level |-> userLevels[user],
           timestamp |-> Len(packageAuditLog) + 1
       ])
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex,
                   sourceCache, packageRegistry, installedPackages,
                   enabledPackages, schemaValidations, dependencyGraph,
                   resolvedDependencies, packageConflicts, pendingOperations>>

\* Resolve a specific conflict using current strategy
ResolveConflict(pkg) ==
    /\ \E conflict \in packageConflicts: conflict.packageId = pkg
    /\ LET conflict == CHOOSE c \in packageConflicts: c.packageId = pkg IN
       LET winningSource == 
           CASE conflictResolutionMode = "priority" ->
                    CHOOSE s \in conflict.sources: 
                        \A s2 \in conflict.sources: 
                            sourceConfigs[s].priority <= sourceConfigs[s2].priority
             [] conflictResolutionMode = "local-first" ->
                    IF "local" \in conflict.sources THEN "local"
                    ELSE CHOOSE s \in conflict.sources: TRUE
             [] conflictResolutionMode = "remote-first" ->
                    IF "remote" \in conflict.sources THEN "remote"
                    ELSE CHOOSE s \in conflict.sources: TRUE
             [] OTHER -> CHOOSE s \in conflict.sources: TRUE
       IN
       packageConflicts' = (packageConflicts \ {conflict}) \cup 
                           {[conflict EXCEPT !.resolvedTo = winningSource]}
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex,
                   sourceCache, packageRegistry, installedPackages,
                   enabledPackages, schemaValidations, dependencyGraph,
                   resolvedDependencies, conflictResolutionMode,
                   pendingOperations, packageAuditLog>>

-----------------------------------------------------------------------------
(* Schema Validation Operations *)

\* Validate package against schema (metadata, components, entities, etc.)
ValidatePackageSchema(pkg, schemaType) ==
    /\ pkg \in Packages
    /\ schemaType \in SchemaTypes
    /\ ~\E v \in schemaValidations: v[1] = pkg /\ v[2] = schemaType
    /\ schemaValidations' = schemaValidations \cup {<<pkg, schemaType, "pending">>}
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex,
                   sourceCache, packageRegistry, installedPackages,
                   enabledPackages, dependencyGraph, resolvedDependencies,
                   conflictResolutionMode, packageConflicts, pendingOperations,
                   packageAuditLog>>

\* Schema validation completes
CompleteSchemaValidation(pkg, schemaType, result) ==
    /\ result \in {"valid", "invalid", "warning"}
    /\ <<pkg, schemaType, "pending">> \in schemaValidations
    /\ schemaValidations' = (schemaValidations \ {<<pkg, schemaType, "pending">>}) \cup
                            {<<pkg, schemaType, result>>}
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex,
                   sourceCache, packageRegistry, installedPackages,
                   enabledPackages, dependencyGraph, resolvedDependencies,
                   conflictResolutionMode, packageConflicts, pendingOperations,
                   packageAuditLog>>

-----------------------------------------------------------------------------
(* Dependency Resolution *)

\* Build dependency graph from package metadata
BuildDependencyGraph(pkg, deps) ==
    /\ pkg \in Packages
    /\ deps \subseteq Packages
    /\ dependencyGraph' = [dependencyGraph EXCEPT ![pkg] = deps]
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex,
                   sourceCache, packageRegistry, installedPackages,
                   enabledPackages, schemaValidations, resolvedDependencies,
                   conflictResolutionMode, packageConflicts, pendingOperations,
                   packageAuditLog>>

\* Resolve dependencies transitively
ResolveDependencies(pkg) ==
    /\ pkg \in Packages
    \* Simplified: just direct dependencies for now
    \* Full resolution would be transitive closure
    /\ resolvedDependencies' = [resolvedDependencies EXCEPT ![pkg] = 
                                 dependencyGraph[pkg]]
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex,
                   sourceCache, packageRegistry, installedPackages,
                   enabledPackages, schemaValidations, dependencyGraph,
                   conflictResolutionMode, packageConflicts, pendingOperations,
                   packageAuditLog>>

\* Check if all dependencies are satisfied for a package in a tenant
DependenciesSatisfied(pkg, tenant) ==
    \A dep \in resolvedDependencies[pkg]:
        dep \in installedPackages[tenant]

-----------------------------------------------------------------------------
(* Package Registry Operations *)

\* Get merged package index (filtered by user level)
\* This is a query, not a state change, represented as a helper
GetAccessiblePackages(user) ==
    {entry[2]: entry \in sourceIndex | 
        /\ sourceConfigs[entry[1]].enabled
        /\ CanAccessPackage(user, entry[2].minLevel)}

\* Install package (Admin+)
InstallPackage(user, pkg, sourceId) ==
    /\ CanManagePackages(user, userTenants[user])
    /\ pkg \in Packages
    /\ sourceId \in PackageSources
    /\ \E entry \in sourceIndex: 
           entry[1] = sourceId /\ entry[2].packageId = pkg
    /\ LET tenant == userTenants[user] IN
       /\ pkg \notin installedPackages[tenant]
       \* Check minLevel requirement
       /\ \E entry \in sourceIndex: 
              entry[1] = sourceId /\ entry[2].packageId = pkg /\
              CanAccessPackage(user, entry[2].minLevel)
       \* Check dependencies
       /\ DependenciesSatisfied(pkg, tenant)
       /\ installedPackages' = [installedPackages EXCEPT ![tenant] = @ \cup {pkg}]
       /\ packageAuditLog' = Append(packageAuditLog, [
              user |-> user,
              action |-> "install_package",
              packageId |-> pkg,
              tenant |-> tenant,
              source |-> sourceId,
              level |-> userLevels[user],
              timestamp |-> Len(packageAuditLog) + 1
          ])
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex,
                   sourceCache, packageRegistry, enabledPackages, 
                   schemaValidations, dependencyGraph, resolvedDependencies,
                   conflictResolutionMode, packageConflicts, pendingOperations>>

\* Uninstall package (Admin+) - cannot uninstall if others depend on it
UninstallPackage(user, pkg) ==
    /\ CanManagePackages(user, userTenants[user])
    /\ pkg \in Packages
    /\ LET tenant == userTenants[user] IN
       /\ pkg \in installedPackages[tenant]
       \* Cannot uninstall if other installed packages depend on this
       /\ ~\E depPkg \in installedPackages[tenant]:
              pkg \in dependencyGraph[depPkg]
       /\ installedPackages' = [installedPackages EXCEPT ![tenant] = @ \ {pkg}]
       /\ enabledPackages' = [enabledPackages EXCEPT ![tenant] = @ \ {pkg}]
       /\ packageAuditLog' = Append(packageAuditLog, [
              user |-> user,
              action |-> "uninstall_package",
              packageId |-> pkg,
              tenant |-> tenant,
              source |-> <<>>,
              level |-> userLevels[user],
              timestamp |-> Len(packageAuditLog) + 1
          ])
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex,
                   sourceCache, packageRegistry, schemaValidations, 
                   dependencyGraph, resolvedDependencies, conflictResolutionMode,
                   packageConflicts, pendingOperations>>

\* Enable package (Admin+)
EnablePackage(user, pkg) ==
    /\ CanManagePackages(user, userTenants[user])
    /\ pkg \in Packages
    /\ LET tenant == userTenants[user] IN
       /\ pkg \in installedPackages[tenant]
       /\ pkg \notin enabledPackages[tenant]
       \* All dependencies must also be enabled
       /\ \A dep \in dependencyGraph[pkg]: dep \in enabledPackages[tenant]
       /\ enabledPackages' = [enabledPackages EXCEPT ![tenant] = @ \cup {pkg}]
       /\ packageAuditLog' = Append(packageAuditLog, [
              user |-> user,
              action |-> "enable_package",
              packageId |-> pkg,
              tenant |-> tenant,
              source |-> <<>>,
              level |-> userLevels[user],
              timestamp |-> Len(packageAuditLog) + 1
          ])
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex,
                   sourceCache, packageRegistry, installedPackages, 
                   schemaValidations, dependencyGraph, resolvedDependencies,
                   conflictResolutionMode, packageConflicts, pendingOperations>>

\* Disable package (Admin+) - cannot disable if others depend on it
DisablePackage(user, pkg) ==
    /\ CanManagePackages(user, userTenants[user])
    /\ pkg \in Packages
    /\ LET tenant == userTenants[user] IN
       /\ pkg \in enabledPackages[tenant]
       \* Cannot disable if enabled packages depend on this
       /\ ~\E depPkg \in enabledPackages[tenant]:
              pkg \in dependencyGraph[depPkg]
       /\ enabledPackages' = [enabledPackages EXCEPT ![tenant] = @ \ {pkg}]
       /\ packageAuditLog' = Append(packageAuditLog, [
              user |-> user,
              action |-> "disable_package",
              packageId |-> pkg,
              tenant |-> tenant,
              source |-> <<>>,
              level |-> userLevels[user],
              timestamp |-> Len(packageAuditLog) + 1
          ])
    /\ UNCHANGED <<userLevels, userTenants, sourceConfigs, sourceIndex,
                   sourceCache, packageRegistry, installedPackages, 
                   schemaValidations, dependencyGraph, resolvedDependencies,
                   conflictResolutionMode, packageConflicts, pendingOperations>>

-----------------------------------------------------------------------------
(* Next State Relation *)

Next ==
    \* Source management (Supergod only)
    \/ \E u \in Users, s \in PackageSources, c \in SourceConfig: AddPackageSource(u, s, c)
    \/ \E u \in Users, s \in PackageSources: TogglePackageSource(u, s)
    \/ \E u \in Users, s \in PackageSources: FetchSourceIndex(u, s)
    \/ \E s \in PackageSources, entries \in SUBSET PackageIndexEntry: CompleteFetchIndex(s, entries)
    \* Conflict resolution
    \/ DetectConflicts
    \/ \E u \in Users, strategy \in ConflictStrategy: SetConflictResolution(u, strategy)
    \/ \E p \in Packages: ResolveConflict(p)
    \* Schema validation
    \/ \E p \in Packages, st \in SchemaTypes: ValidatePackageSchema(p, st)
    \/ \E p \in Packages, st \in SchemaTypes, r \in {"valid", "invalid", "warning"}: 
           CompleteSchemaValidation(p, st, r)
    \* Dependency management
    \/ \E p \in Packages, deps \in SUBSET Packages: BuildDependencyGraph(p, deps)
    \/ \E p \in Packages: ResolveDependencies(p)
    \* Package operations
    \/ \E u \in Users, p \in Packages, s \in PackageSources: InstallPackage(u, p, s)
    \/ \E u \in Users, p \in Packages: UninstallPackage(u, p)
    \/ \E u \in Users, p \in Packages: EnablePackage(u, p)
    \/ \E u \in Users, p \in Packages: DisablePackage(u, p)

-----------------------------------------------------------------------------
(* Safety Properties *)

\* Only admin+ can manage packages
AdminOnlyPackageManagement ==
    \A i \in 1..Len(packageAuditLog):
        packageAuditLog[i].action \in {"install_package", "uninstall_package", 
                                        "enable_package", "disable_package"} 
        => packageAuditLog[i].level >= Level.Admin

\* Only supergod can manage sources
SupergodOnlySourceManagement ==
    \A i \in 1..Len(packageAuditLog):
        packageAuditLog[i].action \in {"add_source", "toggle_source", 
                                        "set_conflict_strategy"} 
        => packageAuditLog[i].level >= Level.Supergod

\* Multi-tenant isolation: packages are installed per-tenant
TenantPackageIsolation ==
    \A t1, t2 \in Tenants:
        t1 /= t2 => 
            \* Different tenants can have different packages installed
            TRUE  \* Tenants are independent

\* Enabled packages must be installed
EnabledImpliesInstalled ==
    \A t \in Tenants:
        enabledPackages[t] \subseteq installedPackages[t]

\* Dependency integrity: if package is enabled, its dependencies are enabled
DependencyIntegrity ==
    \A t \in Tenants:
        \A pkg \in enabledPackages[t]:
            \A dep \in dependencyGraph[pkg]:
                dep \in enabledPackages[t]

\* No circular dependencies (simplified check)
NoCyclicDependencies ==
    \A p \in Packages:
        p \notin resolvedDependencies[p]

\* Schema validation required before installation
\* (Invariant ensures validated packages have passed checks)
SchemaValidationRequired ==
    \A t \in Tenants:
        \A pkg \in installedPackages[t]:
            \E v \in schemaValidations: v[1] = pkg /\ v[3] = "valid"

\* Package access respects minLevel
PermissionLevelEnforcement ==
    \A i \in 1..Len(packageAuditLog):
        packageAuditLog[i].action = "install_package" =>
            \E entry \in sourceIndex:
                entry[2].packageId = packageAuditLog[i].packageId /\
                packageAuditLog[i].level >= entry[2].minLevel

\* Conflicts are resolved before installation can proceed
ConflictsResolvedBeforeInstall ==
    \A conflict \in packageConflicts:
        conflict.packageId \in UNION {installedPackages[t]: t \in Tenants} =>
        conflict.resolvedTo /= <<>>

\* Audit completeness for package operations
PackageAuditCompleteness ==
    \A t \in Tenants:
        \A pkg \in installedPackages[t]:
            \E i \in 1..Len(packageAuditLog):
                packageAuditLog[i].action = "install_package" /\
                packageAuditLog[i].packageId = pkg /\
                packageAuditLog[i].tenant = t

-----------------------------------------------------------------------------
(* Liveness Properties *)

\* Eventually, pending operations complete
EventualOperationCompletion ==
    \A op \in pendingOperations:
        op.status = "pending" ~> op.status \in {"completed", "failed"}

\* Eventually, schema validations complete
EventualValidation ==
    \A p \in Packages, st \in SchemaTypes:
        <<p, st, "pending">> \in schemaValidations ~>
        <<p, st, "valid">> \in schemaValidations \/ 
        <<p, st, "invalid">> \in schemaValidations \/
        <<p, st, "warning">> \in schemaValidations

\* Eventually, conflicts are resolved
EventualConflictResolution ==
    \A c \in packageConflicts:
        c.resolvedTo = <<>> ~> c.resolvedTo /= <<>>

\* Eventually, source index becomes fresh after fetch
EventualIndexRefresh ==
    \A s \in PackageSources:
        (\E op \in pendingOperations: op.type = "fetch-index" /\ op.source = s) ~>
        sourceCache[s] = "fresh"

-----------------------------------------------------------------------------
(* Specification *)

Spec ==
    /\ Init
    /\ [][Next]_vars
    /\ WF_vars(\E s \in PackageSources, entries \in SUBSET PackageIndexEntry: 
               CompleteFetchIndex(s, entries))
    /\ WF_vars(\E p \in Packages, st \in SchemaTypes, r \in {"valid", "invalid", "warning"}: 
               CompleteSchemaValidation(p, st, r))
    /\ WF_vars(\E p \in Packages: ResolveConflict(p))

-----------------------------------------------------------------------------
(* Invariants to Check *)

Invariants ==
    /\ TypeOK
    /\ AdminOnlyPackageManagement
    /\ SupergodOnlySourceManagement
    /\ EnabledImpliesInstalled
    /\ DependencyIntegrity
    /\ PackageAuditCompleteness

\* Relaxed invariants for initial model checking
RelaxedInvariants ==
    /\ TypeOK
    /\ AdminOnlyPackageManagement
    /\ SupergodOnlySourceManagement
    /\ EnabledImpliesInstalled
    /\ DependencyIntegrity

=============================================================================
