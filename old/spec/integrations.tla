---------------------------- MODULE integrations ----------------------------
(***************************************************************************
 * Integration Ecosystem Specification for MetaBuilder                     *
 *                                                                          *
 * This specification models the integration ecosystem including:          *
 *   - Webhook management and delivery                                     *
 *   - OAuth application framework                                         *
 *   - API key management                                                  *
 *   - Third-party app directory                                           *
 *   - Event subscriptions and filtering                                   *
 *   - Rate limiting and quota management                                  *
 ***************************************************************************)

EXTENDS Naturals, Sequences, FiniteSets, TLC

CONSTANTS
    Users,              \* Set of all users
    Tenants,            \* Set of tenants
    Webhooks,           \* Set of webhook IDs
    OAuthApps,          \* Set of OAuth application IDs
    APIKeys,            \* Set of API key IDs
    EventTypes,         \* Set of event types to subscribe to
    MaxWebhooksPerTenant,     \* Maximum webhooks per tenant
    MaxKeysPerUser,           \* Maximum API keys per user
    RateLimitPerHour          \* API calls allowed per hour

VARIABLES
    userLevels,         \* User -> Permission Level
    userTenants,        \* User -> Tenant
    webhookConfigs,     \* Set of webhook configurations
    webhookQueue,       \* Sequence of pending webhook deliveries
    webhookDeliveries,  \* Set of delivery records
    oauthApps,          \* Set of OAuth application records
    oauthTokens,        \* Set of OAuth token records
    apiKeys,            \* Set of API key records
    apiCallCounts,      \* (User/App, Hour) -> Call count
    eventSubscriptions, \* Set of event subscriptions
    integrationAuditLog \* Sequence of integration events

vars == <<userLevels, userTenants, webhookConfigs, webhookQueue, 
          webhookDeliveries, oauthApps, oauthTokens, apiKeys, 
          apiCallCounts, eventSubscriptions, integrationAuditLog>>

-----------------------------------------------------------------------------
(* Type Definitions *)

PermissionLevel == 1..6

WebhookStatus == {"active", "paused", "disabled"}
DeliveryStatus == {"pending", "success", "failed", "retrying"}
OAuthAppStatus == {"active", "suspended", "revoked"}
APIKeyStatus == {"active", "expired", "revoked"}

WebhookConfig == [
    id: Webhooks,
    tenantId: Tenants,
    ownerId: Users,
    url: STRING,
    status: WebhookStatus,
    events: SUBSET EventTypes,
    secret: STRING,
    createdAt: Nat
]

WebhookDelivery == [
    id: Nat,
    webhookId: Webhooks,
    eventType: EventTypes,
    payload: STRING,
    status: DeliveryStatus,
    attempts: Nat,
    timestamp: Nat
]

OAuthApp == [
    id: OAuthApps,
    tenantId: Tenants,
    ownerId: Users,
    name: STRING,
    status: OAuthAppStatus,
    scopes: SUBSET STRING,
    redirectUri: STRING,
    clientId: STRING,
    createdAt: Nat
]

OAuthToken == [
    id: Nat,
    appId: OAuthApps,
    userId: Users,
    tenantId: Tenants,
    accessToken: STRING,
    scopes: SUBSET STRING,
    expiresAt: Nat,
    createdAt: Nat
]

APIKey == [
    id: APIKeys,
    userId: Users,
    tenantId: Tenants,
    name: STRING,
    key: STRING,
    status: APIKeyStatus,
    scopes: SUBSET STRING,
    expiresAt: Nat,
    createdAt: Nat
]

EventSubscription == [
    id: Nat,
    subscriberId: Users \cup OAuthApps,
    tenantId: Tenants,
    eventType: EventTypes,
    filters: STRING,
    active: BOOLEAN
]

