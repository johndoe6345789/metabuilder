import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'

export function NerdModeEmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <DescriptionOutlinedIcon fontSize="large" className="mx-auto mb-3 opacity-50" />
        <p>Select a file to edit</p>
      </div>
    </div>
  )
}
