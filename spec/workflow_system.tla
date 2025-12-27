---------------------------- MODULE workflow_system ----------------------------
(***************************************************************************
 * Workflow System Specification for MetaBuilder                          *
 *                                                                          *
 * This specification models workflow execution, scheduling, and state     *
 * management for MetaBuilder's advanced workflow features.                *
 *                                                                          *
 * Features modeled:                                                       *
 *   - Workflow definition and validation                                  *
 *   - Scheduled and manual workflow execution                             *
 *   - Step dependencies and parallel execution                            *
 *   - Error handling and retry logic                                      *
 *   - Workflow templates and instances                                    *
 *   - God-level (Level 5+) permission requirements                        *
 ***************************************************************************)

EXTENDS Naturals, Sequences, FiniteSets, TLC

CONSTANTS
    Users,              \* Set of all users
    Tenants,            \* Set of tenants
    WorkflowTemplates,  \* Set of workflow templates
    WorkflowSteps,      \* Set of possible workflow steps
    MaxRetries,         \* Maximum retry attempts for failed steps
    MaxConcurrentRuns   \* Maximum concurrent workflow executions per tenant

VARIABLES
    userLevels,         \* User -> Permission Level
    userTenants,        \* User -> Tenant
    templates,          \* WorkflowTemplate -> Template Definition
    instances,          \* WorkflowInstance -> Instance State
    scheduledRuns,      \* Set of scheduled workflow runs
    runningWorkflows,   \* Set of currently executing workflow instances
    completedWorkflows, \* Set of completed workflow instances
    workflowAuditLog    \* Sequence of workflow events

vars == <<userLevels, userTenants, templates, instances, scheduledRuns, 
          runningWorkflows, completedWorkflows, workflowAuditLog>>

-----------------------------------------------------------------------------
(* Type Definitions *)

PermissionLevel == 1..6

WorkflowStatus == {"draft", "active", "paused", "archived"}
StepStatus == {"pending", "running", "success", "failed", "skipped", "retrying"}
InstanceStatus == {"queued", "running", "completed", "failed", "cancelled"}

TemplateRecord == [
    id: WorkflowTemplates,
    name: STRING,
    tenantId: Tenants,
    status: WorkflowStatus,
    steps: Seq(WorkflowSteps),
    dependencies: [WorkflowSteps -> SUBSET WorkflowSteps],  \* Step dependencies
    trigger: {"manual", "scheduled", "event"}
]

InstanceRecord == [
    id: Nat,
    templateId: WorkflowTemplates,
    tenantId: Tenants,
    status: InstanceStatus,
    startedBy: Users,
    startTime: Nat,
    stepStates: [WorkflowSteps -> StepStatus],
    retryCount: [WorkflowSteps -> Nat],
    result: STRING
]

TypeOK ==
    /\ userLevels \in [Users -> PermissionLevel]
    /\ userTenants \in [Users -> Tenants]
    /\ templates \subseteq TemplateRecord
    /\ instances \subseteq InstanceRecord
    /\ scheduledRuns \subseteq (WorkflowTemplates \X Tenants \X Nat)  \* (template, tenant, timestamp)
    /\ runningWorkflows \subseteq Nat  \* Instance IDs
    /\ completedWorkflows \subseteq Nat
    /\ workflowAuditLog \in Seq([
           user: Users \cup {"system"},
           action: STRING,
           templateId: WorkflowTemplates \cup {0},
           instanceId: Nat,
           tenant: Tenants,
           timestamp: Nat
       ])

-----------------------------------------------------------------------------
(* Permission Checks *)

\* God level (5+) required for workflow authoring
CanAuthorWorkflow(user, tenant) ==
    /\ userLevels[user] >= 5
    /\ userTenants[user] = tenant

\* Admin level (4+) required for workflow execution
CanExecuteWorkflow(user, tenant) ==
    /\ userLevels[user] >= 4
    /\ userTenants[user] = tenant

