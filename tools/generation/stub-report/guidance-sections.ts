const recommendations = () => {
  let report = '## How to Fix Stub Implementations\n\n'

  report += '### Pattern: "Not Implemented" Errors\n\n'
  report += '```typescript\n'
  report += '// ❌ Stub\n'
  report += 'export function processData(data) {\n'
  report += '  throw new Error("not implemented")\n'
  report += '}\n\n'
  report += '// ✅ Real implementation\n'
  report += 'export function processData(data) {\n'
  report += '  return data.map(item => transform(item))\n'
  report += '}\n'
  report += '```\n\n'

  report += '### Pattern: Console.log Only\n\n'
  report += '```typescript\n'
  report += '// ❌ Stub\n'
  report += 'export function validateEmail(email) {\n'
  report += '  console.log("validating:", email)\n'
  report += '}\n\n'
  report += '// ✅ Real implementation\n'
  report += 'export function validateEmail(email: string): boolean {\n'
  report += '  return /^[^@]+@[^@]+\\.\\w+$/.test(email)\n'
  report += '}\n'
  report += '```\n\n'

  report += '### Pattern: Return null/undefined\n\n'
  report += '```typescript\n'
  report += '// ❌ Stub\n'
  report += 'export function fetchUserData(id: string) {\n'
  report += '  return null // TODO: implement API call\n'
  report += '}\n\n'
  report += '// ✅ Real implementation\n'
  report += 'export async function fetchUserData(id: string): Promise<User> {\n'
  report += '  const response = await fetch(`/api/users/${id}`)\n'
  report += '  return response.json()\n'
  report += '}\n'
  report += '```\n\n'

  report += '### Pattern: Placeholder Component\n\n'
  report += '```typescript\n'
  report += '// ❌ Stub\n'
  report += 'export function Dashboard() {\n'
  report += '  return <div>TODO: Build dashboard</div>\n'
  report += '}\n\n'
  report += '// ✅ Real implementation\n'
  report += 'export function Dashboard() {\n'
  report += '  return (\n'
  report += '    <div className="dashboard">\n'
  report += '      <Header />\n'
  report += '      <MainContent />\n'
  report += '      <Sidebar />\n'
  report += '    </div>\n'
  report += '  )\n'
  report += '}\n'
  report += '```\n\n'

  report += '### Pattern: Mock Data\n\n'
  report += '```typescript\n'
  report += '// ❌ Stub\n'
  report += 'export function getUsers() {\n'
  report += '  return [ // stub data\n'
  report += '    { id: 1, name: "John" },\n'
  report += '    { id: 2, name: "Jane" }\n'
  report += '  ]\n'
  report += '}\n\n'
  report += '// ✅ Real implementation\n'
  report += 'export async function getUsers(): Promise<User[]> {\n'
  report += '  const response = await Database.query("SELECT * FROM users")\n'
  report += '  return response.map(row => new User(row))\n'
  report += '}\n'
  report += '```\n\n'

  return report
}

const checklist = () => {
  let report = '## Checklist for Implementation\n\n'
  report += '- [ ] All critical stubs have been implemented\n'
  report += '- [ ] Functions have proper type signatures\n'
  report += '- [ ] Components render actual content (not placeholders)\n'
  report += '- [ ] All TODO/FIXME comments reference GitHub issues\n'
  report += '- [ ] Mock data is replaced with real data sources\n'
  report += '- [ ] Error handling is in place\n'
  report += '- [ ] Functions are tested with realistic inputs\n'
  report += '- [ ] Documentation comments are added (JSDoc)\n\n'
  return report
}

const bestPractices = () => {
  let report = '## Best Practices\n\n'
  report += '1. **Never commit stubs to main** - Use feature branches and require reviews\n'
  report += '2. **Use TypeScript types** - Force implementations by using specific return types\n'
  report += "3. **Convert stubs to issues** - Don't use TODO in code, create GitHub issues\n"
  report += '4. **Test from the start** - Write tests before implementing\n'
  report += '5. **Use linting rules** - Configure ESLint to catch console.log and TODO\n\n'
  return report
}

export const buildGuidanceSections = (): string => recommendations() + checklist() + bestPractices()
