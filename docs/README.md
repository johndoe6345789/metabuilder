# MetaBuilder Documentation

Welcome to the MetaBuilder documentation. This directory contains comprehensive documentation organized into logical categories.

## Directory Structure

```
docs/
├── README.md (this file)
├── getting-started/
│   ├── README.md
│   ├── quick-start/
│   │   └── first-steps.md
│   ├── installation/
│   │   └── setup-guide.md
│   └── core-concepts/
│       ├── overview.md
│       ├── five-level-architecture.md
│       └── declarative-design.md
│
├── architecture/
│   ├── README.md
│   ├── system-design/
│   │   ├── overview.md
│   │   ├── data-driven-architecture.md
│   │   └── generic-page-system.md
│   ├── levels/
│   │   ├── level-1-public.md
│   │   ├── level-2-user.md
│   │   ├── level-3-admin.md
│   │   ├── level-4-god.md
│   │   └── level-5-supergod.md
│   └── multi-tenancy/
│       ├── overview.md
│       └── tenant-isolation.md
│
├── features/
│   ├── README.md
│   ├── authentication/
│   │   ├── login-system.md
│   │   ├── password-management.md
│   │   ├── god-credentials.md
│   │   └── first-login-flow.md
│   ├── database/
│   │   ├── overview.md
│   │   ├── schema-design.md
│   │   └── kv-persistence.md
│   ├── packages/
│   │   ├── system-overview.md
│   │   ├── structure-guide.md
│   │   ├── import-export.md
│   │   └── creating-packages.md
│   ├── lua-integration/
│   │   ├── overview.md
│   │   ├── runtime-guide.md
│   │   ├── snippet-library.md
│   │   └── best-practices.md
│   ├── workflows/
│   │   ├── system-overview.md
│   │   └── creating-workflows.md
│   └── theming/
│       ├── theme-editor.md
│       ├── dark-mode.md
│       └── customization.md
│
├── development/
│   ├── README.md
│   ├── declarative-components/
│   │   ├── overview.md
│   │   ├── component-hierarchy.md
│   │   ├── configuration.md
│   │   └── rendering.md
│   ├── modular-seed-data/
│   │   ├── overview.md
│   │   ├── package-structure.md
│   │   └── best-practices.md
│   ├── typescript-reduction/
│   │   ├── strategy.md
│   │   └── migration-guide.md
│   ├── nerd-mode/
│   │   ├── overview.md
│   │   ├── ide-features.md
│   │   └── github-integration.md
│   └── cruft-removal/
│       └── report.md
│
├── guides/
│   ├── README.md
│   ├── user-guides/
│   │   ├── getting-started.md
│   │   ├── profile-management.md
│   │   └── using-packages.md
│   ├── admin-guides/
│   │   ├── user-management.md
│   │   ├── content-moderation.md
│   │   └── system-configuration.md
│   ├── god-guides/
│   │   ├── page-builder.md
│   │   ├── component-hierarchy-editor.md
│   │   ├── workflow-editor.md
│   │   ├── schema-editor.md
│   │   ├── lua-editor.md
│   │   └── preview-mode.md
│   └── supergod-guides/
│       ├── tenant-management.md
│       ├── package-management.md
│       └── system-administration.md
│
├── packages/
│   ├── README.md
│   ├── built-in/
│   │   ├── irc-webchat.md
│   │   ├── forum.md
│   │   ├── guestbook.md
│   │   └── user-profile.md
│   └── creating-custom/
│       ├── overview.md
│       ├── folder-structure.md
│       ├── seed-data.md
│       ├── lua-scripts.md
│       └── static-content.md
│
├── api-reference/
│   ├── README.md
│   ├── database/
│   │   ├── overview.md
│   │   ├── users.md
│   │   ├── pages.md
│   │   ├── components.md
│   │   ├── workflows.md
│   │   ├── lua-scripts.md
│   │   └── routes.md
│   ├── lua-api/
│   │   ├── standard-library.md
│   │   ├── custom-functions.md
│   │   └── component-api.md
│   └── component-catalog/
│       ├── overview.md
│       ├── layout-components.md
│       ├── form-components.md
│       ├── data-display.md
│       └── navigation.md
│
├── security/
│   ├── README.md
│   ├── overview.md
│   ├── authentication.md
│   ├── authorization.md
│   ├── sandboxing/
│   │   ├── lua-sandbox.md
│   │   └── code-scanning.md
│   ├── best-practices/
│   │   ├── password-security.md
│   │   ├── data-protection.md
│   │   └── malicious-code-detection.md
│   └── email-security/
│       └── smtp-configuration.md
│
├── configuration/
│   ├── README.md
│   ├── smtp/
│   │   └── setup-guide.md
│   ├── credentials/
│   │   ├── default-passwords.md
│   │   └── expiry-settings.md
│   └── system/
│       ├── environment-variables.md
│       └── runtime-config.md
│
├── tutorials/
│   ├── README.md
│   ├── beginner/
│   │   ├── creating-first-page.md
│   │   ├── adding-components.md
│   │   └── basic-workflows.md
│   ├── intermediate/
│   │   ├── custom-lua-scripts.md
│   │   ├── complex-workflows.md
│   │   └── package-creation.md
│   └── advanced/
│       ├── procedural-generation.md
│       ├── custom-renderers.md
│       └── system-extensions.md
│
├── migration/
│   ├── README.md
│   ├── from-iteration-25/
│   │   └── changes.md
│   ├── from-iteration-26/
│   │   └── changes.md
│   └── version-history/
│       └── changelog.md
│
├── troubleshooting/
│   ├── README.md
│   ├── common-issues/
│   │   ├── login-problems.md
│   │   ├── package-errors.md
│   │   └── lua-runtime-errors.md
│   └── debugging/
│       ├── developer-tools.md
│       └── log-analysis.md
│
└── reference/
    ├── README.md
    ├── quick-reference.md
    ├── glossary.md
    ├── complete-iterations/
    │   ├── iteration-24.md
    │   ├── iteration-25.md
    │   └── iteration-26.md
    └── roadmap/
        └── future-features.md
```

## Quick Links

- [Quick Start Guide](./getting-started/quick-start/first-steps.md)
- [Five Level Architecture](./getting-started/core-concepts/five-level-architecture.md)
- [Package System Overview](./features/packages/system-overview.md)
- [Lua Integration Guide](./features/lua-integration/overview.md)
- [Security Best Practices](./security/best-practices/password-security.md)
- [API Reference](./api-reference/README.md)

## Documentation Standards

All documentation in this directory follows these standards:

1. **Markdown Format**: All files use GitHub-flavored markdown
2. **Code Examples**: Include practical, working examples
3. **Cross-References**: Link to related documentation
4. **Up-to-Date**: Documentation is updated with each iteration
5. **Comprehensive**: Cover both basic and advanced use cases

## Contributing to Documentation

When adding new documentation:

1. Place it in the appropriate category directory
2. Update the README.md in that directory
3. Add cross-references to related docs
4. Include code examples where applicable
5. Update this main README if adding new top-level categories
