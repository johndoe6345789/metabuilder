import type { ReactNode } from 'react'
import { Alert, AlertTitle, List, ListItem, ListItemText } from '@mui/material'

/**
 * Props for {@link ValidationSummary}.
 *
 * @property errors List of validation errors to display. Each entry can be a plain
 *   string message or a ReactNode for fully custom rendering (e.g. including links
 *   or emphasized text). The list is rendered as items in a bulleted list.
 * @property title Optional title rendered inside the error alert header. This
 *   is only shown when {@link ValidationSummaryProps.showTitle | showTitle} is
 *   `true`. Defaults to `"Please fix the following"`.
 * @property showTitle When `true` (default), renders an {@link AlertTitle} using
 *   the provided `title`. Set to `false` when you want to suppress the header and
 *   only show the list of errors.
 */
interface ValidationSummaryProps {
  errors: Array<string | ReactNode>
  title?: string
  showTitle?: boolean
}

/**
 * Displays a standardized validation error summary as an error {@link Alert}
 * containing an optional title and a bulleted list of errors.
 *
 * Renders nothing when the `errors` array is empty.
 */
export function ValidationSummary({
  errors,
  title = 'Please fix the following',
  showTitle = true,
}: ValidationSummaryProps) {
  if (!errors.length) return null

  return (
    <Alert severity="error" variant="outlined" sx={{ alignItems: 'flex-start' }}>
      {showTitle ? <AlertTitle>{title}</AlertTitle> : null}
      <List dense disablePadding component="ul" sx={{ pl: 3 }}>
        {errors.map((error, index) => (
          <ListItem
            key={index}
            disableGutters
            component="li"
            sx={{ py: 0.25, px: 0 }}
          >
            <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={error} />
          </ListItem>
        ))}
      </List>
    </Alert>
  )
}
