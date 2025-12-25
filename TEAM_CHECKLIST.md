# 📋 Team Implementation Checklist

## Phase 1: Setup & Understanding (Day 1)

- [ ] Read `REFACTORING_QUICK_START.md` (15 mins)
- [ ] Read `docs/REFACTORING_ENFORCEMENT_GUIDE.md` (30 mins)
- [ ] Run `npx tsx /workspaces/metabuilder/scripts/enforce-size-limits.ts` (5 mins)
- [ ] Review the refactored example: `src/components/GitHubActionsFetcher.refactored.tsx`
- [ ] Check available hooks in `src/hooks/index.ts`
- [ ] Share findings with team in standup

## Phase 2: Individual Development (Ongoing)

### Before Writing Code
- [ ] Check if a similar component exists in `src/components/`
- [ ] Check if a similar hook exists in `src/hooks/`
- [ ] Plan component size (estimate LOC)
- [ ] Identify what needs to be in hook vs component

### During Development
- [ ] Keep components under 150 LOC
- [ ] Keep hooks under 100 LOC
- [ ] Use existing hooks when possible
- [ ] Extract business logic to hooks early
- [ ] Avoid deeply nested JSX (max 3 levels)
- [ ] Use TypeScript for type safety

### Before Committing
- [ ] Run size limit check locally: `npx tsx /workspaces/metabuilder/scripts/enforce-size-limits.ts`
- [ ] Verify all new files pass checks
- [ ] Run linter: `npm run lint`
- [ ] Run tests: `npm run test`

## Phase 3: Code Review (Pull Request)

### For PR Author
- [ ] Fill PR description with what changed
- [ ] Reference related issues
- [ ] List any breaking changes
- [ ] Include screenshot/demo if UI changes
- [ ] Wait for GitHub Actions to pass

### For PR Reviewer
- [ ] Check GitHub Actions passed (size limits, tests, linting)
- [ ] Review component structure
- [ ] Verify hooks are reusable
- [ ] Check for code duplication
- [ ] Verify TypeScript is correct
- [ ] Look for missed refactoring opportunities
- [ ] Run locally and test if needed

## Phase 4: Merge & Deployment

- [ ] All checks pass (GitHub Actions)
- [ ] At least 1 approval from maintainer
- [ ] Merge to main branch
- [ ] Deploy to staging (if applicable)
- [ ] Monitor for errors
- [ ] Deploy to production (if applicable)

## Phase 5: Large Component Refactoring

For each large component (>150 LOC):

### Planning (30 mins)
- [ ] Identify all component responsibilities
- [ ] List all useState/useRef/useContext hooks
- [ ] Identify API calls
- [ ] Identify side effects (useEffect)
- [ ] Sketch out new hook structure
- [ ] Sketch out component tree

### Hook Creation (1-2 hours)
- [ ] Create new hook file in `src/hooks/`
- [ ] Move non-rendering logic to hook
- [ ] Create interfaces for data structures
- [ ] Export hook and types
- [ ] Add JSDoc comments
- [ ] Keep hook under 100 LOC

### Component Decomposition (2-3 hours)
- [ ] Create child component files
- [ ] Move rendering to child components
- [ ] Each component under 150 LOC
- [ ] Pass data via props
- [ ] Handle callbacks via props

### Integration (1 hour)
- [ ] Create container component
- [ ] Use hook to get data
- [ ] Compose child components
- [ ] Wire user interactions
- [ ] Keep under 150 LOC

### Testing (1-2 hours)
- [ ] Write unit tests for hook
- [ ] Write component tests
- [ ] Test integration between parts
- [ ] Test error scenarios
- [ ] Verify old functionality preserved

### Verification (30 mins)
- [ ] Run size limit check
- [ ] Run linter
- [ ] Run tests
- [ ] Manual testing in browser
- [ ] Commit and push

## Maintenance Tasks

### Weekly
- [ ] Review size limits report
- [ ] Check for new violations
- [ ] Review PRs for size violations
- [ ] Answer team questions

### Monthly
- [ ] Audit hook reusability
- [ ] Look for duplicate hooks
- [ ] Update documentation if needed
- [ ] Review and update guidelines

### Quarterly
- [ ] Analyze codebase health metrics
- [ ] Plan next refactoring phase
- [ ] Update refactoring strategy
- [ ] Share learnings with team

## Common Scenarios

