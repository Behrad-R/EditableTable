import {
  assignPrototypeAPIs,
  assignTableAPIs,
  makeStateUpdater,
  setStateSlice,
  type Cell,
  type CellData,
  type Column,
  type OnChangeFn,
  type Row,
  type RowData,
  type Table,
  type TableFeature,
  type TableFeatures,
  type Updater,
} from '@tanstack/react-table'
import { setByPath } from './path'

// Working copies of the rows currently in edit mode, keyed by row id
export type RowEditingState = Record<string, unknown>

export interface TableState_RowEditing {
  rowEditing: RowEditingState
}

export interface TableOptions_RowEditing<
  TFeatures extends TableFeatures,
  TData extends RowData,
> {
  enableRowEditing?: boolean
  onRowEditingChange?: OnChangeFn<RowEditingState>
  // Called with the edited copy of the row when it is saved
  onRowSave?: (row: Row<TFeatures, TData>, updatedRow: TData) => void
}

export interface Table_RowEditing {
  setRowEditing: (updater: Updater<RowEditingState>) => void
  resetRowEditing: () => void
  getIsSomeRowsEditing: () => boolean
}

export interface Row_RowEditing<TData extends RowData> {
  getIsEditing: () => boolean
  // The working copy while editing, otherwise the original row
  getDraft: () => TData
  updateDraft: (updater: (draft: TData) => TData) => void
  startEditing: () => void
  saveEditing: () => void
  cancelEditing: () => void
}

export interface Column_RowEditing {
  getCanEdit: () => boolean
}

export interface Cell_RowEditing {
  getCanEdit: () => boolean
  // True when the row is in edit mode and the column can be edited
  getIsEditing: () => boolean
  getEditValue: () => unknown
  setEditValue: (value: unknown) => void
}

export interface ColumnDef_RowEditing<TData extends RowData, TValue extends CellData> {
  enableEditing?: boolean
  // Writes an edited value back into the row. Columns with an accessor key
  // default to writing the value to that (possibly nested) path, columns with
  // an accessor function are only editable when this is defined.
  updateValue?: (row: TData, value: TValue) => TData
}

declare module '@tanstack/react-table' {
  interface Plugins {
    rowEditingFeature: TableFeature
  }

  interface TableState_FeatureMap {
    rowEditingFeature: TableState_RowEditing
  }

  interface TableOptions_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    rowEditingFeature: TableOptions_RowEditing<TFeatures, TData>
  }

  interface Table_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    rowEditingFeature: Table_RowEditing
  }

  interface Row_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    rowEditingFeature: Row_RowEditing<TData>
  }

  interface Column_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    rowEditingFeature: Column_RowEditing
  }

  interface Cell_FeatureMap {
    rowEditingFeature: Cell_RowEditing
  }

  interface ColumnDef_FeatureMap<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData,
  > {
    rowEditingFeature: ColumnDef_RowEditing<TData, TValue>
  }
}

// The feature hooks are generic over any feature set, so the static functions
// below type their instances as if only this feature were registered
type Features = { rowEditingFeature: TableFeature }

function table_setRowEditing<TData extends RowData>(
  table: Table<Features, TData>,
  updater: Updater<RowEditingState>,
) {
  setStateSlice(table, 'rowEditing', updater)
}

function getRowEditingState<TData extends RowData>(table: Table<Features, TData>) {
  return table.atoms.rowEditing?.get() ?? {}
}

function removeDraft<TData extends RowData>(row: Row<Features, TData>) {
  table_setRowEditing(row.table, ({ [row.id]: _removed, ...rest }) => rest)
}

function row_getIsEditing<TData extends RowData>(row: Row<Features, TData>) {
  return row.id in getRowEditingState(row.table)
}

function row_getDraft<TData extends RowData>(row: Row<Features, TData>) {
  const state = getRowEditingState(row.table)
  return row.id in state ? (state[row.id] as TData) : row.original
}

