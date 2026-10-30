import type { CellContext, RowData } from '@tanstack/react-table'
import { IconButton, Stack, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import type { EditableFeatures } from './features'

export function ActionsCell<TData extends RowData>({
  row,
}: CellContext<EditableFeatures, TData, unknown>) {
  if (!row.getIsEditing()) {
    return (
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => row.startEditing()}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )
  }

  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Save">
        <IconButton size="small" color="primary" onClick={() => row.saveEditing()}>
          <SaveIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Cancel">
        <IconButton size="small" onClick={() => row.cancelEditing()}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}
