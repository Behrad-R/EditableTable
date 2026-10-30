import { createColumnHelper } from '@tanstack/react-table'
import { ActionsCell, type EditableFeatures } from '../editable-table'
import type { Person } from './types'

const columnHelper = createColumnHelper<EditableFeatures, Person>()

// Defined at module level so the cell renderers keep a stable identity
// and inputs don't lose focus while typing
export const personColumns = columnHelper.columns([
  columnHelper.accessor('firstName', { header: 'First name' }),
  columnHelper.accessor('lastName', { header: 'Last name' }),
  columnHelper.accessor('age', {
    header: 'Age',
    updateValue: (row, age) => ({ ...row, age: Math.max(0, age) }),
  }),
  columnHelper.accessor('email', { header: 'Email' }),
  // Nested accessor keys are written back to the same path by default
  columnHelper.accessor('address.street', { header: 'Street' }),
  columnHelper.accessor('address.zip', { header: 'ZIP' }),
  columnHelper.accessor('address.city', { header: 'City' }),
  columnHelper.accessor((row) => row.tags.join(', '), {
    id: 'tags',
    header: 'Tags',
    updateValue: (row, tags) => ({
      ...row,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    }),
  }),
  columnHelper.display({ id: 'actions', header: 'Actions', cell: ActionsCell }),
])
