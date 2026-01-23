# FakeMUI Archive - Legacy Code

**Created**: January 23, 2026
**Reason**: FakeMUI structure reorganization and cleanup

This directory contains code and files that are no longer actively used in the project but are preserved for reference.

## Contents

### Python Implementations
- `atoms.py`, `inputs.py`, `surfaces.py`, etc.
- **Status**: DEPRECATED - Not used by React frontend
- **Reason**: Original Python binding layer, replaced by TypeScript/React
- **Action**: Safe to delete after review

### Legacy QML Components
- `qml-legacy-components/` - Old QML component implementations (16 folders)
- `qml-legacy-widgets/` - Old QML widget library
- **Status**: DEPRECATED - Not used by web frontends
- **Reason**: For desktop QML UI, replaced by React components
- **Action**: Keep if Qt/QML desktop support is needed, otherwise delete

### Legacy Contexts
- `legacy-contexts/` - React Context implementations
- **Status**: Check for usage - may be consolidated into theming/
- **Action**: Review and consolidate into theming/ if needed

### Migration In Progress
- `migration-in-progress/` - Incomplete TypeScript migration files
- **Status**: INCOMPLETE - Unclear purpose
- **Action**: Review and delete if completed elsewhere

### Legacy SCSS
- `legacy-scss/scss/` - Old SCSS files
- **Status**: DEPRECATED - Functionality moved to theming/
- **Reason**: Consolidated into theming/ system
- **Action**: Safe to delete after verifying styles are in theming/

### Legacy Core Utilities
- `legacy-core-review/` - Old utility functions
- **Status**: REVIEW NEEDED - Verify if still in use
- **Action**: Check if core/ folder was properly consolidated

## New Structure (After Cleanup)

```
fakemui/
├── fakemui/                  # React components (organized)
│   ├── atoms/
│   ├── inputs/
│   ├── surfaces/
│   ├── layout/
│   ├── data-display/
│   ├── feedback/
│   ├── navigation/
│   ├── utils/
│   ├── lab/
│   └── x/
├── icons/                    # 421 SVG icons
├── theming/                  # Consolidated theme system
├── qml-components/           # Desktop QML (kept for Qt support)
├── styles/                   # SCSS modules
├── core/                     # Core utilities (review ongoing)
└── index.ts                  # Main export
```

## To Clean Up This Archive

**When confident that archived code is no longer needed**:

```bash
cd /Users/rmac/Documents/metabuilder/fakemui
git rm -r .archive
git commit -m "chore(fakemui): remove legacy archive after cleanup"
git push
```

## Review Checklist

Before deleting this archive:

- [ ] Verify all Python files have been replaced by TypeScript
- [ ] Confirm QML components are not used by any active frontend
- [ ] Check that React Contexts were consolidated into theming/
- [ ] Ensure core utilities are in the right location
- [ ] Verify no imports reference archived files
- [ ] Test all frontends build successfully
- [ ] Run full test suite

---

**Archive created by**: Reorganization script (scripts/reorganize-fakemui.sh)
**Last updated**: January 23, 2026