TypeOK ==
    /\ userLevels \in [Users -> PermissionLevel]
    /\ userTenants \in [Users -> Tenants]
    /\ webhookConfigs \subseteq WebhookConfig
    /\ webhookQueue \in Seq(WebhookDelivery)
    /\ webhookDeliveries \subseteq WebhookDelivery
    /\ oauthApps \subseteq OAuthApp
    /\ oauthTokens \subseteq OAuthToken
    /\ apiKeys \subseteq APIKey
    /\ apiCallCounts \in [(Users \cup OAuthApps) \X Nat -> Nat]
    /\ eventSubscriptions \subseteq EventSubscription
    /\ integrationAuditLog \in Seq([
           user: Users \cup {"system"},
           action: STRING,
           targetId: Nat \cup Webhooks \cup OAuthApps \cup APIKeys,
           tenant: Tenants,
           timestamp: Nat
       ])

-----------------------------------------------------------------------------
(* Permission Checks *)

\* Admin level (4+) required for integration management
CanManageIntegrations(user, tenant) ==
    /\ userLevels[user] >= 4
    /\ userTenants[user] = tenant

\* User level (2+) required for API keys
CanManageAPIKeys(user) ==
    userLevels[user] >= 2

-----------------------------------------------------------------------------
(* Helper Functions *)

\* Count webhooks for a tenant
CountWebhooksForTenant(tenant) ==
    Cardinality({w \in webhookConfigs : w.tenantId = tenant})

\* Count API keys for a user
CountKeysForUser(user) ==
    Cardinality({k \in apiKeys : k.userId = user /\ k.status = "active"})

\* Get API call count for current hour
GetCallCount(identity, hour) ==
    IF <<identity, hour>> \in DOMAIN apiCallCounts
    THEN apiCallCounts[<<identity, hour>>]
    ELSE 0

\* Check if rate limit exceeded
RateLimitExceeded(identity, hour) ==
    GetCallCount(identity, hour) >= RateLimitPerHour

-----------------------------------------------------------------------------
(* Initial State *)

Init ==
    /\ userLevels \in [Users -> PermissionLevel]
    /\ userTenants \in [Users -> Tenants]
    /\ webhookConfigs = {}
    /\ webhookQueue = <<>>
    /\ webhookDeliveries = {}
    /\ oauthApps = {}
    /\ oauthTokens = {}
    /\ apiKeys = {}
    /\ apiCallCounts = [x \in (Users \cup OAuthApps) \X Nat |-> 0]
    /\ eventSubscriptions = {}
    /\ integrationAuditLog = <<>>

-----------------------------------------------------------------------------
(* Webhook Operations *)

\* Admin creates a webhook
CreateWebhook(user, wid, url, events, secret) ==
    /\ CanManageIntegrations(user, userTenants[user])
    /\ wid \in Webhooks
    /\ wid \notin {w.id : w \in webhookConfigs}
    /\ CountWebhooksForTenant(userTenants[user]) < MaxWebhooksPerTenant
    /\ events \subseteq EventTypes
    /\ events /= {}
    /\ LET newWebhook == [
           id |-> wid,
           tenantId |-> userTenants[user],
           ownerId |-> user,
           url |-> url,
           status |-> "active",
           events |-> events,
           secret |-> secret,
           createdAt |-> Len(integrationAuditLog)
       ] IN
       /\ webhookConfigs' = webhookConfigs \cup {newWebhook}
       /\ integrationAuditLog' = Append(integrationAuditLog, [
              user |-> user,
              action |-> "create_webhook",
              targetId |-> wid,
              tenant |-> userTenants[user],
              timestamp |-> Len(integrationAuditLog)
          ])
    /\ UNCHANGED <<userLevels, userTenants, webhookQueue, webhookDeliveries,
                   oauthApps, oauthTokens, apiKeys, apiCallCounts, 
                   eventSubscriptions>>

