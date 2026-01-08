CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credentials (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_login INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE page_views (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    level INTEGER NOT NULL,
    layout TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_views_level ON page_views(level);
CREATE INDEX idx_page_views_is_active ON page_views(is_active);

CREATE TABLE component_hierarchy (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL,
    parent_id TEXT,
    component_type TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    props TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES page_views(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES component_hierarchy(id) ON DELETE CASCADE
);

CREATE INDEX idx_component_hierarchy_page_id ON component_hierarchy(page_id);
CREATE INDEX idx_component_hierarchy_parent_id ON component_hierarchy(parent_id);
CREATE INDEX idx_component_hierarchy_page_order ON component_hierarchy(page_id, "order");

CREATE TABLE workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    trigger TEXT NOT NULL,
    trigger_config TEXT NOT NULL,
    steps TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_workflows_trigger ON workflows(trigger);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);

CREATE TABLE packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    author TEXT NOT NULL,
    manifest TEXT NOT NULL,
    is_installed INTEGER NOT NULL DEFAULT 0,
    installed_at TEXT,
    installed_by TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (installed_by) REFERENCES users(id),
    UNIQUE(name, version)
);

CREATE INDEX idx_packages_is_installed ON packages(is_installed);

CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_credentials_timestamp 
AFTER UPDATE ON credentials
BEGIN
    UPDATE credentials SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_sessions_timestamp 
AFTER UPDATE ON sessions
BEGIN
    UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_page_views_timestamp 
AFTER UPDATE ON page_views
BEGIN
    UPDATE page_views SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_component_hierarchy_timestamp 
AFTER UPDATE ON component_hierarchy
BEGIN
    UPDATE component_hierarchy SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_workflows_timestamp 
AFTER UPDATE ON workflows
BEGIN
    UPDATE workflows SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_packages_timestamp 
AFTER UPDATE ON packages
BEGIN
    UPDATE packages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
