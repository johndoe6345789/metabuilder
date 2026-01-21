import { DataSource, DataSourceType } from '@/types/json-ui'

export interface DataSourceManagerProps {
  dataSources: DataSource[]
  onChange: (dataSources: DataSource[]) => void
}