### Scenario: Component exceeds 150 LOC
1. Analyze why (too many responsibilities?)
2. Extract logic to hook
3. Break rendering into child components
4. Create container to wire together
5. Re-run size limit check
6. → Usually drops to 80-100 LOC

### Scenario: Hook exceeds 100 LOC
1. Analyze what the hook does
2. Look for sub-responsibilities
3. Break into multiple smaller hooks
4. Have main hook use other hooks
5. Export main hook
6. → Easier to test and reuse

### Scenario: Child component still too large
1. Check if it has multiple responsibilities
2. Extract state management to hook
3. Break rendering further
4. Consider if it should be a container + multiple UI components
5. Re-run size limit check

### Scenario: Duplicate code in multiple files
1. Extract to custom hook
2. Both files import and use hook
3. Remove duplicate code
4. Test both locations still work
5. → Better maintainability

## Success Stories

### Example 1: GitHubActionsFetcher
**Before**: 887 LOC (monolithic)
**After**: 
- `useGitHubFetcher.ts`: 65 LOC
- `useAutoRefresh.ts`: 48 LOC
- `GitHubActionsFetcher.tsx`: 85 LOC
- `WorkflowRunCard.tsx`: 48 LOC
- `WorkflowRunStatus.tsx`: 28 LOC
**Total**: ~275 LOC (69% reduction)
**Benefits**: More reusable, easier to test, easier to maintain

### Example 2: Form Component (Hypothetical)
**Before**: 350 LOC (mixed concerns)
**After**:
- `useForm.ts`: 80 LOC (handles validation, submission)
- `useFormField.ts`: 50 LOC (per-field logic)
- `FormComponent.tsx`: 120 LOC (renders form)
- `FormField.tsx`: 40 LOC (single field)
- `FormActions.tsx`: 30 LOC (buttons)
**Total**: ~320 LOC (9% reduction, much better structure)
**Benefits**: Form hook reusable in multiple contexts

## Resources & Links

### Quick Start
- `REFACTORING_QUICK_START.md` - Start here!
- `ARCHITECTURE_DIAGRAM.md` - Visual explanations

### Detailed Guides
- `docs/REFACTORING_ENFORCEMENT_GUIDE.md` - Full reference
- `docs/REFACTORING_QUICK_REFERENCE.md` - Code examples
- `docs/REFACTORING_STRATEGY.md` - Deep dive

### Code Examples
- `src/components/GitHubActionsFetcher.refactored.tsx` - Good example
- `src/hooks/useGitHubFetcher.ts` - Hook example
- `src/components/WorkflowRunCard.tsx` - Small component example

### Tools
- `scripts/enforce-size-limits.ts` - Size limit checker
- `.github/workflows/size-limits.yml` - CI/CD automation
- `.git/hooks/pre-commit` - Local enforcement

## FAQ - Team Questions

**Q: What if my component genuinely needs to be >150 LOC?**
A: Rare. Usually indicates multiple responsibilities. Try harder to decompose. Discuss with team lead if truly unavoidable.

**Q: Can I create a component just to hold state for child components?**
A: Yes! That's a "container component". The container handles logic/state, children handle rendering. Both stay under limits.

**Q: What if the hook and component are tightly coupled?**
A: That's fine. Many components have a corresponding hook (e.g., useMyForm + MyForm). Just keep both small and focused.

**Q: Should I test my hooks?**
A: Yes! Hooks are logic, components are rendering. Test logic separately. Use `renderHook` from React Testing Library.

**Q: What about styled-components / CSS modules?**
A: They don't count toward LOC limits (they're in separate files). Focus on TypeScript/TSX LOC only.

**Q: How do I handle complex state?**
A: Use custom hooks! Complex state management → custom hook. Makes it testable and reusable.

**Q: What if I need lots of props?**
A: If >5 props, consider:
1. Group related props into objects
2. Move some logic to container
3. Create multiple components instead of one mega-component

**Q: Can I import from my own hooks?**
A: Yes! Hooks can use other hooks. Example: `useForm` can use `useFormValidation`.

---

## Sign-Off

- [ ] I have read and understand these guidelines
- [ ] I commit to following these practices
- [ ] I will help others follow these practices
- [ ] I will report size limit violations

**Name & Date**: __________________________ , ______________

---

**Last Updated**: December 25, 2025
**Version**: 1.0
**Status**: 🟢 Active