-----------------------------------------------------------------------------
(* Helper Functions *)

\* Get template by ID
GetTemplate(tid) ==
    CHOOSE t \in templates : t.id = tid

\* Get instance by ID
GetInstance(iid) ==
    CHOOSE i \in instances : i.id = iid

\* Check if all dependencies of a step are satisfied
StepDependenciesSatisfied(instance, step) ==
    LET 
        template == GetTemplate(instance.templateId)
        deps == template.dependencies[step]
    IN
        \A dep \in deps : 
            instance.stepStates[dep] \in {"success", "skipped"}

\* Count running workflows for a tenant
CountRunningForTenant(tenant) ==
    Cardinality({i \in runningWorkflows : GetInstance(i).tenantId = tenant})

-----------------------------------------------------------------------------
(* Initial State *)

Init ==
    /\ userLevels \in [Users -> PermissionLevel]
    /\ userTenants \in [Users -> Tenants]
    /\ templates = {}
    /\ instances = {}
    /\ scheduledRuns = {}
    /\ runningWorkflows = {}
    /\ completedWorkflows = {}
    /\ workflowAuditLog = <<>>

-----------------------------------------------------------------------------
(* Workflow Template Operations *)

\* God user creates a new workflow template
CreateTemplate(user, tid, tenant, steps, deps, trigger) ==
    /\ CanAuthorWorkflow(user, tenant)
    /\ tid \in WorkflowTemplates
    /\ tid \notin {t.id : t \in templates}
    /\ steps \in Seq(WorkflowSteps)
    /\ Len(steps) > 0
    /\ trigger \in {"manual", "scheduled", "event"}
    /\ LET newTemplate == [
           id |-> tid,
           name |-> "WorkflowTemplate",
           tenantId |-> tenant,
           status |-> "draft",
           steps |-> steps,
           dependencies |-> deps,
           trigger |-> trigger
       ] IN
       /\ templates' = templates \cup {newTemplate}
       /\ workflowAuditLog' = Append(workflowAuditLog, [
              user |-> user,
              action |-> "create_template",
              templateId |-> tid,
              instanceId |-> 0,
              tenant |-> tenant,
              timestamp |-> Len(workflowAuditLog)
          ])
    /\ UNCHANGED <<userLevels, userTenants, instances, scheduledRuns, 
                   runningWorkflows, completedWorkflows>>

\* God user activates a template
ActivateTemplate(user, tid) ==
    /\ \E t \in templates :
        /\ t.id = tid
        /\ CanAuthorWorkflow(user, t.tenantId)
        /\ t.status = "draft"
        /\ templates' = (templates \ {t}) \cup {[t EXCEPT !.status = "active"]}
        /\ workflowAuditLog' = Append(workflowAuditLog, [
               user |-> user,
               action |-> "activate_template",
               templateId |-> tid,
               instanceId |-> 0,
               tenant |-> t.tenantId,
               timestamp |-> Len(workflowAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, instances, scheduledRuns, 
                   runningWorkflows, completedWorkflows>>

\* God user archives a template
ArchiveTemplate(user, tid) ==
    /\ \E t \in templates :
        /\ t.id = tid
        /\ CanAuthorWorkflow(user, t.tenantId)
        /\ t.status \in {"active", "paused"}
        /\ templates' = (templates \ {t}) \cup {[t EXCEPT !.status = "archived"]}
        /\ workflowAuditLog' = Append(workflowAuditLog, [
               user |-> user,
               action |-> "archive_template",
               templateId |-> tid,
               instanceId |-> 0,
               tenant |-> t.tenantId,
               timestamp |-> Len(workflowAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, instances, scheduledRuns, 
                   runningWorkflows, completedWorkflows>>

-----------------------------------------------------------------------------
(* Workflow Execution *)

\* Admin user manually starts a workflow
StartWorkflow(user, tid, iid) ==
    /\ \E t \in templates :
        /\ t.id = tid
        /\ CanExecuteWorkflow(user, t.tenantId)
        /\ t.status = "active"
        /\ CountRunningForTenant(t.tenantId) < MaxConcurrentRuns
        /\ iid \notin {i.id : i \in instances}
        /\ LET 
               initialStepStates == [s \in WorkflowSteps |-> 
                   IF s \in {t.steps[i] : i \in 1..Len(t.steps)} 
                   THEN "pending" 
                   ELSE "skipped"]
               initialRetryCount == [s \in WorkflowSteps |-> 0]
               newInstance == [
                   id |-> iid,
                   templateId |-> tid,
                   tenantId |-> t.tenantId,
                   status |-> "running",
                   startedBy |-> user,
                   startTime |-> Len(workflowAuditLog),
                   stepStates |-> initialStepStates,
                   retryCount |-> initialRetryCount,
                   result |-> "in_progress"
               ]
           IN
           /\ instances' = instances \cup {newInstance}
           /\ runningWorkflows' = runningWorkflows \cup {iid}
           /\ workflowAuditLog' = Append(workflowAuditLog, [
                  user |-> user,
                  action |-> "start_workflow",
                  templateId |-> tid,
                  instanceId |-> iid,
                  tenant |-> t.tenantId,
                  timestamp |-> Len(workflowAuditLog)
              ])
    /\ UNCHANGED <<userLevels, userTenants, templates, scheduledRuns, 
                   completedWorkflows>>