\* Admin updates webhook status
UpdateWebhookStatus(user, wid, newStatus) ==
    /\ \E w \in webhookConfigs :
        /\ w.id = wid
        /\ CanManageIntegrations(user, w.tenantId)
        /\ newStatus \in WebhookStatus
        /\ webhookConfigs' = (webhookConfigs \ {w}) \cup 
               {[w EXCEPT !.status = newStatus]}
        /\ integrationAuditLog' = Append(integrationAuditLog, [
               user |-> user,
               action |-> "update_webhook_status",
               targetId |-> wid,
               tenant |-> w.tenantId,
               timestamp |-> Len(integrationAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, webhookQueue, webhookDeliveries,
                   oauthApps, oauthTokens, apiKeys, apiCallCounts, 
                   eventSubscriptions>>

\* System enqueues webhook delivery
EnqueueWebhook(wid, eventType, payload, deliveryId) ==
    /\ \E w \in webhookConfigs :
        /\ w.id = wid
        /\ w.status = "active"
        /\ eventType \in w.events
        /\ deliveryId \notin {d.id : d \in webhookDeliveries}
        /\ LET delivery == [
               id |-> deliveryId,
               webhookId |-> wid,
               eventType |-> eventType,
               payload |-> payload,
               status |-> "pending",
               attempts |-> 0,
               timestamp |-> Len(integrationAuditLog)
           ] IN
           /\ webhookQueue' = Append(webhookQueue, delivery)
           /\ webhookDeliveries' = webhookDeliveries \cup {delivery}
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, oauthApps, 
                   oauthTokens, apiKeys, apiCallCounts, eventSubscriptions,
                   integrationAuditLog>>

\* System attempts webhook delivery
AttemptDelivery(deliveryId) ==
    /\ Len(webhookQueue) > 0
    /\ \E d \in webhookDeliveries :
        /\ d.id = deliveryId
        /\ d.status \in {"pending", "retrying"}
        /\ webhookDeliveries' = (webhookDeliveries \ {d}) \cup
               {[d EXCEPT 
                   !.status = "success",
                   !.attempts = @ + 1
                ]}
        /\ webhookQueue' = Tail(webhookQueue)
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, oauthApps, 
                   oauthTokens, apiKeys, apiCallCounts, eventSubscriptions,
                   integrationAuditLog>>

\* Webhook delivery fails
FailDelivery(deliveryId) ==
    /\ \E d \in webhookDeliveries :
        /\ d.id = deliveryId
        /\ d.status \in {"pending", "retrying"}
        /\ d.attempts < 3
        /\ webhookDeliveries' = (webhookDeliveries \ {d}) \cup
               {[d EXCEPT 
                   !.status = "retrying",
                   !.attempts = @ + 1
                ]}
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, webhookQueue,
                   oauthApps, oauthTokens, apiKeys, apiCallCounts, 
                   eventSubscriptions, integrationAuditLog>>

\* Webhook delivery permanently fails
PermanentFailDelivery(deliveryId) ==
    /\ \E d \in webhookDeliveries :
        /\ d.id = deliveryId
        /\ d.status = "retrying"
        /\ d.attempts >= 3
        /\ webhookDeliveries' = (webhookDeliveries \ {d}) \cup
               {[d EXCEPT !.status = "failed"]}
        /\ webhookQueue' = SelectSeq(webhookQueue, LAMBDA x : x.id /= deliveryId)
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, oauthApps, 
                   oauthTokens, apiKeys, apiCallCounts, eventSubscriptions,
                   integrationAuditLog>>

-----------------------------------------------------------------------------
(* OAuth Application Management *)

\* Admin creates OAuth app
CreateOAuthApp(user, appId, name, scopes, redirectUri) ==
    /\ CanManageIntegrations(user, userTenants[user])
    /\ appId \in OAuthApps
    /\ appId \notin {a.id : a \in oauthApps}
    /\ LET newApp == [
           id |-> appId,
           tenantId |-> userTenants[user],
           ownerId |-> user,
           name |-> name,
           status |-> "active",
           scopes |-> scopes,
           redirectUri |-> redirectUri,
           clientId |-> "client_" \o appId,
           createdAt |-> Len(integrationAuditLog)
       ] IN
       /\ oauthApps' = oauthApps \cup {newApp}
       /\ integrationAuditLog' = Append(integrationAuditLog, [
              user |-> user,
              action |-> "create_oauth_app",
              targetId |-> appId,
              tenant |-> userTenants[user],
              timestamp |-> Len(integrationAuditLog)
          ])
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, webhookQueue,
                   webhookDeliveries, oauthTokens, apiKeys, apiCallCounts, 
                   eventSubscriptions>>

