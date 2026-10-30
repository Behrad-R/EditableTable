import type { CellContext, RowData } from '@tanstack/react-table'
import { TextField } from '@mui/material'
import type { EditableFeatures } from './features'

// Used as the default cell, so every editable column renders an input in edit mode
export function EditableCell<TData extends RowData>({
  cell,
  renderValue,
}: CellContext<EditableFeatures, TData, unknown>) {
  // The edit value is read from table state through `cell`, whose identity doesn't
  // change while typing, so the compiler would otherwise cache a stale value
  'use no memo'

  if (!cell.getIsEditing()) return renderValue() as string | number | null

  const value = cell.getEditValue() as string | number
  const isNumber = typeof value === 'number'

  return (
    <TextField
      variant="standard"
      size="small"
      fullWidth
      type={isNumber ? 'number' : 'text'}
      value={value}
      onChange={(e) =>
        cell.setEditValue(isNumber ? Number(e.target.value) : e.target.value)
      }
    />
  )
}
