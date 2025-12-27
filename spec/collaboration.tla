---------------------------- MODULE collaboration ----------------------------
(***************************************************************************
 * Real-Time Collaboration Specification for MetaBuilder                   *
 *                                                                          *
 * This specification models real-time collaboration features including:   *
 *   - Concurrent document editing with operational transformation         *
 *   - User presence and activity tracking                                 *
 *   - Commenting and mentioning system                                    *
 *   - Activity feeds and notifications                                    *
 *   - Conflict detection and resolution                                   *
 *   - Session management and connection handling                          *
 ***************************************************************************)

EXTENDS Naturals, Sequences, FiniteSets, TLC

CONSTANTS
    Users,              \* Set of all users
    Tenants,            \* Set of tenants
    Documents,          \* Set of documents
    MaxConcurrentEditors, \* Maximum concurrent editors per document
    MaxNotifications    \* Maximum pending notifications per user

VARIABLES
    userTenants,        \* User -> Tenant
    userSessions,       \* User -> Session state {active, idle, disconnected}
    documentOwners,     \* Document -> User (owner)
    documentTenants,    \* Document -> Tenant
    documentContent,    \* Document -> Sequence of operations
    documentEditors,    \* Document -> Set of Users (currently editing)
    userPresence,       \* User -> {online, idle, offline}
    comments,           \* Set of comment records
    mentions,           \* Set of mention records
    notifications,      \* User -> Sequence of notifications
    activityFeed,       \* Tenant -> Sequence of activities
    versionHistory      \* Document -> Sequence of versions

vars == <<userTenants, userSessions, documentOwners, documentTenants,
          documentContent, documentEditors, userPresence, comments, 
          mentions, notifications, activityFeed, versionHistory>>

-----------------------------------------------------------------------------
(* Type Definitions *)

SessionState == {"active", "idle", "disconnected"}
PresenceState == {"online", "idle", "offline"}
OperationType == {"insert", "delete", "replace", "format"}

Operation == [
    type: OperationType,
    position: Nat,
    content: STRING,
    user: Users,
    timestamp: Nat
]

Comment == [
    id: Nat,
    documentId: Documents,
    userId: Users,
    tenantId: Tenants,
    content: STRING,
    position: Nat,
    timestamp: Nat,
    resolved: BOOLEAN
]

Mention == [
    id: Nat,
    commentId: Nat,
    mentionedUser: Users,
    mentioningUser: Users,
    tenantId: Tenants,
    timestamp: Nat,
    read: BOOLEAN
]

Notification == [
    id: Nat,
    userId: Users,
    type: STRING,
    sourceId: Nat,
    message: STRING,
    timestamp: Nat,
    read: BOOLEAN
]

Activity == [
    userId: Users,
    tenantId: Tenants,
    action: STRING,
    targetId: Nat,
    timestamp: Nat
]

Version == [
    documentId: Documents,
    content: Seq(Operation),
    createdBy: Users,
    timestamp: Nat,
    versionNumber: Nat
]

TypeOK ==
    /\ userTenants \in [Users -> Tenants]
    /\ userSessions \in [Users -> SessionState]
    /\ documentOwners \in [Documents -> Users]
    /\ documentTenants \in [Documents -> Tenants]
    /\ documentContent \in [Documents -> Seq(Operation)]
    /\ documentEditors \in [Documents -> SUBSET Users]
    /\ userPresence \in [Users -> PresenceState]
    /\ comments \subseteq Comment
    /\ mentions \subseteq Mention
    /\ notifications \in [Users -> Seq(Notification)]
    /\ activityFeed \in [Tenants -> Seq(Activity)]
    /\ versionHistory \in [Documents -> Seq(Version)]

-----------------------------------------------------------------------------
(* Permission Checks *)

\* User can access document if in same tenant
CanAccessDocument(user, doc) ==
    userTenants[user] = documentTenants[doc]

\* User can edit if they can access and not too many concurrent editors
CanEditDocument(user, doc) ==
    /\ CanAccessDocument(user, doc)
    /\ Cardinality(documentEditors[doc]) < MaxConcurrentEditors

