/**
 * Access Denied Component
 * 
 * Displays when a user attempts to access a resource they don't have permission for.
 */

interface AccessDeniedProps {
  requiredLevel: number
  userLevel: number
}

const levelNames: Record<number, string> = {
  0: 'Public',
  1: 'User',
  2: 'Moderator',
  3: 'Admin',
  4: 'God',
  5: 'Supergod',
}

export function AccessDenied({ requiredLevel, userLevel }: AccessDeniedProps) {
  const requiredLevelName = levelNames[requiredLevel] ?? `Level ${requiredLevel}`
  const userLevelName = levelNames[userLevel] ?? `Level ${userLevel}`

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '4rem auto',
      textAlign: 'center',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        color: '#d32f2f',
      }}>
        Access Denied
      </h1>
      
      <p style={{ 
        fontSize: '1.125rem', 
        marginBottom: '0.5rem',
        color: '#424242',
      }}>
        Your permission level is insufficient to access this page.
      </p>
      
      <div style={{ 
        margin: '1.5rem 0',
        padding: '1rem',
        backgroundColor: '#fff',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
      }}>
        <p style={{ marginBottom: '0.5rem', color: '#616161' }}>
          <strong>Your Level:</strong> {userLevelName} ({userLevel})
        </p>
        <p style={{ color: '#616161' }}>
          <strong>Required Level:</strong> {requiredLevelName} ({requiredLevel})
        </p>
      </div>
      
      <a 
        href="/" 
        style={{ 
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#1976d2',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          fontWeight: '500',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#1565c0'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#1976d2'
        }}
      >
        Return Home
      </a>
    </div>
  )
}
