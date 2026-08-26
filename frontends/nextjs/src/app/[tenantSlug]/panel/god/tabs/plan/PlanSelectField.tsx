import s from './PlanTab.module.scss'

interface PlanSelectFieldProps {
  label: string
  value: string
  values: string[][]
  onChange: (value: string) => void
}

export function PlanSelectField(props: PlanSelectFieldProps) {
  return (
    <label className={s.field}>
      <span>{props.label}</span>
      <select
        value={props.value}
        onChange={event => {
          props.onChange(event.target.value)
        }}
      >
        {props.values.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