\* User authorizes OAuth app
AuthorizeOAuthApp(user, appId, tokenId, scopes) ==
    /\ \E app \in oauthApps :
        /\ app.id = appId
        /\ userTenants[user] = app.tenantId
        /\ app.status = "active"
        /\ scopes \subseteq app.scopes
        /\ tokenId \notin {t.id : t \in oauthTokens}
        /\ LET 
               currentTime == Len(integrationAuditLog)
               newToken == [
                   id |-> tokenId,
                   appId |-> appId,
                   userId |-> user,
                   tenantId |-> userTenants[user],
                   accessToken |-> "token_" \o tokenId,
                   scopes |-> scopes,
                   expiresAt |-> currentTime + 3600,
                   createdAt |-> currentTime
               ]
           IN
           /\ oauthTokens' = oauthTokens \cup {newToken}
           /\ integrationAuditLog' = Append(integrationAuditLog, [
                  user |-> user,
                  action |-> "authorize_oauth_app",
                  targetId |-> appId,
                  tenant |-> userTenants[user],
                  timestamp |-> currentTime
              ])
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, webhookQueue,
                   webhookDeliveries, oauthApps, apiKeys, apiCallCounts, 
                   eventSubscriptions>>

\* Admin revokes OAuth app
RevokeOAuthApp(user, appId) ==
    /\ \E app \in oauthApps :
        /\ app.id = appId
        /\ CanManageIntegrations(user, app.tenantId)
        /\ app.status /= "revoked"
        /\ oauthApps' = (oauthApps \ {app}) \cup 
               {[app EXCEPT !.status = "revoked"]}
        /\ integrationAuditLog' = Append(integrationAuditLog, [
               user |-> user,
               action |-> "revoke_oauth_app",
               targetId |-> appId,
               tenant |-> app.tenantId,
               timestamp |-> Len(integrationAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, webhookQueue,
                   webhookDeliveries, oauthTokens, apiKeys, apiCallCounts, 
                   eventSubscriptions>>

-----------------------------------------------------------------------------
(* API Key Management *)

\* User creates API key
CreateAPIKey(user, keyId, name, scopes, expiresAt) ==
    /\ CanManageAPIKeys(user)
    /\ keyId \in APIKeys
    /\ keyId \notin {k.id : k \in apiKeys}
    /\ CountKeysForUser(user) < MaxKeysPerUser
    /\ LET newKey == [
           id |-> keyId,
           userId |-> user,
           tenantId |-> userTenants[user],
           name |-> name,
           key |-> "key_" \o keyId,
           status |-> "active",
           scopes |-> scopes,
           expiresAt |-> expiresAt,
           createdAt |-> Len(integrationAuditLog)
       ] IN
       /\ apiKeys' = apiKeys \cup {newKey}
       /\ integrationAuditLog' = Append(integrationAuditLog, [
              user |-> user,
              action |-> "create_api_key",
              targetId |-> keyId,
              tenant |-> userTenants[user],
              timestamp |-> Len(integrationAuditLog)
          ])
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, webhookQueue,
                   webhookDeliveries, oauthApps, oauthTokens, apiCallCounts, 
                   eventSubscriptions>>

\* User revokes API key
RevokeAPIKey(user, keyId) ==
    /\ \E key \in apiKeys :
        /\ key.id = keyId
        /\ key.userId = user
        /\ key.status = "active"
        /\ apiKeys' = (apiKeys \ {key}) \cup 
               {[key EXCEPT !.status = "revoked"]}
        /\ integrationAuditLog' = Append(integrationAuditLog, [
               user |-> user,
               action |-> "revoke_api_key",
               targetId |-> keyId,
               tenant |-> userTenants[user],
               timestamp |-> Len(integrationAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, webhookQueue,
                   webhookDeliveries, oauthApps, oauthTokens, apiCallCounts, 
                   eventSubscriptions>>

\* System expires old API keys
ExpireAPIKey(keyId) ==
    /\ \E key \in apiKeys :
        /\ key.id = keyId
        /\ key.status = "active"
        /\ Len(integrationAuditLog) >= key.expiresAt
        /\ apiKeys' = (apiKeys \ {key}) \cup 
               {[key EXCEPT !.status = "expired"]}
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, webhookQueue,
                   webhookDeliveries, oauthApps, oauthTokens, apiCallCounts, 
                   eventSubscriptions, integrationAuditLog>>

-----------------------------------------------------------------------------
(* Rate Limiting *)

\* Record API call
RecordAPICall(identity, hour) ==
    /\ ~RateLimitExceeded(identity, hour)
    /\ apiCallCounts' = [apiCallCounts EXCEPT 
           ![<<identity, hour>>] = @ + 1]
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, webhookQueue,
                   webhookDeliveries, oauthApps, oauthTokens, apiKeys, 
                   eventSubscriptions, integrationAuditLog>>

