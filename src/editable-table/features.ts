import { tableFeatures } from '@tanstack/react-table'
import { rowEditingFeature } from './rowEditingFeature'

export const editableFeatures = tableFeatures({
  rowEditingFeature,
})

export type EditableFeatures = typeof editableFeatures
