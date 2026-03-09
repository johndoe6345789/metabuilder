export const DEMO_CODE = `import React from 'react'

function Counter() {
  const [count, setCount] = React.useState(0)
  
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem'
    }}>
      <h2 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0
      }}>
        Interactive Counter
      </h2>
      
      <div style={{
        fontSize: '4rem',
        fontWeight: 'bold',
        color: '#8b5cf6',
        padding: '2rem',
        background: 'rgba(139, 92, 246, 0.1)',
        borderRadius: '1rem',
        minWidth: '200px',
        textAlign: 'center'
      }}>
        {count}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setCount(count - 1)}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Decrement
        </button>
        
        <button
          onClick={() => setCount(0)}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Reset
        </button>
        
        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Increment
        </button>
      </div>
      
      <p style={{ 
        marginTop: '1rem',
        color: '#9ca3af',
        fontSize: '0.875rem'
      }}>
        Try editing the code on the left to see live changes!
      </p>
    </div>
  )
}

Counter`
