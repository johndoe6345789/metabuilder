import { DataSource } from '@/types/json-ui'

export interface DataSourceCardProps {
  /**
   * The data source to display
   */
  dataSource: DataSource

  /**
   * Data sources that depend on this one
   */
  dependents?: DataSource[]

  /**
   * Callback when edit button is clicked
   */
  onEdit: (id: string) => void

  /**
   * Callback when delete button is clicked
   */
  onDelete: (id: string) => void
}
