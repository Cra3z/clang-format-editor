export type { CompletionField } from '@/lib/clangFormatSchema'
export { clangFormatFields, getCompletionFieldsForPath, getSchemaNodeForPath, getSchemaValueMeta } from '@/lib/clangFormatSchema'

import { clangFormatFields } from '@/lib/clangFormatSchema'

export const clangFormatFieldMap = new Map(
  clangFormatFields.map(field => [field.key.toLowerCase(), field]),
)
