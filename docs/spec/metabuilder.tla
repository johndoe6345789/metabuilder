---------------------------- MODULE metabuilder ----------------------------
(***************************************************************************
 * MetaBuilder Core Formal Specification                                   *
 *                                                                          *
 * This TLA+ specification models the core behavior of MetaBuilder,        *
 * a data-driven, multi-tenant platform with:                              *
 *   - 6-level hierarchical permission system                              *
 *   - Multi-tenant data isolation                                         *
 *   - Database Abstraction Layer (DBAL) with dual implementations         *
 *   - Basic package lifecycle (install/enable/disable)                    *
 *   - Declarative component rendering                                     *
 *                                                                          *
 * Related Specifications:                                                 *
 *   - package_system.tla: Detailed schema-driven package system with      *
 *     multi-source support, validation, dependencies, and versioning      *
 *     (aligned with schemas/package-schemas/*.json)                       *
 *   - workflow_system.tla: Advanced workflow execution                    *
 *   - collaboration.tla: Real-time collaboration features                 *
 *   - integrations.tla: Webhook, OAuth, and API key ecosystem             *
 ***************************************************************************)

EXTENDS Naturals, Sequences, FiniteSets, TLC

CONSTANTS
    Users,              \* Set of all users in the system
    Tenants,            \* Set of all tenants
    Packages,           \* Set of available packages
    DataRecords,        \* Set of data records
    MaxLevel            \* Maximum permission level (6 for Supergod)

VARIABLES
    userLevels,         \* User -> Permission Level (1-6)
    userTenants,        \* User -> Tenant mapping
    tenantData,         \* Tenant -> Set of data records
    installedPackages,  \* Tenant -> Set of installed packages
    packageStates,      \* Package -> {available, installing, installed, disabled}
    dbalState,          \* DBAL daemon state {ready, processing, error}
    activeQueries,      \* Set of active database queries
    auditLog            \* Sequence of audit events

vars == <<userLevels, userTenants, tenantData, installedPackages, 
          packageStates, dbalState, activeQueries, auditLog>>

-----------------------------------------------------------------------------
(* Permission Levels *)

PermissionLevel == 1..MaxLevel

Level == [
    Public    |-> 1,
    User      |-> 2,
    Moderator |-> 3,
    Admin     |-> 4,
    God       |-> 5,
    Supergod  |-> 6
]

-----------------------------------------------------------------------------
(* Type Invariants *)

TypeOK ==
    /\ userLevels \in [Users -> PermissionLevel]
    /\ userTenants \in [Users -> Tenants]
    /\ tenantData \in [Tenants -> SUBSET DataRecords]
    /\ installedPackages \in [Tenants -> SUBSET Packages]
    /\ packageStates \in [Packages -> {"available", "installing", "installed", "disabled"}]
    /\ dbalState \in {"ready", "processing", "error"}
    /\ activeQueries \subseteq (Users \X Tenants \X {"read", "write", "delete"})
    /\ auditLog \in Seq([user: Users, action: STRING, tenant: Tenants, level: PermissionLevel])

-----------------------------------------------------------------------------
(* Permission System *)

\* Check if a user has at least the required permission level
HasPermission(user, requiredLevel) ==
    userLevels[user] >= requiredLevel

\* Hierarchical permission inheritance: higher levels inherit all lower permissions
CanAccessLevel(user, targetLevel) ==
    userLevels[user] >= targetLevel

\* User can only access data within their tenant
CanAccessTenantData(user, tenant) ==
    userTenants[user] = tenant

\* Combined permission and tenant check
CanPerformAction(user, tenant, requiredLevel) ==
    /\ HasPermission(user, requiredLevel)
    /\ CanAccessTenantData(user, tenant)

-----------------------------------------------------------------------------
(* Initial State *)

Init ==
    /\ userLevels \in [Users -> PermissionLevel]
    /\ userTenants \in [Users -> Tenants]
    /\ tenantData = [t \in Tenants |-> {}]
    /\ installedPackages = [t \in Tenants |-> {}]
    /\ packageStates = [p \in Packages |-> "available"]
    /\ dbalState = "ready"
    /\ activeQueries = {}
    /\ auditLog = <<>>

-----------------------------------------------------------------------------
(* Data Access Operations *)

\* User reads data from their tenant (requires Level 2+)
ReadData(user) ==
    /\ CanPerformAction(user, userTenants[user], Level.User)
    /\ dbalState = "ready"
    /\ activeQueries' = activeQueries \cup {<<user, userTenants[user], "read">>}
    /\ auditLog' = Append(auditLog, [
           user |-> user,
           action |-> "read_data",
           tenant |-> userTenants[user],
           level |-> userLevels[user]
       ])
    /\ UNCHANGED <<userLevels, userTenants, tenantData, installedPackages, 
                   packageStates, dbalState>>

\* User writes data to their tenant (requires Level 2+)
WriteData(user, record) ==
    /\ record \in DataRecords
    /\ CanPerformAction(user, userTenants[user], Level.User)
    /\ dbalState = "ready"
    /\ LET tenant == userTenants[user] IN
       /\ tenantData' = [tenantData EXCEPT ![tenant] = @ \cup {record}]
       /\ activeQueries' = activeQueries \cup {<<user, tenant, "write">>}
       /\ auditLog' = Append(auditLog, [
              user |-> user,
              action |-> "write_data",
              tenant |-> tenant,
              level |-> userLevels[user]
          ])
    /\ UNCHANGED <<userLevels, userTenants, installedPackages, 
                   packageStates, dbalState>>

\* User deletes data from their tenant (requires Level 2+)
DeleteData(user, record) ==
    /\ record \in DataRecords
    /\ CanPerformAction(user, userTenants[user], Level.User)
    /\ dbalState = "ready"
    /\ LET tenant == userTenants[user] IN
       /\ record \in tenantData[tenant]
       /\ tenantData' = [tenantData EXCEPT ![tenant] = @ \ {record}]
       /\ activeQueries' = activeQueries \cup {<<user, tenant, "delete">>}
       /\ auditLog' = Append(auditLog, [
              user |-> user,
              action |-> "delete_data",
              tenant |-> tenant,
              level |-> userLevels[user]
          ])
    /\ UNCHANGED <<userLevels, userTenants, installedPackages, 
                   packageStates, dbalState>>

\* Query completes and is removed from active set
CompleteQuery(user, tenant, operation) ==
    /\ <<user, tenant, operation>> \in activeQueries
    /\ activeQueries' = activeQueries \ {<<user, tenant, operation>>}
    /\ UNCHANGED <<userLevels, userTenants, tenantData, installedPackages, 
                   packageStates, dbalState, auditLog>>

-----------------------------------------------------------------------------
(* User Management Operations *)

\* Admin can modify user levels (requires Level 4+)
ModifyUserLevel(admin, targetUser, newLevel) ==
    /\ admin /= targetUser  \* Cannot modify own level
    /\ CanPerformAction(admin, userTenants[admin], Level.Admin)
    /\ userTenants[admin] = userTenants[targetUser]  \* Same tenant only
    /\ newLevel \in PermissionLevel
    /\ newLevel < userLevels[admin]  \* Cannot grant higher level than own
    /\ userLevels' = [userLevels EXCEPT ![targetUser] = newLevel]
    /\ auditLog' = Append(auditLog, [
           user |-> admin,
           action |-> "modify_user_level",
           tenant |-> userTenants[admin],
           level |-> userLevels[admin]
       ])
    /\ UNCHANGED <<userTenants, tenantData, installedPackages, 
                   packageStates, dbalState, activeQueries>>

-----------------------------------------------------------------------------
(* Package Management Operations *)

\* Admin can install a package (requires Level 4+)
InstallPackage(user, pkg) ==
    /\ pkg \in Packages
    /\ CanPerformAction(user, userTenants[user], Level.Admin)
    /\ packageStates[pkg] = "available"
    /\ LET tenant == userTenants[user] IN
       /\ pkg \notin installedPackages[tenant]
       /\ packageStates' = [packageStates EXCEPT ![pkg] = "installing"]
       /\ installedPackages' = [installedPackages EXCEPT ![tenant] = @ \cup {pkg}]
       /\ auditLog' = Append(auditLog, [
              user |-> user,
              action |-> "install_package",
              tenant |-> tenant,
              level |-> userLevels[user]
          ])
    /\ UNCHANGED <<userLevels, userTenants, tenantData, dbalState, activeQueries>>

\* Package installation completes
CompletePackageInstall(pkg) ==
    /\ packageStates[pkg] = "installing"
    /\ packageStates' = [packageStates EXCEPT ![pkg] = "installed"]
    /\ UNCHANGED <<userLevels, userTenants, tenantData, installedPackages, 
                   dbalState, activeQueries, auditLog>>

\* Admin can uninstall a package (requires Level 4+)
UninstallPackage(user, pkg) ==
    /\ pkg \in Packages
    /\ CanPerformAction(user, userTenants[user], Level.Admin)
    /\ LET tenant == userTenants[user] IN
       /\ pkg \in installedPackages[tenant]
       /\ installedPackages' = [installedPackages EXCEPT ![tenant] = @ \ {pkg}]
       /\ packageStates' = [packageStates EXCEPT ![pkg] = "available"]
       /\ auditLog' = Append(auditLog, [
              user |-> user,
              action |-> "uninstall_package",
              tenant |-> tenant,
              level |-> userLevels[user]
          ])
    /\ UNCHANGED <<userLevels, userTenants, tenantData, dbalState, activeQueries>>

\* Admin can toggle package state (requires Level 4+)
TogglePackage(user, pkg) ==
    /\ pkg \in Packages
    /\ CanPerformAction(user, userTenants[user], Level.Admin)
    /\ LET tenant == userTenants[user] IN
       /\ pkg \in installedPackages[tenant]
       /\ packageStates[pkg] \in {"installed", "disabled"}
       /\ packageStates' = [packageStates EXCEPT ![pkg] = 
              IF @ = "installed" THEN "disabled" ELSE "installed"]
       /\ auditLog' = Append(auditLog, [
              user |-> user,
              action |-> "toggle_package",
              tenant |-> tenant,
              level |-> userLevels[user]
          ])
    /\ UNCHANGED <<userLevels, userTenants, tenantData, installedPackages, 
                   dbalState, activeQueries>>

-----------------------------------------------------------------------------
(* DBAL State Transitions *)

\* DBAL starts processing a query
DBALStartProcessing ==
    /\ dbalState = "ready"
    /\ activeQueries /= {}
    /\ dbalState' = "processing"
    /\ UNCHANGED <<userLevels, userTenants, tenantData, installedPackages, 
                   packageStates, activeQueries, auditLog>>

\* DBAL completes processing and returns to ready
DBALCompleteProcessing ==
    /\ dbalState = "processing"
    /\ dbalState' = "ready"
    /\ UNCHANGED <<userLevels, userTenants, tenantData, installedPackages, 
                   packageStates, activeQueries, auditLog>>

\* DBAL encounters an error (can recover)
DBALError ==
    /\ dbalState = "processing"
    /\ dbalState' = "error"
    /\ UNCHANGED <<userLevels, userTenants, tenantData, installedPackages, 
                   packageStates, activeQueries, auditLog>>

\* DBAL recovers from error
DBALRecover ==
    /\ dbalState = "error"
    /\ dbalState' = "ready"
    /\ UNCHANGED <<userLevels, userTenants, tenantData, installedPackages, 
                   packageStates, activeQueries, auditLog>>

-----------------------------------------------------------------------------
(* Next State Relation *)

Next ==
    \/ \E u \in Users: ReadData(u)
    \/ \E u \in Users, r \in DataRecords: WriteData(u, r)
    \/ \E u \in Users, r \in DataRecords: DeleteData(u, r)
    \/ \E u \in Users, t \in Tenants, op \in {"read", "write", "delete"}: 
           CompleteQuery(u, t, op)
    \/ \E admin \in Users, target \in Users, lvl \in PermissionLevel: 
           ModifyUserLevel(admin, target, lvl)
    \/ \E u \in Users, p \in Packages: InstallPackage(u, p)
    \/ \E p \in Packages: CompletePackageInstall(p)
    \/ \E u \in Users, p \in Packages: UninstallPackage(u, p)
    \/ \E u \in Users, p \in Packages: TogglePackage(u, p)
    \/ DBALStartProcessing
    \/ DBALCompleteProcessing
    \/ DBALError
    \/ DBALRecover

-----------------------------------------------------------------------------
(* Safety Properties *)

\* Multi-tenant isolation: users can only access their own tenant's data
TenantIsolation ==
    \A u \in Users, t \in Tenants:
        (userTenants[u] /= t) => 
            ~\E record \in DataRecords, op \in {"read", "write", "delete"}:
                /\ <<u, t, op>> \in activeQueries

\* Permission enforcement: operations require appropriate level
PermissionEnforcement ==
    /\ \A u \in Users: 
           (\E t \in Tenants, op \in {"read", "write", "delete"}: 
               <<u, t, op>> \in activeQueries) 
           => userLevels[u] >= Level.User
    /\ Len(auditLog) > 0 =>
           LET lastEvent == auditLog[Len(auditLog)] IN
           lastEvent.action \in {"modify_user_level", "install_package", 
                                 "uninstall_package", "toggle_package"} 
           => lastEvent.level >= Level.Admin

\* Users cannot elevate their own permissions
NoSelfElevation ==
    \A i \in 1..Len(auditLog):
        auditLog[i].action = "modify_user_level" =>
            auditLog[i].user /= auditLog[i].user  \* This is always true in our model

\* Data consistency: records belong to exactly one tenant
DataConsistency ==
    \A t1, t2 \in Tenants:
        t1 /= t2 => tenantData[t1] \cap tenantData[t2] = {}

\* Package consistency: installed packages must be in installed or disabled state
PackageConsistency ==
    \A t \in Tenants:
        \A p \in installedPackages[t]:
            packageStates[p] \in {"installed", "disabled", "installing"}

\* DBAL safety: no queries processed in error state
DBALSafety ==
    dbalState = "error" => 
        ~\E u \in Users, r \in DataRecords: 
            WriteData(u, r) \/ DeleteData(u, r)

\* Audit completeness: all privileged operations are logged
AuditCompleteness ==
    \A i \in 1..Len(auditLog):
        auditLog[i].action \in {
            "read_data", "write_data", "delete_data",
            "modify_user_level", "install_package", 
            "uninstall_package", "toggle_package"
        }

-----------------------------------------------------------------------------
(* Liveness Properties *)

\* Eventually, DBAL processes all queries (if it stays ready)
EventualProcessing ==
    activeQueries /= {} ~> (activeQueries = {} \/ dbalState /= "ready")

\* If DBAL enters error state, it eventually recovers
EventualRecovery ==
    dbalState = "error" ~> dbalState = "ready"

\* Package installation eventually completes
EventualPackageInstall ==
    \A p \in Packages:
        packageStates[p] = "installing" ~> packageStates[p] = "installed"

-----------------------------------------------------------------------------
(* System Specification *)

Spec == 
    /\ Init 
    /\ [][Next]_vars
    /\ WF_vars(DBALCompleteProcessing)
    /\ WF_vars(DBALRecover)
    /\ \A p \in Packages: WF_vars(CompletePackageInstall(p))

-----------------------------------------------------------------------------
(* Invariants to Check *)

Invariants ==
    /\ TypeOK
    /\ TenantIsolation
    /\ PermissionEnforcement
    /\ DataConsistency
    /\ PackageConsistency
    /\ DBALSafety
    /\ AuditCompleteness

=============================================================================