\* System executes a workflow step
ExecuteStep(iid, step) ==
    /\ iid \in runningWorkflows
    /\ \E instance \in instances :
        /\ instance.id = iid
        /\ instance.status = "running"
        /\ instance.stepStates[step] = "pending"
        /\ StepDependenciesSatisfied(instance, step)
        /\ instances' = (instances \ {instance}) \cup 
               {[instance EXCEPT !.stepStates[step] = "running"]}
        /\ workflowAuditLog' = Append(workflowAuditLog, [
               user |-> "system",
               action |-> "execute_step",
               templateId |-> instance.templateId,
               instanceId |-> iid,
               tenant |-> instance.tenantId,
               timestamp |-> Len(workflowAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, templates, scheduledRuns, 
                   runningWorkflows, completedWorkflows>>

\* Step completes successfully
CompleteStep(iid, step) ==
    /\ iid \in runningWorkflows
    /\ \E instance \in instances :
        /\ instance.id = iid
        /\ instance.stepStates[step] = "running"
        /\ instances' = (instances \ {instance}) \cup 
               {[instance EXCEPT !.stepStates[step] = "success"]}
        /\ workflowAuditLog' = Append(workflowAuditLog, [
               user |-> "system",
               action |-> "complete_step",
               templateId |-> instance.templateId,
               instanceId |-> iid,
               tenant |-> instance.tenantId,
               timestamp |-> Len(workflowAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, templates, scheduledRuns, 
                   runningWorkflows, completedWorkflows>>

\* Step fails (may retry)
FailStep(iid, step) ==
    /\ iid \in runningWorkflows
    /\ \E instance \in instances :
        /\ instance.id = iid
        /\ instance.stepStates[step] = "running"
        /\ LET 
               newRetryCount == instance.retryCount[step] + 1
               shouldRetry == newRetryCount < MaxRetries
               newStatus == IF shouldRetry THEN "retrying" ELSE "failed"
           IN
           /\ instances' = (instances \ {instance}) \cup 
                  {[instance EXCEPT 
                      !.stepStates[step] = newStatus,
                      !.retryCount[step] = newRetryCount
                   ]}
           /\ workflowAuditLog' = Append(workflowAuditLog, [
                  user |-> "system",
                  action |-> "fail_step",
                  templateId |-> instance.templateId,
                  instanceId |-> iid,
                  tenant |-> instance.tenantId,
                  timestamp |-> Len(workflowAuditLog)
              ])
    /\ UNCHANGED <<userLevels, userTenants, templates, scheduledRuns, 
                   runningWorkflows, completedWorkflows>>