-----------------------------------------------------------------------------
(* Event Subscriptions *)

\* Create event subscription
SubscribeToEvent(user, subId, eventType, filters) ==
    /\ CanManageIntegrations(user, userTenants[user])
    /\ subId \notin {s.id : s \in eventSubscriptions}
    /\ eventType \in EventTypes
    /\ LET newSub == [
           id |-> subId,
           subscriberId |-> user,
           tenantId |-> userTenants[user],
           eventType |-> eventType,
           filters |-> filters,
           active |-> TRUE
       ] IN
       /\ eventSubscriptions' = eventSubscriptions \cup {newSub}
       /\ integrationAuditLog' = Append(integrationAuditLog, [
              user |-> user,
              action |-> "subscribe_event",
              targetId |-> subId,
              tenant |-> userTenants[user],
              timestamp |-> Len(integrationAuditLog)
          ])
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, webhookQueue,
                   webhookDeliveries, oauthApps, oauthTokens, apiKeys, 
                   apiCallCounts>>

\* Unsubscribe from event
UnsubscribeFromEvent(user, subId) ==
    /\ \E sub \in eventSubscriptions :
        /\ sub.id = subId
        /\ sub.subscriberId = user
        /\ CanManageIntegrations(user, sub.tenantId)
        /\ eventSubscriptions' = (eventSubscriptions \ {sub}) \cup
               {[sub EXCEPT !.active = FALSE]}
        /\ integrationAuditLog' = Append(integrationAuditLog, [
               user |-> user,
               action |-> "unsubscribe_event",
               targetId |-> subId,
               tenant |-> sub.tenantId,
               timestamp |-> Len(integrationAuditLog)
           ])
    /\ UNCHANGED <<userLevels, userTenants, webhookConfigs, webhookQueue,
                   webhookDeliveries, oauthApps, oauthTokens, apiKeys, 
                   apiCallCounts>>

-----------------------------------------------------------------------------
(* Next State Relation *)

Next ==
    \/ \E u \in Users, wid \in Webhooks, url \in STRING, 
          events \in SUBSET EventTypes, secret \in STRING:
           CreateWebhook(u, wid, url, events, secret)
    \/ \E u \in Users, wid \in Webhooks, status \in WebhookStatus:
           UpdateWebhookStatus(u, wid, status)
    \/ \E wid \in Webhooks, et \in EventTypes, payload \in STRING, did \in Nat:
           EnqueueWebhook(wid, et, payload, did)
    \/ \E did \in Nat: AttemptDelivery(did)
    \/ \E did \in Nat: FailDelivery(did)
    \/ \E did \in Nat: PermanentFailDelivery(did)
    \/ \E u \in Users, aid \in OAuthApps, name \in STRING,
          scopes \in SUBSET STRING, uri \in STRING:
           CreateOAuthApp(u, aid, name, scopes, uri)
    \/ \E u \in Users, aid \in OAuthApps, tid \in Nat, scopes \in SUBSET STRING:
           AuthorizeOAuthApp(u, aid, tid, scopes)
    \/ \E u \in Users, aid \in OAuthApps: RevokeOAuthApp(u, aid)
    \/ \E u \in Users, kid \in APIKeys, name \in STRING,
          scopes \in SUBSET STRING, exp \in Nat:
           CreateAPIKey(u, kid, name, scopes, exp)
    \/ \E u \in Users, kid \in APIKeys: RevokeAPIKey(u, kid)
    \/ \E kid \in APIKeys: ExpireAPIKey(kid)
    \/ \E identity \in (Users \cup OAuthApps), hour \in Nat:
           RecordAPICall(identity, hour)
    \/ \E u \in Users, sid \in Nat, et \in EventTypes, f \in STRING:
           SubscribeToEvent(u, sid, et, f)
    \/ \E u \in Users, sid \in Nat: UnsubscribeFromEvent(u, sid)

