/** The header row, one column per field plus actions. */

export function EntityTableHead({ columns }: { columns: string[] }) {
  return (
      <thead style={{ backgroundColor: '#f5f5f5' }}>
        <tr>
          {columns.map(name => (
            <th
              key={name}
              style={{
                padding: '0.75rem',
                textAlign: 'left',
                borderBottom: '2px solid #e0e0e0',
              }}
            >
              {name}
            </th>
          ))}
          <th
            style={{
              padding: '0.75rem',
              textAlign: 'left',
              borderBottom: '2px solid #e0e0e0',
            }}
          >
            Actions
          </th>
        </tr>
      </thead>
  )
}