\* Retry a failed step
RetryStep(iid, step) ==
    /\ iid \in runningWorkflows
    /\ \E instance \in instances :
        /\ instance.id = iid
        /\ instance.stepStates[step] = "retrying"
        /\ instance.retryCount[step] < MaxRetries
        /\ instances' = (instances \ {instance}) \cup 
               {[instance EXCEPT !.stepStates[step] = "pending"]}
        /\ workflowAuditLog' = Append(workflowAuditLog, [
               user |-> "system",
               action |-> "retry_step",
               templateId |-> instance.templateId,
               instanceId |-> iid,
               tenant |-> instance.tenantId,
               timestamp |-> Len(workflowAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, templates, scheduledRuns, 
                   runningWorkflows, completedWorkflows>>

\* Complete entire workflow
CompleteWorkflow(iid) ==
    /\ iid \in runningWorkflows
    /\ \E instance \in instances :
        /\ instance.id = iid
        /\ instance.status = "running"
        /\ LET 
               template == GetTemplate(instance.templateId)
               allStepsComplete == \A step \in {template.steps[i] : i \in 1..Len(template.steps)} :
                   instance.stepStates[step] \in {"success", "skipped"}
           IN
           /\ allStepsComplete
           /\ instances' = (instances \ {instance}) \cup 
                  {[instance EXCEPT 
                      !.status = "completed",
                      !.result = "success"
                   ]}
           /\ runningWorkflows' = runningWorkflows \ {iid}
           /\ completedWorkflows' = completedWorkflows \cup {iid}
           /\ workflowAuditLog' = Append(workflowAuditLog, [
                  user |-> "system",
                  action |-> "complete_workflow",
                  templateId |-> instance.templateId,
                  instanceId |-> iid,
                  tenant |-> instance.tenantId,
                  timestamp |-> Len(workflowAuditLog)
              ])
    /\ UNCHANGED <<userLevels, userTenants, templates, scheduledRuns>>

\* Fail entire workflow
FailWorkflow(iid) ==
    /\ iid \in runningWorkflows
    /\ \E instance \in instances :
        /\ instance.id = iid
        /\ instance.status = "running"
        /\ LET 
               template == GetTemplate(instance.templateId)
               hasFailedStep == \E step \in {template.steps[i] : i \in 1..Len(template.steps)} :
                   /\ instance.stepStates[step] = "failed"
                   /\ instance.retryCount[step] >= MaxRetries
           IN
           /\ hasFailedStep
           /\ instances' = (instances \ {instance}) \cup 
                  {[instance EXCEPT 
                      !.status = "failed",
                      !.result = "failure"
                   ]}
           /\ runningWorkflows' = runningWorkflows \ {iid}
           /\ completedWorkflows' = completedWorkflows \cup {iid}
           /\ workflowAuditLog' = Append(workflowAuditLog, [
                  user |-> "system",
                  action |-> "fail_workflow",
                  templateId |-> instance.templateId,
                  instanceId |-> iid,
                  tenant |-> instance.tenantId,
                  timestamp |-> Len(workflowAuditLog)
              ])
    /\ UNCHANGED <<userLevels, userTenants, templates, scheduledRuns>>

