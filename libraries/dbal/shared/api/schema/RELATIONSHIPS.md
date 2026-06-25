# Entity Relationship Schema Specification
**Version**: 2.0
**Date**: 2026-02-04

---

## Relationship Types

MetaBuilder entity schemas support all standard relationship patterns using explicit `relations` declarations.

### 1. One-to-One (1:1)

**Pattern**: User has one Profile, Profile belongs to one User

```yaml
entity: User
fields:
  id: {type: uuid, primary: true}
  username: {type: string, required: true}
relations:
  profile:
    type: one-to-one
    entity: Profile
    foreign_key: userId    # Field in Profile that points to User

entity: Profile
fields:
  id: {type: uuid, primary: true}
  userId: {type: uuid, required: true, unique: true}
  bio: {type: text}
relations:
  user:
    type: belongs-to
    entity: User
    foreign_key: userId    # This field
```

### 2. One-to-Many (1:N)

**Pattern**: User has many Posts, Post belongs to one User

```yaml
entity: User
fields:
  id: {type: uuid, primary: true}
  username: {type: string}
relations:
  posts:
    type: has-many
    entity: Post
    foreign_key: authorId   # Field in Post

entity: Post
fields:
  id: {type: uuid, primary: true}
  title: {type: string}
  authorId: {type: uuid, required: true}
relations:
  author:
    type: belongs-to
    entity: User
    foreign_key: authorId   # This field
```

### 3. Many-to-Many (M:N)

**Pattern**: User has many Roles, Role has many Users (through UserRole join table)

```yaml
entity: User
fields:
  id: {type: uuid, primary: true}
  username: {type: string}
relations:
  roles:
    type: many-to-many
    entity: Role
    through: UserRole        # Join table name
    foreign_key: userId      # FK in UserRole
    target_key: roleId       # Other FK in UserRole

entity: Role
fields:
  id: {type: uuid, primary: true}
  name: {type: string}
relations:
  users:
    type: many-to-many
    entity: User
    through: UserRole
    foreign_key: roleId
    target_key: userId

entity: UserRole
fields:
  id: {type: uuid, primary: true}
  userId: {type: uuid, required: true}
  roleId: {type: uuid, required: true}
  assignedAt: {type: bigint}
indexes:
  - fields: [userId, roleId]
    unique: true
relations:
  user:
    type: belongs-to
    entity: User
    foreign_key: userId
  role:
    type: belongs-to
    entity: Role
    foreign_key: roleId
```

### 4. Self-Referential (Tree/Graph)

**Pattern**: Category has parent Category (recursive hierarchy)

```yaml
entity: Category
fields:
  id: {type: uuid, primary: true}
  name: {type: string}
  parentId: {type: uuid, nullable: true}
relations:
  parent:
    type: belongs-to
    entity: Category        # Self-reference
    foreign_key: parentId
    nullable: true
  children:
    type: has-many
    entity: Category        # Self-reference
    foreign_key: parentId
```

### 5. Polymorphic (Generic Relations)

**Pattern**: Comment can belong to Post OR Video OR Product

```yaml
entity: Comment
fields:
  id: {type: uuid, primary: true}
  content: {type: text}
  commentableId: {type: uuid, required: true}
  commentableType: {type: string, required: true}  # "Post", "Video", "Product"
indexes:
  - fields: [commentableId, commentableType]
relations:
  commentable:
    type: polymorphic
    foreign_key: commentableId
    type_key: commentableType
    entities:
      - Post
      - Video
      - Product

entity: Post
fields:
  id: {type: uuid, primary: true}
  title: {type: string}
relations:
  comments:
    type: has-many
    entity: Comment
    polymorphic: true
    as: commentable         # Matches relation name in Comment
```

### 6. Through Relationships (Has-Many-Through)

**Pattern**: Country has many Users through Cities

```yaml
entity: Country
fields:
  id: {type: uuid, primary: true}
  name: {type: string}
relations:
  cities:
    type: has-many
    entity: City
    foreign_key: countryId
  users:
    type: has-many-through
    entity: User
    through: City            # Intermediate entity
    source_key: countryId    # FK in City → Country
    target_key: cityId       # FK in User → City

entity: City
fields:
  id: {type: uuid, primary: true}
  name: {type: string}
  countryId: {type: uuid, required: true}
relations:
  country:
    type: belongs-to
    entity: Country
    foreign_key: countryId
  users:
    type: has-many
    entity: User
    foreign_key: cityId

entity: User
fields:
  id: {type: uuid, primary: true}
  name: {type: string}
  cityId: {type: uuid, required: true}
relations:
  city:
    type: belongs-to
    entity: City
    foreign_key: cityId
  country:
    type: has-one-through
    entity: Country
    through: City
    source_key: cityId       # User.cityId
    target_key: countryId    # City.countryId
```

---

## Relation Field Specification

### Required Fields

```yaml
relations:
  <relation_name>:
    type: <relationship_type>     # Required
    entity: <target_entity>       # Required
    foreign_key: <field_name>     # Required (except polymorphic)
```

### Optional Fields

```yaml
relations:
  <relation_name>:
    # Optional configuration
    nullable: true|false          # Can relation be null? (default: false)
    cascade_delete: true|false    # Delete related records? (default: false)
    cascade_update: true|false    # Update related FKs? (default: false)
    on_delete: cascade|set_null|restrict|no_action   # FK constraint
    on_update: cascade|set_null|restrict|no_action   # FK constraint
    eager_load: true|false        # Auto-load in queries? (default: false)
    inverse_of: <relation_name>   # Name of inverse relation
```

