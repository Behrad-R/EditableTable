// Untyped helpers for dot paths like `address.city`. Type safety comes from
// `createEditableColumnHelper`, which only accepts paths that exist on the row.

export function getByPath(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((value, key) => (value as Record<string, unknown>)?.[key], obj)
}

// Returns a copy of `obj` with the value at `path` replaced. Only the objects
// along the path are copied, everything else keeps its reference.
export function setByPath<T>(obj: T, path: string, value: unknown): T {
  const [key, ...rest] = path.split('.')
  const next = rest.length
    ? setByPath((obj as Record<string, unknown>)[key], rest.join('.'), value)
    : value

  if (Array.isArray(obj)) {
    const copy = [...obj]
    copy[Number(key)] = next
    return copy as T
  }

  return { ...obj, [key]: next }
}