\* Admin user cancels a running workflow
CancelWorkflow(user, iid) ==
    /\ iid \in runningWorkflows
    /\ \E instance \in instances :
        /\ instance.id = iid
        /\ CanExecuteWorkflow(user, instance.tenantId)
        /\ instance.status = "running"
        /\ instances' = (instances \ {instance}) \cup 
               {[instance EXCEPT 
                   !.status = "cancelled",
                   !.result = "cancelled"
                ]}
        /\ runningWorkflows' = runningWorkflows \ {iid}
        /\ completedWorkflows' = completedWorkflows \cup {iid}
        /\ workflowAuditLog' = Append(workflowAuditLog, [
               user |-> user,
               action |-> "cancel_workflow",
               templateId |-> instance.templateId,
               instanceId |-> iid,
               tenant |-> instance.tenantId,
               timestamp |-> Len(workflowAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, templates, scheduledRuns>>

-----------------------------------------------------------------------------
(* Scheduling *)

\* Schedule a workflow run
ScheduleWorkflow(user, tid, tenant, scheduledTime) ==
    /\ \E t \in templates :
        /\ t.id = tid
        /\ t.tenantId = tenant
        /\ CanExecuteWorkflow(user, tenant)
        /\ t.status = "active"
        /\ t.trigger \in {"scheduled", "manual"}
        /\ scheduledRuns' = scheduledRuns \cup {<<tid, tenant, scheduledTime>>}
        /\ workflowAuditLog' = Append(workflowAuditLog, [
               user |-> user,
               action |-> "schedule_workflow",
               templateId |-> tid,
               instanceId |-> 0,
               tenant |-> tenant,
               timestamp |-> Len(workflowAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, templates, instances, 
                   runningWorkflows, completedWorkflows>>

\* System triggers a scheduled workflow
TriggerScheduled(tid, tenant, scheduledTime, iid) ==
    /\ <<tid, tenant, scheduledTime>> \in scheduledRuns
    /\ Len(workflowAuditLog) >= scheduledTime
    /\ \E t \in templates :
        /\ t.id = tid
        /\ t.tenantId = tenant
        /\ t.status = "active"
        /\ CountRunningForTenant(tenant) < MaxConcurrentRuns
        /\ iid \notin {i.id : i \in instances}
        /\ LET 
               initialStepStates == [s \in WorkflowSteps |-> 
                   IF s \in {t.steps[i] : i \in 1..Len(t.steps)} 
                   THEN "pending" 
                   ELSE "skipped"]
               initialRetryCount == [s \in WorkflowSteps |-> 0]
               newInstance == [
                   id |-> iid,
                   templateId |-> tid,
                   tenantId |-> tenant,
                   status |-> "running",
                   startedBy |-> CHOOSE u \in Users : userTenants[u] = tenant /\ userLevels[u] >= 5,
                   startTime |-> Len(workflowAuditLog),
                   stepStates |-> initialStepStates,
                   retryCount |-> initialRetryCount,
                   result |-> "in_progress"
               ]
           IN
           /\ instances' = instances \cup {newInstance}
           /\ runningWorkflows' = runningWorkflows \cup {iid}
           /\ scheduledRuns' = scheduledRuns \ {<<tid, tenant, scheduledTime>>}
           /\ workflowAuditLog' = Append(workflowAuditLog, [
                  user |-> "system",
                  action |-> "trigger_scheduled",
                  templateId |-> tid,
                  instanceId |-> iid,
                  tenant |-> tenant,
                  timestamp |-> Len(workflowAuditLog)
              ])
    /\ UNCHANGED <<userLevels, userTenants, templates, completedWorkflows>>

-----------------------------------------------------------------------------
(* Next State Relation *)

Next ==
    \/ \E u \in Users, tid \in WorkflowTemplates, t \in Tenants, 
          steps \in Seq(WorkflowSteps), 
          deps \in [WorkflowSteps -> SUBSET WorkflowSteps],
          trigger \in {"manual", "scheduled", "event"}:
           CreateTemplate(u, tid, t, steps, deps, trigger)
    \/ \E u \in Users, tid \in WorkflowTemplates: ActivateTemplate(u, tid)
    \/ \E u \in Users, tid \in WorkflowTemplates: ArchiveTemplate(u, tid)
    \/ \E u \in Users, tid \in WorkflowTemplates, iid \in Nat: 
           StartWorkflow(u, tid, iid)
    \/ \E iid \in Nat, step \in WorkflowSteps: ExecuteStep(iid, step)
    \/ \E iid \in Nat, step \in WorkflowSteps: CompleteStep(iid, step)
    \/ \E iid \in Nat, step \in WorkflowSteps: FailStep(iid, step)
    \/ \E iid \in Nat, step \in WorkflowSteps: RetryStep(iid, step)
    \/ \E iid \in Nat: CompleteWorkflow(iid)
    \/ \E iid \in Nat: FailWorkflow(iid)
    \/ \E u \in Users, iid \in Nat: CancelWorkflow(u, iid)
    \/ \E u \in Users, tid \in WorkflowTemplates, t \in Tenants, time \in Nat:
           ScheduleWorkflow(u, tid, t, time)
    \/ \E tid \in WorkflowTemplates, t \in Tenants, time \in Nat, iid \in Nat:
           TriggerScheduled(tid, t, time, iid)