-----------------------------------------------------------------------------
(* Safety Properties *)

\* Admin-only integration management
AdminOnlyIntegrationManagement ==
    \A event \in 1..Len(integrationAuditLog):
        LET action == integrationAuditLog[event].action IN
        action \in {"create_webhook", "update_webhook_status", 
                    "create_oauth_app", "revoke_oauth_app",
                    "subscribe_event", "unsubscribe_event"} =>
            userLevels[integrationAuditLog[event].user] >= 4

\* Webhooks don't exceed tenant limit
WebhookTenantLimit ==
    \A t \in Tenants:
        CountWebhooksForTenant(t) <= MaxWebhooksPerTenant

\* API keys don't exceed user limit
APIKeyUserLimit ==
    \A u \in Users:
        CountKeysForUser(u) <= MaxKeysPerUser

\* Rate limits are enforced
RateLimitEnforcement ==
    \A identity \in (Users \cup OAuthApps), hour \in Nat:
        GetCallCount(identity, hour) <= RateLimitPerHour

\* Tenant isolation for webhooks
WebhookTenantIsolation ==
    \A w \in webhookConfigs:
        userTenants[w.ownerId] = w.tenantId

\* Tenant isolation for OAuth apps
OAuthAppTenantIsolation ==
    \A app \in oauthApps:
        userTenants[app.ownerId] = app.tenantId

\* Tenant isolation for API keys
APIKeyTenantIsolation ==
    \A key \in apiKeys:
        userTenants[key.userId] = key.tenantId

\* OAuth tokens match app tenants
TokenTenantConsistency ==
    \A token \in oauthTokens:
        \E app \in oauthApps:
            app.id = token.appId /\ app.tenantId = token.tenantId

\* Active deliveries are in queue
ActiveDeliveriesQueued ==
    \A d \in webhookDeliveries:
        d.status = "pending" =>
            \E i \in 1..Len(webhookQueue) : webhookQueue[i].id = d.id

-----------------------------------------------------------------------------
(* Liveness Properties *)

\* Webhook deliveries eventually complete or fail
EventualDeliveryCompletion ==
    \A did \in Nat:
        \E d \in webhookDeliveries :
            d.id = did /\ d.status = "pending" ~>
                d.status \in {"success", "failed"}

\* Failed deliveries eventually retry or permanently fail
EventualRetryOrFail ==
    \A did \in Nat:
        \E d \in webhookDeliveries :
            d.id = did /\ d.status = "retrying" ~>
                d.status \in {"success", "failed"}

\* Expired keys eventually get marked as expired
EventualExpiration ==
    \A kid \in APIKeys:
        \E key \in apiKeys :
            key.id = kid /\ key.status = "active" /\
            Len(integrationAuditLog) >= key.expiresAt ~>
                key.status = "expired"

-----------------------------------------------------------------------------
(* System Specification *)

Spec ==
    /\ Init
    /\ [][Next]_vars
    /\ \A did \in Nat: WF_vars(AttemptDelivery(did))
    /\ \A kid \in APIKeys: WF_vars(ExpireAPIKey(kid))

-----------------------------------------------------------------------------
(* Invariants *)

Invariants ==
    /\ TypeOK
    /\ AdminOnlyIntegrationManagement
    /\ WebhookTenantLimit
    /\ APIKeyUserLimit
    /\ RateLimitEnforcement
    /\ WebhookTenantIsolation
    /\ OAuthAppTenantIsolation
    /\ APIKeyTenantIsolation
    /\ TokenTenantConsistency
    /\ ActiveDeliveriesQueued

=============================================================================
