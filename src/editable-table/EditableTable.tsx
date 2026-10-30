import { useState } from 'react'
import { useTable, type ColumnDef, type RowData } from '@tanstack/react-table'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { EditableCell } from './EditableCell'
import { editableFeatures, type EditableFeatures } from './features'

const defaultColumn = { cell: EditableCell }

type EditableTableProps<TData extends RowData> = {
  columns: ReadonlyArray<ColumnDef<EditableFeatures, TData, any>>
  initialData: TData[]
  getRowId: (row: TData) => string
}

export function EditableTable<TData extends RowData>({
  columns,
  initialData,
  getRowId,
}: EditableTableProps<TData>) {
  const [data, setData] = useState(initialData)

  const table = useTable({
    features: editableFeatures,
    columns,
    data,
    defaultColumn,
    getRowId,
    onRowSave: (row, updatedRow) =>
      setData((prev) => prev.map((r) => (getRowId(r) === row.id ? updatedRow : r))),
  })

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell key={header.id} sx={{ fontWeight: 'bold' }}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} hover selected={row.getIsEditing()}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
