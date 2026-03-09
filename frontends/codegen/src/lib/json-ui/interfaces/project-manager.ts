/**
 * ProjectManagerProps - JSON definition interface
 * Project manager dropdown with save/load/new/import/export
 *
 * The hook (useProjectManagerDropdown) is self-contained — it reads
 * currentProject from Redux (useProjectState) directly and loads
 * projects into Redux state without needing props from the parent.
 */
export interface ProjectManagerProps {
  /** No external props needed — all state managed internally by the hook */
}