### Polymorphic-Specific Fields

```yaml
relations:
  commentable:
    type: polymorphic
    foreign_key: commentableId
    type_key: commentableType     # Required - field storing entity type
    entities: [Post, Video]       # Required - allowed entity types
```

### Many-to-Many Specific Fields

```yaml
relations:
  roles:
    type: many-to-many
    entity: Role
    through: UserRole             # Required - join table
    foreign_key: userId           # Required - FK in join table
    target_key: roleId            # Required - other FK in join table
    attributes: [assignedAt]      # Optional - extra fields from join table
```

---

## Relationship Types Summary

| Type | Description | Example |
|------|-------------|---------|
| `belongs-to` | N:1 relationship | Post → User (many posts belong to one user) |
| `has-one` | 1:1 relationship | User → Profile (one user has one profile) |
| `has-many` | 1:N relationship | User → Posts (one user has many posts) |
| `many-to-many` | M:N via join table | User ↔ Roles (via UserRole) |
| `one-to-one` | 1:1 bidirectional | User ↔ Profile |
| `polymorphic` | N:1 to multiple types | Comment → Post\|Video\|Product |
| `has-many-through` | 1:N via intermediate | Country → Users (through Cities) |
| `has-one-through` | 1:1 via intermediate | User → Country (through City) |

---

## FK Constraints

### on_delete Behavior

| Value | Behavior |
|-------|----------|
| `cascade` | Delete related records when parent deleted |
| `set_null` | Set FK to NULL when parent deleted |
| `restrict` | Prevent deletion if related records exist |
| `no_action` | Database decides (usually same as restrict) |

### on_update Behavior

| Value | Behavior |
|-------|----------|
| `cascade` | Update FK when parent ID changes |
| `set_null` | Set FK to NULL when parent ID changes |
| `restrict` | Prevent update if related records exist |
| `no_action` | Database decides |

---

## Example: Full Forum Schema with Relations

```yaml
entity: ForumCategory
fields:
  id: {type: cuid, primary: true}
  name: {type: string, required: true}
  parentId: {type: cuid, nullable: true}
relations:
  parent:
    type: belongs-to
    entity: ForumCategory
    foreign_key: parentId
    nullable: true
    on_delete: set_null
  children:
    type: has-many
    entity: ForumCategory
    foreign_key: parentId
    cascade_delete: false
  threads:
    type: has-many
    entity: ForumThread
    foreign_key: categoryId
    cascade_delete: true

---

entity: ForumThread
fields:
  id: {type: cuid, primary: true}
  categoryId: {type: cuid, required: true}
  authorId: {type: uuid, required: true}
  title: {type: string, required: true}
relations:
  category:
    type: belongs-to
    entity: ForumCategory
    foreign_key: categoryId
    on_delete: cascade
  author:
    type: belongs-to
    entity: User
    foreign_key: authorId
    on_delete: restrict      # Can't delete user with threads
  posts:
    type: has-many
    entity: ForumPost
    foreign_key: threadId
    cascade_delete: true      # Delete posts when thread deleted

---

entity: ForumPost
fields:
  id: {type: cuid, primary: true}
  threadId: {type: cuid, required: true}
  authorId: {type: uuid, required: true}
  content: {type: text, required: true}
relations:
  thread:
    type: belongs-to
    entity: ForumThread
    foreign_key: threadId
    on_delete: cascade
  author:
    type: belongs-to
    entity: User
    foreign_key: authorId
    on_delete: restrict
```

---

## Implementation in C++ DBAL

### EntitySchemaLoader Enhancement

Add `RelationDef` struct:

```cpp
struct RelationDef {
    std::string name;
    std::string type;         // belongs-to, has-one, has-many, etc.
    std::string entity;       // Target entity name
    std::string foreignKey;   // FK field name
    std::optional<std::string> targetKey;    // For M:N
    std::optional<std::string> through;      // Join table for M:N
    std::optional<std::string> typeKey;      // For polymorphic
    std::vector<std::string> entities;       // For polymorphic
    bool nullable = false;
    bool cascadeDelete = false;
    bool cascadeUpdate = false;
    std::string onDelete = "restrict";
    std::string onUpdate = "no_action";
    bool eagerLoad = false;
};

struct EntitySchema {
    std::string name;
    std::vector<EntityField> fields;
    std::vector<EntityIndex> indexes;
    std::vector<RelationDef> relations;      // ← NEW
    ACLDefinition acl;
};
```

### Usage in Generic Operations

```cpp
// Eager loading example
auto result = adapter.read("users", userId);
if (result.isOk()) {
    auto user = result.getValue();

    // Auto-load relations marked eager_load: true
    auto schema = adapter.getEntitySchema("users");
    for (const auto& rel : schema.relations) {
        if (rel.eagerLoad) {
            if (rel.type == "belongs-to") {
                auto fkValue = user[rel.foreignKey];
                auto related = adapter.read(rel.entity, fkValue.get<std::string>());
                user[rel.name] = related.getValue();
            }
            else if (rel.type == "has-many") {
                Json filter = {{rel.foreignKey, user["id"]}};
                auto related = adapter.list(rel.entity, {.filter = filter});
                user[rel.name] = related.getValue().items;
            }
        }
    }
}
```

---

## Next Steps

1. **Update existing entity YAML files** to include relations
2. **Update EntitySchemaLoader** to parse relations
3. **Add relationship helpers** to generic adapters (e.g., `loadRelation()`, `saveWithRelations()`)
4. **Create Prisma schema generator** from YAML schemas (see next task)
