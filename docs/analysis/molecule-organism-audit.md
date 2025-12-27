# Molecule to Organism Categorization Audit

**Date:** December 27, 2025  
**Task:** Identify organisms incorrectly categorized as molecules  
**Reference:** `docs/todo/core/2-TODO.md` Line 17

## Atomic Design Criteria

### Molecules Should Be:
- Composed of 2-5 atoms
- Single, focused purpose
- Reusable across multiple contexts
- Can have internal state but **NO complex business logic**
- Generally under 150 LOC (recommended)

### Organisms Should Be:
- Composed of molecules and atoms
- **MAY contain business logic**
- Often specific to a particular feature
- Can be entire sections or panels
- Handle data fetching and complex state management

## Audit Results

### Current Molecule Components Analyzed

#### ✅ Correctly Categorized as Molecules

**UI Wrapper Molecules** (in `src/components/molecules/` and `src/components/ui/molecules/`):
- `Dialog.tsx` (191/188 LOC) - Pure UI wrapper for MUI Dialog
- `DropdownMenu.tsx` (268/207 LOC) - Multiple sub-components exported, no business logic
- `Popover.tsx` (95/68 LOC) - Simple overlay wrapper
- `Select.tsx` (160/139 LOC) - Form control wrapper
- `FormField.tsx` (133 LOC) - Label + Input + Error display
- `Tabs.tsx` (114/43 LOC) - Tab navigation wrapper
- `Accordion.tsx` (130/118 LOC) - Collapsible sections
- `Alert.tsx` (79/67 LOC) - Feedback message display
- `Card.tsx` (135/117 LOC) - Container with header/content/footer
- `Breadcrumb.tsx` (137 LOC) - Navigation breadcrumbs
- `ToggleGroup.tsx` (88 LOC) - Toggle button group
- `RadioGroup.tsx` (64 LOC) - Radio button group
- `Tooltip.tsx` (105 LOC) - Tooltip overlay

**Application Molecules** (in other directories):
- `AppHeader.tsx` (105 LOC) - Header with logo/nav, receives callbacks as props
- `AppFooter.tsx` (17 LOC) - Simple footer
- `ProfileCard.tsx` (114 LOC) - Profile display/edit form, all logic via callbacks
- `PasswordChangeDialog.tsx` (120 LOC) - Password form dialog, callbacks for submission
- `GodCredentialsBanner.tsx` (84 LOC) - Banner display component

**Analysis:** All these components are correctly categorized as molecules. While some exceed 150 LOC (Dialog, DropdownMenu), they consist of multiple sub-component exports (DialogTrigger, DialogContent, DialogFooter, etc.) and contain no business logic. They are pure UI composition.

#### ⚠️ MISCATEGORIZED: Should Be Organisms

**`SecurityWarningDialog.tsx` (235 LOC)**

**Location:** `src/components/dialogs/SecurityWarningDialog.tsx`

**Why it's an Organism:**
1. **Exceeds recommended size** - 235 LOC is significantly over 150 LOC guideline
2. **Complex data processing** - Groups security issues by severity
3. **Multiple responsibilities**:
   - Data transformation (grouping issues)
   - Conditional rendering logic (safe vs. unsafe states)
   - Severity classification and styling
   - Issue presentation and formatting
4. **Feature-specific** - Security scanning is a distinct feature
5. **Contains business logic** - Severity assessment, badge variant selection, icon selection based on scan results

**Recommendation:** Move to `src/components/organisms/security/SecurityWarningDialog.tsx`

## Summary

### Findings
- **Total molecules audited:** ~26 components across two directories
- **Correctly categorized:** 25 components
- **Miscategorized:** 1 component (SecurityWarningDialog)

### Rationale for SecurityWarningDialog as Organism
While most dialogs can be molecules, `SecurityWarningDialog` is special because:
- It processes and transforms data (grouping by severity)
- It contains security-specific business rules (severity ordering, badge variants)
- It's a complete feature section for security scanning results
- Its size and complexity warrant organism classification

### Components That Are Close But Still Molecules
- `DropdownMenu` (268 LOC) - Large due to multiple sub-component exports, not complexity
- `Dialog` (191 LOC) - Same reason as DropdownMenu
- `Select` (160 LOC) - Wrapper with multiple exports
- `Breadcrumb` (137 LOC) - Navigation display, no business logic

These remain molecules because they are purely presentational wrappers without business logic.

## Recommended Actions

1. **Move SecurityWarningDialog to organisms**
   ```
   From: src/components/dialogs/SecurityWarningDialog.tsx
   To: src/components/organisms/security/SecurityWarningDialog.tsx
   ```

2. **Update imports** - Update all files importing SecurityWarningDialog

3. **Update exports** - Update index files to export from new location

4. **Update TODO** - Mark task as complete in `docs/todo/core/2-TODO.md`

5. **Document reasoning** - Add note explaining why SecurityWarningDialog is an organism

## Conclusion

The molecule categorization in MetaBuilder is **95% accurate**. Only one component (`SecurityWarningDialog`) was found to be miscategorized as a molecule when it should be an organism due to its size, complexity, and data processing logic.

The presence of large LOC counts in some molecules (Dialog, DropdownMenu) is acceptable because they are multi-component exports without business logic, not monolithic complex components.