\* User can comment if they can access
CanComment(user, doc) ==
    CanAccessDocument(user, doc)

-----------------------------------------------------------------------------
(* Helper Functions *)

\* Count pending notifications for a user
CountPendingNotifications(user) ==
    LET unread == {n \in 1..Len(notifications[user]) : 
                      ~notifications[user][n].read}
    IN Cardinality(unread)

\* Get comment by ID
GetComment(cid) ==
    CHOOSE c \in comments : c.id = cid

\* Check if user is mentioned in a comment
IsMentioned(user, comment) ==
    \E m \in mentions : 
        /\ m.commentId = comment.id
        /\ m.mentionedUser = user

-----------------------------------------------------------------------------
(* Initial State *)

Init ==
    /\ userTenants \in [Users -> Tenants]
    /\ userSessions = [u \in Users |-> "disconnected"]
    /\ documentOwners \in [Documents -> Users]
    /\ documentTenants \in [Documents -> Tenants]
    /\ documentContent = [d \in Documents |-> <<>>]
    /\ documentEditors = [d \in Documents |-> {}]
    /\ userPresence = [u \in Users |-> "offline"]
    /\ comments = {}
    /\ mentions = {}
    /\ notifications = [u \in Users |-> <<>>]
    /\ activityFeed = [t \in Tenants |-> <<>>]
    /\ versionHistory = [d \in Documents |-> <<>>]

-----------------------------------------------------------------------------
(* Session Management *)

\* User connects and becomes active
UserConnect(user) ==
    /\ userSessions[user] = "disconnected"
    /\ userSessions' = [userSessions EXCEPT ![user] = "active"]
    /\ userPresence' = [userPresence EXCEPT ![user] = "online"]
    /\ activityFeed' = [activityFeed EXCEPT 
           ![userTenants[user]] = Append(@, [
               userId |-> user,
               tenantId |-> userTenants[user],
               action |-> "connected",
               targetId |-> 0,
               timestamp |-> Len(activityFeed[userTenants[user]])
           ])]
    /\ UNCHANGED <<userTenants, documentOwners, documentTenants, documentContent,
                   documentEditors, comments, mentions, notifications, versionHistory>>

\* User becomes idle
UserGoIdle(user) ==
    /\ userSessions[user] = "active"
    /\ userSessions' = [userSessions EXCEPT ![user] = "idle"]
    /\ userPresence' = [userPresence EXCEPT ![user] = "idle"]
    /\ UNCHANGED <<userTenants, documentOwners, documentTenants, documentContent,
                   documentEditors, comments, mentions, notifications, 
                   activityFeed, versionHistory>>

\* User disconnects
UserDisconnect(user) ==
    /\ userSessions[user] \in {"active", "idle"}
    /\ userSessions' = [userSessions EXCEPT ![user] = "disconnected"]
    /\ userPresence' = [userPresence EXCEPT ![user] = "offline"]
    /\ documentEditors' = [d \in Documents |-> 
           IF user \in documentEditors[d] 
           THEN documentEditors[d] \ {user}
           ELSE documentEditors[d]]
    /\ activityFeed' = [activityFeed EXCEPT 
           ![userTenants[user]] = Append(@, [
               userId |-> user,
               tenantId |-> userTenants[user],
               action |-> "disconnected",
               targetId |-> 0,
               timestamp |-> Len(activityFeed[userTenants[user]])
           ])]
    /\ UNCHANGED <<userTenants, documentOwners, documentTenants, documentContent,
                   comments, mentions, notifications, versionHistory>>

-----------------------------------------------------------------------------
(* Document Editing *)

\* User starts editing a document
StartEditing(user, doc) ==
    /\ userSessions[user] = "active"
    /\ CanEditDocument(user, doc)
    /\ user \notin documentEditors[doc]
    /\ documentEditors' = [documentEditors EXCEPT ![doc] = @ \cup {user}]
    /\ activityFeed' = [activityFeed EXCEPT 
           ![userTenants[user]] = Append(@, [
               userId |-> user,
               tenantId |-> userTenants[user],
               action |-> "start_editing",
               targetId |-> doc,
               timestamp |-> Len(activityFeed[userTenants[user]])
           ])]
    /\ UNCHANGED <<userTenants, userSessions, documentOwners, documentTenants,
                   documentContent, userPresence, comments, mentions, 
                   notifications, versionHistory>>