-----------------------------------------------------------------------------
(* Safety Properties *)

\* Only God-level users can create templates
GodOnlyTemplateCreation ==
    \A event \in 1..Len(workflowAuditLog):
        workflowAuditLog[event].action = "create_template" =>
            userLevels[workflowAuditLog[event].user] >= 5

\* Only Admin+ users can execute workflows
AdminOnlyExecution ==
    \A event \in 1..Len(workflowAuditLog):
        workflowAuditLog[event].action \in {"start_workflow", "cancel_workflow"} =>
            userLevels[workflowAuditLog[event].user] >= 4

\* Workflow instances belong to exactly one tenant
TenantIsolation ==
    \A i1, i2 \in instances:
        i1.id = i2.id => i1.tenantId = i2.tenantId

\* Running workflows don't exceed concurrency limit
ConcurrencyLimit ==
    \A t \in Tenants:
        CountRunningForTenant(t) <= MaxConcurrentRuns

\* Failed steps don't exceed retry limit
RetryLimit ==
    \A i \in instances, s \in WorkflowSteps:
        i.retryCount[s] <= MaxRetries

\* Completed workflows are not in running set
NoOverlap ==
    runningWorkflows \cap completedWorkflows = {}

\* Step dependencies are respected
DependencyEnforcement ==
    \A i \in instances, step \in WorkflowSteps:
        i.stepStates[step] \in {"running", "success"} =>
            StepDependenciesSatisfied(i, step)

\* All workflow events are audited
AuditCompleteness ==
    Len(workflowAuditLog) >= Cardinality(instances)

-----------------------------------------------------------------------------
(* Liveness Properties *)

\* Pending steps eventually execute (if dependencies are met)
EventualStepExecution ==
    \A i \in instances, step \in WorkflowSteps:
        (i.stepStates[step] = "pending" /\ StepDependenciesSatisfied(i, step)) ~>
            i.stepStates[step] \in {"running", "success", "failed"}

\* Running workflows eventually complete or fail
EventualCompletion ==
    \A iid \in Nat:
        iid \in runningWorkflows ~> iid \in completedWorkflows

\* Scheduled workflows eventually trigger
EventualScheduleTrigger ==
    \A tid \in WorkflowTemplates, t \in Tenants, time \in Nat:
        <<tid, t, time>> \in scheduledRuns ~>
            (<<tid, t, time>> \notin scheduledRuns \/ CountRunningForTenant(t) >= MaxConcurrentRuns)

-----------------------------------------------------------------------------
(* System Specification *)

Spec ==
    /\ Init
    /\ [][Next]_vars
    /\ \A iid \in Nat: WF_vars(CompleteWorkflow(iid))
    /\ \A iid \in Nat: WF_vars(FailWorkflow(iid))
    /\ \A iid \in Nat, step \in WorkflowSteps: WF_vars(ExecuteStep(iid, step))

-----------------------------------------------------------------------------
(* Invariants *)

Invariants ==
    /\ TypeOK
    /\ GodOnlyTemplateCreation
    /\ AdminOnlyExecution
    /\ TenantIsolation
    /\ ConcurrencyLimit
    /\ RetryLimit
    /\ NoOverlap
    /\ DependencyEnforcement
    /\ AuditCompleteness

=============================================================================
