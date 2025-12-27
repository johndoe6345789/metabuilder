export function LuaContextInfo() {
  return (
    <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
      <div className="space-y-2 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Available in context:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            <code className="font-mono">context.data</code> - Input data
          </li>
          <li>
            <code className="font-mono">context.user</code> - Current user info
          </li>
          <li>
            <code className="font-mono">context.kv</code> - Key-value storage
          </li>
          <li>
            <code className="font-mono">context.log(msg)</code> - Logging function
          </li>
        </ul>
      </div>
    </div>
  )
}