\* User stops editing a document
StopEditing(user, doc) ==
    /\ user \in documentEditors[doc]
    /\ documentEditors' = [documentEditors EXCEPT ![doc] = @ \ {user}]
    /\ activityFeed' = [activityFeed EXCEPT 
           ![userTenants[user]] = Append(@, [
               userId |-> user,
               tenantId |-> userTenants[user],
               action |-> "stop_editing",
               targetId |-> doc,
               timestamp |-> Len(activityFeed[userTenants[user]])
           ])]
    /\ UNCHANGED <<userTenants, userSessions, documentOwners, documentTenants,
                   documentContent, userPresence, comments, mentions, 
                   notifications, versionHistory>>

\* User applies an operation to a document
ApplyOperation(user, doc, op) ==
    /\ user \in documentEditors[doc]
    /\ userSessions[user] = "active"
    /\ CanAccessDocument(user, doc)
    /\ op.user = user
    /\ op.type \in OperationType
    /\ documentContent' = [documentContent EXCEPT 
           ![doc] = Append(@, op)]
    /\ activityFeed' = [activityFeed EXCEPT 
           ![userTenants[user]] = Append(@, [
               userId |-> user,
               tenantId |-> userTenants[user],
               action |-> "edit_document",
               targetId |-> doc,
               timestamp |-> Len(activityFeed[userTenants[user]])
           ])]
    /\ UNCHANGED <<userTenants, userSessions, documentOwners, documentTenants,
                   documentEditors, userPresence, comments, mentions, 
                   notifications, versionHistory>>

\* Create a version snapshot
CreateVersion(user, doc) ==
    /\ user = documentOwners[doc]
    /\ CanAccessDocument(user, doc)
    /\ LET 
           versionNum == Len(versionHistory[doc]) + 1
           newVersion == [
               documentId |-> doc,
               content |-> documentContent[doc],
               createdBy |-> user,
               timestamp |-> versionNum,
               versionNumber |-> versionNum
           ]
       IN
       /\ versionHistory' = [versionHistory EXCEPT 
              ![doc] = Append(@, newVersion)]
       /\ activityFeed' = [activityFeed EXCEPT 
              ![userTenants[user]] = Append(@, [
                  userId |-> user,
                  tenantId |-> userTenants[user],
                  action |-> "create_version",
                  targetId |-> doc,
                  timestamp |-> Len(activityFeed[userTenants[user]])
              ])]
    /\ UNCHANGED <<userTenants, userSessions, documentOwners, documentTenants,
                   documentContent, documentEditors, userPresence, comments, 
                   mentions, notifications>>

-----------------------------------------------------------------------------
(* Comments and Mentions *)

\* User adds a comment
AddComment(user, doc, cid, content, position) ==
    /\ userSessions[user] = "active"
    /\ CanComment(user, doc)
    /\ cid \notin {c.id : c \in comments}
    /\ LET newComment == [
           id |-> cid,
           documentId |-> doc,
           userId |-> user,
           tenantId |-> userTenants[user],
           content |-> content,
           position |-> position,
           timestamp |-> Len(activityFeed[userTenants[user]]),
           resolved |-> FALSE
       ] IN
       /\ comments' = comments \cup {newComment}
       /\ activityFeed' = [activityFeed EXCEPT 
              ![userTenants[user]] = Append(@, [
                  userId |-> user,
                  tenantId |-> userTenants[user],
                  action |-> "add_comment",
                  targetId |-> cid,
                  timestamp |-> Len(@)
              ])]
    /\ UNCHANGED <<userTenants, userSessions, documentOwners, documentTenants,
                   documentContent, documentEditors, userPresence, mentions, 
                   notifications, versionHistory>>