function column_getCanEdit<TData extends RowData>(column: Column<Features, TData>) {
  const { enableEditing, updateValue } = column.columnDef
  const accessorKey = 'accessorKey' in column.columnDef ? column.columnDef.accessorKey : undefined

  return (
    column.table.options.enableRowEditing !== false &&
    enableEditing !== false &&
    (!!updateValue || accessorKey !== undefined)
  )
}

function cell_setEditValue<TData extends RowData>(cell: Cell<Features, TData>, value: unknown) {
  const { columnDef } = cell.column
const accessorKey = 'accessorKey' in columnDef ? columnDef.accessorKey : undefined

  cell.row.updateDraft((draft) =>
    columnDef.updateValue
      ? columnDef.updateValue(draft, value)
      : setByPath(draft, String(accessorKey), value),
  )
}

export const rowEditingFeature: TableFeature = {
  getInitialState: (initialState) => {
    return {
      rowEditing: {},
      ...initialState, // must come last
    }
  },

  getDefaultTableOptions: (table) => {
    return {
      enableRowEditing: true,
      onRowEditingChange: makeStateUpdater('rowEditing', table),
    }
  },

  constructTableAPIs: (table) => {
    const editingTable = table as unknown as Table<Features, RowData>

    assignTableAPIs('rowEditingFeature', table, {
      table_setRowEditing: {
        fn: (updater: Updater<RowEditingState>) => table_setRowEditing(editingTable, updater),
      },
      table_resetRowEditing: {
        fn: () => table_setRowEditing(editingTable, {}),
      },
      table_getIsSomeRowsEditing: {
        fn: () => Object.keys(getRowEditingState(editingTable)).length > 0,
      },
    })
  },

  assignRowPrototype: (prototype, table) => {
    assignPrototypeAPIs('rowEditingFeature', prototype, table, {
      row_getIsEditing: { fn: (row: Row<Features, RowData>) => row_getIsEditing(row) },
      row_getDraft: { fn: (row: Row<Features, RowData>) => row_getDraft(row) },
      row_updateDraft: {
        fn: (row: Row<Features, RowData>, updater: (draft: RowData) => RowData) =>
          table_setRowEditing(row.table, (old) => ({
            ...old,
            [row.id]: updater(row_getDraft(row)),
          })),
      },
      row_startEditing: {
        // Updates never mutate, so the draft can start out as the original row
        fn: (row: Row<Features, RowData>) =>
          table_setRowEditing(row.table, (old) => ({ ...old, [row.id]: row.original })),
      },
      row_saveEditing: {
        fn: (row: Row<Features, RowData>) => {
          row.table.options.onRowSave?.(row, row_getDraft(row))
          removeDraft(row)
        },
      },
      // The original row was never touched, so dropping the draft reverts it
      row_cancelEditing: { fn: (row: Row<Features, RowData>) => removeDraft(row) },
    })
  },

  assignColumnPrototype: (prototype, table) => {
    assignPrototypeAPIs('rowEditingFeature', prototype, table, {
      column_getCanEdit: { fn: (column: Column<Features, RowData>) => column_getCanEdit(column) },
    })
  },

  assignCellPrototype: (prototype, table) => {
    assignPrototypeAPIs('rowEditingFeature', prototype, table, {
      cell_getCanEdit: { fn: (cell: Cell<Features, RowData>) => cell.column.getCanEdit() },
      cell_getIsEditing: {
        fn: (cell: Cell<Features, RowData>) =>
          cell.column.getCanEdit() && cell.row.getIsEditing(),
      },
      cell_getEditValue: {
        fn: (cell: Cell<Features, RowData>) =>
          cell.column.accessorFn?.(cell.row.getDraft(), cell.row.index),
      },
      cell_setEditValue: {
        fn: (cell: Cell<Features, RowData>, value: unknown) => cell_setEditValue(cell, value),
      },
    })
  },
}
