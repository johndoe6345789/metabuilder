'use client'

/** The compact/normal/large switch. */

export function SizeControl({
  selectedSize,
  setSelectedSize,
}: {
  selectedSize: 'compact' | 'normal' | 'large'
  setSelectedSize: (size: 'compact' | 'normal' | 'large') => void
}) {
  return (
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#495057',
              textTransform: 'uppercase',
            }}
          >
            Size Variant
          </label>
          <select
            value={selectedSize}
            onChange={e => {
              setSelectedSize(
                e.target.value as 'compact' | 'normal' | 'large'
              )
            }}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '10px',
              border: '1px solid #dee2e6',
              backgroundColor: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
          </select>
        </div>
  )
}