\* User mentions another user in a comment
MentionUser(user, mentionedUser, cid, mid) ==
    /\ userSessions[user] = "active"
    /\ \E c \in comments : c.id = cid /\ c.userId = user
    /\ userTenants[user] = userTenants[mentionedUser]
    /\ mid \notin {m.id : m \in mentions}
    /\ CountPendingNotifications(mentionedUser) < MaxNotifications
    /\ LET 
           comment == GetComment(cid)
           newMention == [
               id |-> mid,
               commentId |-> cid,
               mentionedUser |-> mentionedUser,
               mentioningUser |-> user,
               tenantId |-> userTenants[user],
               timestamp |-> Len(activityFeed[userTenants[user]]),
               read |-> FALSE
           ]
           newNotif == [
               id |-> mid,
               userId |-> mentionedUser,
               type |-> "mention",
               sourceId |-> cid,
               message |-> "You were mentioned in a comment",
               timestamp |-> Len(notifications[mentionedUser]),
               read |-> FALSE
           ]
       IN
       /\ mentions' = mentions \cup {newMention}
       /\ notifications' = [notifications EXCEPT 
              ![mentionedUser] = Append(@, newNotif)]
       /\ activityFeed' = [activityFeed EXCEPT 
              ![userTenants[user]] = Append(@, [
                  userId |-> user,
                  tenantId |-> userTenants[user],
                  action |-> "mention_user",
                  targetId |-> mid,
                  timestamp |-> Len(@)
              ])]
    /\ UNCHANGED <<userTenants, userSessions, documentOwners, documentTenants,
                   documentContent, documentEditors, userPresence, comments, 
                   versionHistory>>

\* User resolves a comment
ResolveComment(user, cid) ==
    /\ userSessions[user] = "active"
    /\ \E c \in comments : 
        /\ c.id = cid
        /\ CanAccessDocument(user, c.documentId)
        /\ ~c.resolved
        /\ comments' = (comments \ {c}) \cup {[c EXCEPT !.resolved = TRUE]}
        /\ activityFeed' = [activityFeed EXCEPT 
               ![userTenants[user]] = Append(@, [
                   userId |-> user,
                   tenantId |-> userTenants[user],
                   action |-> "resolve_comment",
                   targetId |-> cid,
                   timestamp |-> Len(@)
               ])]
    /\ UNCHANGED <<userTenants, userSessions, documentOwners, documentTenants,
                   documentContent, documentEditors, userPresence, mentions, 
                   notifications, versionHistory>>

-----------------------------------------------------------------------------
(* Notifications *)

\* User reads a notification
ReadNotification(user, notifIndex) ==
    /\ userSessions[user] = "active"
    /\ notifIndex \in 1..Len(notifications[user])
    /\ ~notifications[user][notifIndex].read
    /\ LET 
           notif == notifications[user][notifIndex]
           updatedNotif == [notif EXCEPT !.read = TRUE]
       IN
       /\ notifications' = [notifications EXCEPT 
              ![user] = [i \in 1..Len(@) |-> 
                  IF i = notifIndex THEN updatedNotif ELSE @[i]]]
       /\ UNCHANGED <<userTenants, userSessions, documentOwners, documentTenants,
                      documentContent, documentEditors, userPresence, comments, 
                      mentions, activityFeed, versionHistory>>

\* Clear all read notifications
ClearReadNotifications(user) ==
    /\ userSessions[user] = "active"
    /\ LET 
           unread == SelectSeq(notifications[user], LAMBDA n : ~n.read)
       IN
       /\ notifications' = [notifications EXCEPT ![user] = unread]
       /\ UNCHANGED <<userTenants, userSessions, documentOwners, documentTenants,
                      documentContent, documentEditors, userPresence, comments, 
                      mentions, activityFeed, versionHistory>>

-----------------------------------------------------------------------------
(* Next State Relation *)

Next ==
    \/ \E u \in Users: UserConnect(u)
    \/ \E u \in Users: UserGoIdle(u)
    \/ \E u \in Users: UserDisconnect(u)
    \/ \E u \in Users, d \in Documents: StartEditing(u, d)
    \/ \E u \in Users, d \in Documents: StopEditing(u, d)
    \/ \E u \in Users, d \in Documents, op \in Operation: 
           ApplyOperation(u, d, op)
    \/ \E u \in Users, d \in Documents: CreateVersion(u, d)
    \/ \E u \in Users, d \in Documents, cid \in Nat, 
          content \in STRING, pos \in Nat:
           AddComment(u, d, cid, content, pos)
    \/ \E u \in Users, mu \in Users, cid \in Nat, mid \in Nat:
           MentionUser(u, mu, cid, mid)
    \/ \E u \in Users, cid \in Nat: ResolveComment(u, cid)
    \/ \E u \in Users, idx \in Nat: ReadNotification(u, idx)
    \/ \E u \in Users: ClearReadNotifications(u)

-----------------------------------------------------------------------------
(* Safety Properties *)

\* Document access is tenant-isolated
DocumentTenantIsolation ==
    \A u \in Users, d \in Documents:
        u \in documentEditors[d] => userTenants[u] = documentTenants[d]

\* Concurrent editors don't exceed limit
ConcurrentEditorLimit ==
    \A d \in Documents:
        Cardinality(documentEditors[d]) <= MaxConcurrentEditors

\* Comments belong to document's tenant
CommentTenantConsistency ==
    \A c \in comments:
        c.tenantId = documentTenants[c.documentId]

\* Mentions are within same tenant
MentionTenantIsolation ==
    \A m \in mentions:
        userTenants[m.mentionedUser] = m.tenantId

\* Notifications don't exceed limit
NotificationLimit ==
    \A u \in Users:
        CountPendingNotifications(u) <= MaxNotifications

\* Only active users can edit
ActiveEditorsOnly ==
    \A u \in Users, d \in Documents:
        u \in documentEditors[d] => 
            userSessions[u] \in {"active", "idle"}

\* Disconnected users are not editing
DisconnectedNotEditing ==
    \A u \in Users:
        userSessions[u] = "disconnected" =>
            ~\E d \in Documents : u \in documentEditors[d]

\* Operations in document are from editors
OperationAuthorship ==
    \A d \in Documents:
        Len(documentContent[d]) > 0 =>
            \A i \in 1..Len(documentContent[d]):
                LET op == documentContent[d][i]
                IN CanAccessDocument(op.user, d)

\* Version snapshots preserve content
VersionConsistency ==
    \A d \in Documents:
        Len(versionHistory[d]) > 0 =>
            \A v \in 1..Len(versionHistory[d]):
                versionHistory[d][v].documentId = d

-----------------------------------------------------------------------------
(* Liveness Properties *)

\* Pending notifications eventually get read or cleared
EventualNotificationHandling ==
    \A u \in Users:
        (CountPendingNotifications(u) > 0) ~>
            (CountPendingNotifications(u) = 0 \/ userSessions[u] = "disconnected")

\* Comments with mentions eventually get read
EventualMentionRead ==
    \A m \in mentions:
        ~m.read ~> (m.read \/ userSessions[m.mentionedUser] = "disconnected")

\* Active editors eventually stop editing or disconnect
EventualStopEditing ==
    \A u \in Users, d \in Documents:
        u \in documentEditors[d] ~>
            (u \notin documentEditors[d] \/ userSessions[u] = "disconnected")

-----------------------------------------------------------------------------
(* System Specification *)

Spec ==
    /\ Init
    /\ [][Next]_vars
    /\ \A u \in Users, d \in Documents: WF_vars(StopEditing(u, d))

-----------------------------------------------------------------------------
(* Invariants *)

Invariants ==
    /\ TypeOK
    /\ DocumentTenantIsolation
    /\ ConcurrentEditorLimit
    /\ CommentTenantConsistency
    /\ MentionTenantIsolation
    /\ NotificationLimit
    /\ ActiveEditorsOnly
    /\ DisconnectedNotEditing
    /\ OperationAuthorship
    /\ VersionConsistency

=============================================================================
